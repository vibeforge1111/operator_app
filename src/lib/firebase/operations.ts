/**
 * Firestore Operations Service
 *
 * This service handles all Firestore operations for operation (mission) data.
 * Provides CRUD operations with proper error handling and validation.
 *
 * @fileoverview Firestore operations data layer
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
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Operation, OperationSchema, OperationStatus } from '../../lib/validation/schemas';
import { MOCK_OPERATIONS } from '../../data/mockOperations';

// Collection reference
const OPERATIONS_COLLECTION = 'operations';
const operationsRef = collection(db, OPERATIONS_COLLECTION);

/**
 * Seed operations collection with mock data
 * Only runs if the collection is empty
 */
export async function seedOperations(): Promise<void> {
  try {
    // Check if operations already exist
    const existingOperations = await getDocs(query(operationsRef, limit(1)));

    if (!existingOperations.empty) {
      console.log('🎯 Operations collection already seeded');
      return;
    }

    console.log('🌱 Seeding operations collection with mock data...');

    const batch = writeBatch(db);

    for (const operation of MOCK_OPERATIONS) {
      const operationDoc = doc(operationsRef);
      const operationData = {
        ...operation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(operationDoc, operationData);
    }

    await batch.commit();
    console.log(`✅ Seeded ${MOCK_OPERATIONS.length} operations successfully`);

  } catch (error) {
    console.error('❌ Error seeding operations:', error);
    throw new Error('Failed to seed operations collection');
  }
}

/**
 * Get all operations with optional filtering and pagination
 */
export async function getOperations(options: {
  statusFilter?: OperationStatus | 'all';
  machineFilter?: string;
  skillFilter?: string;
  operatorFilter?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'deadline' | 'reward';
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
} = {}): Promise<{
  operations: Operation[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
}> {
  try {
    const {
      statusFilter,
      machineFilter,
      skillFilter,
      operatorFilter,
      searchQuery,
      sortBy = 'newest',
      limitCount = 20,
      lastDoc
    } = options;

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (statusFilter && statusFilter !== 'all') {
      constraints.push(where('status', '==', statusFilter));
    }

    if (machineFilter && machineFilter !== 'all') {
      constraints.push(where('machineId', '==', machineFilter));
    }

    if (skillFilter && skillFilter !== 'all') {
      constraints.push(where('requiredSkills', 'array-contains', skillFilter));
    }

    if (operatorFilter) {
      constraints.push(where('assigneeId', '==', operatorFilter));
    }

    // Add sorting
    switch (sortBy) {
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'deadline':
        constraints.push(orderBy('deadline', 'asc'));
        break;
      case 'reward':
        constraints.push(orderBy('reward.xp', 'desc'));
        break;
    }

    // Add pagination
    constraints.push(limit(limitCount + 1)); // Get one extra to check if there are more

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Execute query
    const querySnapshot = await getDocs(query(operationsRef, ...constraints));

    const operations: Operation[] = [];
    const docs = querySnapshot.docs;

    // Process results (excluding the extra document)
    const actualDocs = docs.slice(0, limitCount);

    for (const docSnapshot of actualDocs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };

      // Validate data against schema
      const validatedOperation = OperationSchema.parse(data);
      operations.push(validatedOperation);
    }

    // Apply client-side search filter
    let filteredOperations = operations;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredOperations = operations.filter(op =>
        op.title.toLowerCase().includes(query) ||
        op.description.toLowerCase().includes(query)
      );
    }

    return {
      operations: filteredOperations,
      lastDoc: actualDocs[actualDocs.length - 1],
      hasMore: docs.length > limitCount
    };

  } catch (error) {
    console.error('❌ Error fetching operations:', error);
    throw new Error('Failed to fetch operations');
  }
}

/**
 * Get a single operation by ID
 */
export async function getOperation(operationId: string): Promise<Operation | null> {
  try {
    const docSnapshot = await getDoc(doc(operationsRef, operationId));

    if (!docSnapshot.exists()) {
      return null;
    }

    const data = { id: docSnapshot.id, ...docSnapshot.data() };
    return OperationSchema.parse(data);

  } catch (error) {
    console.error('❌ Error fetching operation:', error);
    throw new Error(`Failed to fetch operation ${operationId}`);
  }
}

/**
 * Create a new operation
 */
