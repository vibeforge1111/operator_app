/**
 * Firestore Machines Service
 *
 * This service handles all Firestore operations for machine data.
 * Provides CRUD operations with proper error handling and validation.
 *
 * @fileoverview Firestore machines data layer
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, USE_MOCK_DATA } from './config';
import { Machine, MachineSchema } from '../../lib/validation/schemas';
import { MOCK_MACHINES } from '../../data/mockMachines';

// Collection reference
const MACHINES_COLLECTION = 'machines';
const machinesRef = collection(db, MACHINES_COLLECTION);

/**
 * Seed machines collection with mock data
 * Only runs if the collection is empty
 */
export async function seedMachines(): Promise<void> {
  // Skip seeding in mock data mode
  if (USE_MOCK_DATA) {
    console.log('🎭 Mock data mode - skipping Firebase seeding');
    return;
  }

  try {
    // Check if machines already exist
    const existingMachines = await getDocs(query(machinesRef, limit(1)));

    if (!existingMachines.empty) {
      console.log('🎯 Machines collection already seeded');
      return;
    }

    console.log('🌱 Seeding machines collection with mock data...');

    const batch = writeBatch(db);

    for (const machine of MOCK_MACHINES) {
      const machineDoc = doc(machinesRef);
      const machineData = {
        ...machine,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(machineDoc, machineData);
    }

    await batch.commit();
    console.log(`✅ Seeded ${MOCK_MACHINES.length} machines successfully`);

  } catch (error) {
    console.error('❌ Error seeding machines:', error);
    throw new Error('Failed to seed machines collection');
  }
}

/**
 * Get all machines with optional filtering and pagination
 */
export async function getMachines(options: {
  categoryFilter?: string;
  statusFilter?: string;
  availableOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'newest' | 'alphabetical' | 'revenue';
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
} = {}): Promise<{
  machines: Machine[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
}> {
  try {
    const {
      categoryFilter,
      statusFilter,
      availableOnly,
      searchQuery,
      sortBy = 'newest',
      limitCount = 20,
      lastDoc
    } = options;

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (categoryFilter && categoryFilter !== 'all') {
      constraints.push(where('category', '==', categoryFilter));
    }

    if (statusFilter && statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }

    // Note: availableOnly filter will be applied client-side due to Firestore limitations
    // (would need a composite index for operators.length < maxOperators)

    // Add sorting
    switch (sortBy) {
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'alphabetical':
        constraints.push(orderBy('name', 'asc'));
        break;
      case 'revenue':
        constraints.push(orderBy('earnings.total', 'desc'));
        break;
    }

    // Add pagination
    constraints.push(limit(limitCount + 1)); // Get one extra to check if there are more

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Execute query
    const querySnapshot = await getDocs(query(machinesRef, ...constraints));

    const machines: Machine[] = [];
    const docs = querySnapshot.docs;

    // Process results (excluding the extra document)
    const actualDocs = docs.slice(0, limitCount);

    for (const docSnapshot of actualDocs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };

      // Validate data against schema
      const validatedMachine = MachineSchema.parse(data);
      machines.push(validatedMachine);
    }

    // Apply client-side filters
    let filteredMachines = machines;

    // Available only filter
    if (availableOnly) {
      filteredMachines = filteredMachines.filter(machine =>
        machine.operators.length < machine.maxOperators
      );
    }

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMachines = filteredMachines.filter(machine =>
        machine.name.toLowerCase().includes(query) ||
        machine.description.toLowerCase().includes(query) ||
        machine.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return {
      machines: filteredMachines,
      lastDoc: actualDocs[actualDocs.length - 1],
      hasMore: docs.length > limitCount
    };

  } catch (error) {
    console.error('❌ Error fetching machines:', error);
    throw new Error('Failed to fetch machines');
  }
}

/**
 * Get a single machine by ID
 */
export async function getMachine(machineId: string): Promise<Machine | null> {
  try {
    const docSnapshot = await getDoc(doc(machinesRef, machineId));

    if (!docSnapshot.exists()) {
      return null;
    }

    const data = { id: docSnapshot.id, ...docSnapshot.data() };
    return MachineSchema.parse(data);

  } catch (error) {
    console.error('❌ Error fetching machine:', error);
    throw new Error(`Failed to fetch machine ${machineId}`);
  }
}

/**
 * Create a new machine
 */
export async function createMachine(machineData: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Machine> {
  try {
    // Check if machine with this name already exists
    const nameQuery = await getDocs(
      query(machinesRef, where('name', '==', machineData.name), limit(1))
    );
    if (!nameQuery.empty) {
      throw new Error('Machine with this name already exists');
    }

    // Create machine document
    const newMachine = {
      ...machineData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(machinesRef, newMachine);

    // Return the created machine
    const createdMachine = await getMachine(docRef.id);
    if (!createdMachine) {
      throw new Error('Failed to retrieve created machine');
    }

    console.log(`✅ Created machine: ${createdMachine.name}`);
    return createdMachine;

  } catch (error) {
    console.error('❌ Error creating machine:', error);
    throw error;
  }
}

/**
 * Update machine
 */
export async function updateMachine(
  machineId: string,
  updates: Partial<Omit<Machine, 'id' | 'createdAt'>>
): Promise<Machine> {
  try {
    const machineDoc = doc(machinesRef, machineId);

    // Update with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(machineDoc, updateData);

    // Return updated machine
    const updatedMachine = await getMachine(machineId);
    if (!updatedMachine) {
      throw new Error('Failed to retrieve updated machine');
    }

    console.log(`✅ Updated machine: ${updatedMachine.name}`);
    return updatedMachine;

  } catch (error) {
    console.error('❌ Error updating machine:', error);
    throw new Error(`Failed to update machine ${machineId}`);
  }
}

/**
 * Connect operator to machine
 */
export async function connectOperatorToMachine(
  machineId: string,
  operatorId: string,
  role: 'Owner' | 'Maintainer' | 'Contributor' = 'Contributor'
): Promise<Machine> {
  try {
    const machine = await getMachine(machineId);
    if (!machine) {
      throw new Error('Machine not found');
    }

    // Check if machine is available
    if (machine.operators.length >= machine.maxOperators) {
      throw new Error('Machine is at maximum capacity');
    }

    // Check if operator is already connected
    if (machine.operators.includes(operatorId)) {
      throw new Error('Operator already connected to this machine');
    }

    // Add operator to machine
    const machineDoc = doc(machinesRef, machineId);
    await updateDoc(machineDoc, {
      operators: arrayUnion(operatorId),
      updatedAt: serverTimestamp()
    });

    // Return updated machine
    const updatedMachine = await getMachine(machineId);
    if (!updatedMachine) {
      throw new Error('Failed to retrieve updated machine');
    }

    console.log(`✅ Connected operator ${operatorId} to machine ${machine.name}`);
    return updatedMachine;

  } catch (error) {
    console.error('❌ Error connecting operator to machine:', error);
    throw error;
  }
}

/**
 * Disconnect operator from machine
 */
export async function disconnectOperatorFromMachine(
  machineId: string,
  operatorId: string
): Promise<Machine> {
  try {
    const machine = await getMachine(machineId);
    if (!machine) {
      throw new Error('Machine not found');
    }

    // Check if operator is connected
    if (!machine.operators.includes(operatorId)) {
      throw new Error('Operator not connected to this machine');
    }

    // Remove operator from machine
    const machineDoc = doc(machinesRef, machineId);
    await updateDoc(machineDoc, {
      operators: arrayRemove(operatorId),
      updatedAt: serverTimestamp()
    });

    // Return updated machine
    const updatedMachine = await getMachine(machineId);
    if (!updatedMachine) {
      throw new Error('Failed to retrieve updated machine');
    }

    console.log(`✅ Disconnected operator ${operatorId} from machine ${machine.name}`);
    return updatedMachine;

  } catch (error) {
    console.error('❌ Error disconnecting operator from machine:', error);
    throw error;
  }
}

/**
 * Get machines for a specific operator
 */
export async function getMachinesForOperator(operatorId: string): Promise<Machine[]> {
  try {
    const querySnapshot = await getDocs(
      query(machinesRef, where('operators', 'array-contains', operatorId))
    );

    const machines: Machine[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };
      const validatedMachine = MachineSchema.parse(data);
      machines.push(validatedMachine);
    }

    return machines;

  } catch (error) {
    console.error('❌ Error fetching operator machines:', error);
    throw new Error(`Failed to fetch machines for operator ${operatorId}`);
  }
}

/**
 * Delete machine
 */
export async function deleteMachine(machineId: string): Promise<void> {
  try {
    await deleteDoc(doc(machinesRef, machineId));
    console.log(`✅ Deleted machine: ${machineId}`);

  } catch (error) {
    console.error('❌ Error deleting machine:', error);
    throw new Error(`Failed to delete machine ${machineId}`);
  }
}

/**
 * Get machine statistics
 */
export async function getMachineStats(): Promise<{
  totalMachines: number;
  totalRevenue: number;
  averageRevenue: number;
  categoryDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}> {
  try {
    const querySnapshot = await getDocs(machinesRef);

    let totalRevenue = 0;
    const categoryDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalRevenue += data.earnings?.total || 0;

      const category = data.category || 'Other';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;

      const status = data.status || 'Active';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    const totalMachines = querySnapshot.size;
    const averageRevenue = totalMachines > 0 ? totalRevenue / totalMachines : 0;

    return {
      totalMachines,
      totalRevenue,
      averageRevenue,
      categoryDistribution,
      statusDistribution
    };

  } catch (error) {
    console.error('❌ Error fetching machine stats:', error);
    throw new Error('Failed to fetch machine statistics');
  }
}