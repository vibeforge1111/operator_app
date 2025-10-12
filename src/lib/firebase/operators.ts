/**
 * Firestore Operators Service
 *
 * This service handles all Firestore operations for operator data.
 * Provides CRUD operations with proper error handling and validation.
 *
 * @fileoverview Firestore operators data layer
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
import { db, USE_MOCK_DATA } from './config';
import { OperatorProfile, OperatorRegistration } from '../../types/operator';
import { OperatorProfileSchema } from '../validation/schemas';
import { MOCK_OPERATORS } from '../../data/mockOperators';

// Collection reference
const OPERATORS_COLLECTION = 'operators';
const operatorsRef = collection(db, OPERATORS_COLLECTION);

/**
 * Seed operators collection with mock data
 * Only runs if the collection is empty
 */
export async function seedOperators(): Promise<void> {
  // Skip seeding in mock data mode
  if (USE_MOCK_DATA) {
    console.log('🎭 Mock data mode - skipping Firebase seeding');
    return;
  }

  try {
    // Check if operators already exist
    const existingOperators = await getDocs(query(operatorsRef, limit(1)));

    if (!existingOperators.empty) {
      console.log('🎯 Operators collection already seeded');
      return;
    }

    console.log('🌱 Seeding operators collection with mock data...');

    const batch = writeBatch(db);

    for (const operator of MOCK_OPERATORS) {
      const operatorDoc = doc(operatorsRef);
      const operatorData = {
        ...operator,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      };

      batch.set(operatorDoc, operatorData);
    }

    await batch.commit();
    console.log(`✅ Seeded ${MOCK_OPERATORS.length} operators successfully`);

  } catch (error) {
    console.error('❌ Error seeding operators:', error);
    throw new Error('Failed to seed operators collection');
  }
}

/**
 * Get all operators with optional filtering and pagination
 */