export async function createOperation(
  operationData: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Operation> {
  try {
    // Create operation document
    const newOperation = {
      ...operationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(operationsRef, newOperation);

    // Return the created operation
    const createdOperation = await getOperation(docRef.id);
    if (!createdOperation) {
      throw new Error('Failed to retrieve created operation');
    }

    console.log(`✅ Created operation: ${createdOperation.title}`);
    return createdOperation;

  } catch (error) {
    console.error('❌ Error creating operation:', error);
    throw error;
  }
}

/**
 * Update operation
 */
export async function updateOperation(
  operationId: string,
  updates: Partial<Omit<Operation, 'id' | 'createdAt'>>
): Promise<Operation> {
  try {
    const operationDoc = doc(operationsRef, operationId);

    // Update with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(operationDoc, updateData);

    // Return updated operation
    const updatedOperation = await getOperation(operationId);
    if (!updatedOperation) {
      throw new Error('Failed to retrieve updated operation');
    }

    console.log(`✅ Updated operation: ${updatedOperation.title}`);
    return updatedOperation;

  } catch (error) {
    console.error('❌ Error updating operation:', error);
    throw new Error(`Failed to update operation ${operationId}`);
  }
}

/**
 * Claim an operation (assign to operator)
 */
export async function claimOperation(operationId: string, operatorId: string): Promise<Operation> {
  try {
    const operation = await getOperation(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    // Check if operation is available for claiming
    if (operation.status !== 'open') {
      throw new Error('Operation is not available for claiming');
    }

    if (operation.assigneeId) {
      throw new Error('Operation is already assigned');
    }

    // Update operation status and assignee
    return await updateOperation(operationId, {
      status: 'claimed',
      assigneeId: operatorId,
      claimedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('❌ Error claiming operation:', error);
    throw error;
  }
}

/**
 * Start working on an operation
 */
export async function startOperation(operationId: string, operatorId: string): Promise<Operation> {
  try {
    const operation = await getOperation(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    // Verify operator is assigned
    if (operation.assigneeId !== operatorId) {
      throw new Error('Operation not assigned to this operator');
    }

    // Check current status
    if (operation.status !== 'claimed') {
      throw new Error('Operation must be claimed before starting');
    }

    // Update operation status
    return await updateOperation(operationId, {
      status: 'in_progress',
      startedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('❌ Error starting operation:', error);
    throw error;
  }
}

/**
 * Submit operation for verification
 */
export async function submitOperation(
  operationId: string,
  operatorId: string,
  submissionNotes?: string
): Promise<Operation> {
  try {
    const operation = await getOperation(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    // Verify operator is assigned
    if (operation.assigneeId !== operatorId) {
      throw new Error('Operation not assigned to this operator');
    }

    // Check current status
    if (operation.status !== 'in_progress') {
      throw new Error('Operation must be in progress to submit');
    }

    // Update operation status
    const updates: any = {
      status: 'submitted',
      submittedAt: serverTimestamp()
    };

    if (submissionNotes) {
      updates.submissionNotes = submissionNotes;
    }

    return await updateOperation(operationId, updates);

  } catch (error) {
    console.error('❌ Error submitting operation:', error);
    throw error;
  }
}

/**
 * Verify and complete operation
 */
export async function verifyOperation(
  operationId: string,
  verifierId: string,
  approved: boolean,
  verificationNotes?: string
): Promise<Operation> {
  try {
    const operation = await getOperation(operationId);
    if (!operation) {
      throw new Error('Operation not found');
    }

    // Check current status
    if (operation.status !== 'submitted') {
      throw new Error('Operation must be submitted for verification');
    }

    // Update operation status
    const updates: any = {
      status: approved ? 'verified' : 'open', // If rejected, return to open
      verifiedBy: verifierId,
      verifiedAt: serverTimestamp()
    };

    if (verificationNotes) {
      updates.verificationNotes = verificationNotes;
    }

    // If rejected, clear assignee
    if (!approved) {
      updates.assigneeId = null;
      updates.claimedAt = null;
      updates.startedAt = null;
      updates.submittedAt = null;
    }

    return await updateOperation(operationId, updates);

  } catch (error) {
    console.error('❌ Error verifying operation:', error);
    throw error;
  }
}

/**
 * Get operations for a specific machine
 */
export async function getOperationsForMachine(machineId: string): Promise<Operation[]> {
  try {
    const querySnapshot = await getDocs(
      query(operationsRef, where('machineId', '==', machineId), orderBy('createdAt', 'desc'))
    );

    const operations: Operation[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };
      const validatedOperation = OperationSchema.parse(data);
      operations.push(validatedOperation);
    }

    return operations;

  } catch (error) {
    console.error('❌ Error fetching machine operations:', error);
    throw new Error(`Failed to fetch operations for machine ${machineId}`);
  }
}

/**
 * Get operations for a specific operator
 */
export async function getOperationsForOperator(operatorId: string): Promise<Operation[]> {
  try {
    const querySnapshot = await getDocs(
      query(operationsRef, where('assigneeId', '==', operatorId), orderBy('createdAt', 'desc'))
    );

    const operations: Operation[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };
      const validatedOperation = OperationSchema.parse(data);
      operations.push(validatedOperation);
    }

    return operations;

  } catch (error) {
    console.error('❌ Error fetching operator operations:', error);
    throw new Error(`Failed to fetch operations for operator ${operatorId}`);
  }
}

/**
 * Delete operation
 */
export async function deleteOperation(operationId: string): Promise<void> {
  try {
    await deleteDoc(doc(operationsRef, operationId));
    console.log(`✅ Deleted operation: ${operationId}`);

  } catch (error) {
    console.error('❌ Error deleting operation:', error);
    throw new Error(`Failed to delete operation ${operationId}`);
  }
}

/**
 * Get operation statistics
 */
export async function getOperationStats(): Promise<{
  totalOperations: number;
  totalRewardXP: number;
  averageRewardXP: number;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}> {
  try {
    const querySnapshot = await getDocs(operationsRef);

    let totalRewardXP = 0;
    const statusDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalRewardXP += data.reward?.xp || 0;

      const status = data.status || 'open';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;

      const category = data.category || 'General';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    const totalOperations = querySnapshot.size;
    const averageRewardXP = totalOperations > 0 ? totalRewardXP / totalOperations : 0;

    return {
      totalOperations,
      totalRewardXP,
      averageRewardXP,
      statusDistribution,
      categoryDistribution
    };

  } catch (error) {
    console.error('❌ Error fetching operation stats:', error);
    throw new Error('Failed to fetch operation statistics');
  }
}