/**
 * Firebase Services Index
 *
 * Central export for all Firebase services and initialization.
 * Provides a single interface for database operations.
 *
 * @fileoverview Firebase services aggregation and initialization
 */

// Re-export Firebase config
export * from './config';

// Re-export all service functions
export * from './operators';
export * from './machines';
export * from './operations';

// Import individual seeders
import { seedOperators } from './operators';
import { seedMachines } from './machines';
import { seedOperations } from './operations';

/**
 * Initialize Firebase and seed all collections with mock data
 * This function should be called when the app starts up
 */
export async function initializeFirebase(): Promise<void> {
  try {
    console.log('🔥 Initializing Firebase services...');

    // Seed all collections in parallel for better performance
    await Promise.all([
      seedOperators(),
      seedMachines(),
      seedOperations()
    ]);

    console.log('✅ Firebase initialization complete');

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase services');
  }
}

/**
 * Health check for Firebase services
 * Verifies that all collections are accessible
 */
export async function checkFirebaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  services: {
    operators: boolean;
    machines: boolean;
    operations: boolean;
  };
  error?: string;
}> {
  try {
    const { getOperators } = await import('./operators');
    const { getMachines } = await import('./machines');
    const { getOperations } = await import('./operations');

    // Test each service with a small query
    const [operatorsTest, machinesTest, operationsTest] = await Promise.allSettled([
      getOperators({ limitCount: 1 }),
      getMachines({ limitCount: 1 }),
      getOperations({ limitCount: 1 })
    ]);

    const services = {
      operators: operatorsTest.status === 'fulfilled',
      machines: machinesTest.status === 'fulfilled',
      operations: operationsTest.status === 'fulfilled'
    };

    const allHealthy = Object.values(services).every(Boolean);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services,
      error: allHealthy ? undefined : 'Some services are not responding'
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      services: {
        operators: false,
        machines: false,
        operations: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clear all collections (for testing/development only)
 * WARNING: This will delete all data
 */
export async function clearAllData(): Promise<void> {
  if (import.meta.env.PROD) {
    throw new Error('Cannot clear data in production environment');
  }

  try {
    const { db } = await import('./config');
    const { collection, getDocs, deleteDoc } = await import('firebase/firestore');

    console.log('⚠️ Clearing all Firebase data...');

    // Get all collections
    const collections = ['operators', 'machines', 'operations'];

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      const deletePromises = snapshot.docs.map(docSnapshot =>
        deleteDoc(docSnapshot.ref)
      );

      await Promise.all(deletePromises);
      console.log(`🗑️ Cleared ${collectionName} collection (${snapshot.size} documents)`);
    }

    console.log('✅ All data cleared successfully');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw new Error('Failed to clear Firebase data');
  }
}

/**
 * Get comprehensive statistics across all collections
 */
export async function getAllStats(): Promise<{
  operators: any;
  machines: any;
  operations: any;
  summary: {
    totalUsers: number;
    totalMachines: number;
    totalOperations: number;
    totalXP: number;
    totalRevenue: number;
  };
}> {
  try {
    const { getOperatorStats } = await import('./operators');
    const { getMachineStats } = await import('./machines');
    const { getOperationStats } = await import('./operations');

    // Get stats from all services
    const [operatorStats, machineStats, operationStats] = await Promise.all([
      getOperatorStats(),
      getMachineStats(),
      getOperationStats()
    ]);

    return {
      operators: operatorStats,
      machines: machineStats,
      operations: operationStats,
      summary: {
        totalUsers: operatorStats.totalOperators,
        totalMachines: machineStats.totalMachines,
        totalOperations: operationStats.totalOperations,
        totalXP: operatorStats.totalXP,
        totalRevenue: machineStats.totalRevenue
      }
    };

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    throw new Error('Failed to fetch comprehensive statistics');
  }
}

// Development utilities
export const dev = {
  clearAllData,
  seedOperators,
  seedMachines,
  seedOperations,
  checkFirebaseHealth
};