export async function getOperators(options: {
  skillFilter?: string;
  rankFilter?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'alphabetical' | 'xp';
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
} = {}): Promise<{
  operators: OperatorProfile[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
}> {
  // Use mock data if Firebase is not configured
  if (USE_MOCK_DATA) {
    const {
      skillFilter,
      rankFilter,
      searchQuery,
      sortBy = 'newest',
      limitCount = 20,
    } = options;

    let filteredOperators = [...MOCK_OPERATORS];

    // Apply filters
    if (skillFilter && skillFilter !== 'all') {
      filteredOperators = filteredOperators.filter(op =>
        op.skills.includes(skillFilter as any)
      );
    }

    if (rankFilter && rankFilter !== 'all') {
      filteredOperators = filteredOperators.filter(op =>
        op.rank === rankFilter
      );
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredOperators = filteredOperators.filter(op =>
        op.handle.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filteredOperators.sort((a, b) => a.handle.localeCompare(b.handle));
        break;
      case 'xp':
        filteredOperators.sort((a, b) => b.xp - a.xp);
        break;
      case 'newest':
      default:
        // Mock data doesn't have real timestamps, so we'll keep original order
        break;
    }

    // Apply pagination
    const paginatedOperators = filteredOperators.slice(0, limitCount);

    return {
      operators: paginatedOperators.map((op, index) => ({
        ...op,
        id: `mock-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date()
      })),
      hasMore: filteredOperators.length > limitCount
    };
  }

  try {
    const {
      skillFilter,
      rankFilter,
      searchQuery,
      sortBy = 'newest',
      limitCount = 20,
      lastDoc
    } = options;

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Add filters
    if (skillFilter && skillFilter !== 'all') {
      constraints.push(where('skills', 'array-contains', skillFilter));
    }

    if (rankFilter && rankFilter !== 'all') {
      constraints.push(where('rank', '==', rankFilter));
    }

    // Add sorting
    switch (sortBy) {
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'alphabetical':
        constraints.push(orderBy('handle', 'asc'));
        break;
      case 'xp':
        constraints.push(orderBy('xp', 'desc'));
        break;
    }

    // Add pagination
    constraints.push(limit(limitCount + 1)); // Get one extra to check if there are more

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    // Execute query
    const querySnapshot = await getDocs(query(operatorsRef, ...constraints));

    const operators: OperatorProfile[] = [];
    const docs = querySnapshot.docs;

    // Process results (excluding the extra document)
    const actualDocs = docs.slice(0, limitCount);

    for (const docSnapshot of actualDocs) {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };

      // Validate data against schema
      const validatedOperator = OperatorProfileSchema.parse(data);
      operators.push(validatedOperator);
    }

    // Apply client-side search filter (Firestore doesn't support full-text search out of the box)
    let filteredOperators = operators;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredOperators = operators.filter(op =>
        op.handle.toLowerCase().includes(query)
      );
    }

    return {
      operators: filteredOperators,
      lastDoc: actualDocs[actualDocs.length - 1],
      hasMore: docs.length > limitCount
    };

  } catch (error) {
    console.error('❌ Error fetching operators:', error);
    throw new Error('Failed to fetch operators');
  }
}

/**
 * Get a single operator by ID
 */
export async function getOperator(operatorId: string): Promise<OperatorProfile | null> {
  try {
    const docSnapshot = await getDoc(doc(operatorsRef, operatorId));

    if (!docSnapshot.exists()) {
      return null;
    }

    const data = { id: docSnapshot.id, ...docSnapshot.data() };
    return OperatorProfileSchema.parse(data);

  } catch (error) {
    console.error('❌ Error fetching operator:', error);
    throw new Error(`Failed to fetch operator ${operatorId}`);
  }
}

/**
 * Get operator by wallet address
 */
export async function getOperatorByWallet(walletAddress: string): Promise<OperatorProfile | null> {
  try {
    const querySnapshot = await getDocs(
      query(operatorsRef, where('walletAddress', '==', walletAddress), limit(1))
    );

    if (querySnapshot.empty) {
      return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = { id: docSnapshot.id, ...docSnapshot.data() };
    return OperatorProfileSchema.parse(data);

  } catch (error) {
    console.error('❌ Error fetching operator by wallet:', error);
    throw new Error(`Failed to fetch operator with wallet ${walletAddress}`);
  }
}

/**
 * Create a new operator
 */
export async function createOperator(operatorData: OperatorRegistration): Promise<OperatorProfile> {
  try {
    // Check if operator with this wallet already exists
    const existingOperator = await getOperatorByWallet(operatorData.walletAddress);
    if (existingOperator) {
      throw new Error('Operator with this wallet address already exists');
    }

    // Check if handle is unique
    const handleQuery = await getDocs(
      query(operatorsRef, where('handle', '==', operatorData.handle), limit(1))
    );
    if (!handleQuery.empty) {
      throw new Error('Handle is already taken');
    }

    // Create operator document
    const newOperator = {
      walletAddress: operatorData.walletAddress,
      handle: operatorData.handle,
      skills: operatorData.skills,
      xp: 0,
      rank: 'Apprentice' as const,
      connectedMachines: 0,
      activeOps: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    };

    const docRef = await addDoc(operatorsRef, newOperator);

    // Return the created operator
    const createdOperator = await getOperator(docRef.id);
    if (!createdOperator) {
      throw new Error('Failed to retrieve created operator');
    }

    console.log(`✅ Created operator: ${createdOperator.handle}`);
    return createdOperator;

  } catch (error) {
    console.error('❌ Error creating operator:', error);
    throw error;
  }
}

/**
 * Update operator profile
 */
export async function updateOperator(
  operatorId: string,
  updates: Partial<Omit<OperatorProfile, 'id' | 'createdAt'>>
): Promise<OperatorProfile> {
  try {
    const operatorDoc = doc(operatorsRef, operatorId);

    // Update with timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(operatorDoc, updateData);

    // Return updated operator
    const updatedOperator = await getOperator(operatorId);
    if (!updatedOperator) {
      throw new Error('Failed to retrieve updated operator');
    }

    console.log(`✅ Updated operator: ${updatedOperator.handle}`);
    return updatedOperator;

  } catch (error) {
    console.error('❌ Error updating operator:', error);
    throw new Error(`Failed to update operator ${operatorId}`);
  }
}

/**
 * Update operator's last active timestamp
 */
export async function updateLastActive(operatorId: string): Promise<void> {
  try {
    const operatorDoc = doc(operatorsRef, operatorId);
    await updateDoc(operatorDoc, {
      lastActive: serverTimestamp()
    });

  } catch (error) {
    console.error('❌ Error updating last active:', error);
    // Don't throw error for this non-critical operation
  }
}

/**
 * Delete operator
 */
export async function deleteOperator(operatorId: string): Promise<void> {
  try {
    await deleteDoc(doc(operatorsRef, operatorId));
    console.log(`✅ Deleted operator: ${operatorId}`);

  } catch (error) {
    console.error('❌ Error deleting operator:', error);
    throw new Error(`Failed to delete operator ${operatorId}`);
  }
}

/**
 * Check if handle is available
 */
export async function isHandleAvailable(handle: string, excludeOperatorId?: string): Promise<boolean> {
  try {
    const querySnapshot = await getDocs(
      query(operatorsRef, where('handle', '==', handle))
    );

    // If no results, handle is available
    if (querySnapshot.empty) {
      return true;
    }

    // If we're checking for an update and the only match is the current operator
    if (excludeOperatorId && querySnapshot.size === 1) {
      const doc = querySnapshot.docs[0];
      return doc.id === excludeOperatorId;
    }

    return false;

  } catch (error) {
    console.error('❌ Error checking handle availability:', error);
    return false;
  }
}

/**
 * Get operator statistics
 */
export async function getOperatorStats(): Promise<{
  totalOperators: number;
  totalXP: number;
  averageXP: number;
  rankDistribution: Record<string, number>;
}> {
  try {
    const querySnapshot = await getDocs(operatorsRef);

    let totalXP = 0;
    const rankDistribution: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalXP += data.xp || 0;

      const rank = data.rank || 'Apprentice';
      rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
    });

    const totalOperators = querySnapshot.size;
    const averageXP = totalOperators > 0 ? totalXP / totalOperators : 0;

    return {
      totalOperators,
      totalXP,
      averageXP,
      rankDistribution
    };

  } catch (error) {
    console.error('❌ Error fetching operator stats:', error);
    throw new Error('Failed to fetch operator statistics');
  }
}