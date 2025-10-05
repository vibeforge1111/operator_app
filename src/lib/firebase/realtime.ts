/**
 * Firebase Realtime Listeners Service
 *
 * This service manages real-time data synchronization using Firestore listeners.
 * Provides live updates for operations, machines, operators, and notifications.
 *
 * @fileoverview Real-time data synchronization layer
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { Operation, OperationSchema } from '../validation/schemas';
import { Machine, MachineSchema } from '../validation/schemas';
import { OperatorProfile, OperatorProfileSchema } from '../../types/operator';

// Collection references
const operationsRef = collection(db, 'operations');
const machinesRef = collection(db, 'machines');
const operatorsRef = collection(db, 'operators');

/**
 * Callback type for real-time data updates
 */
export type RealtimeCallback<T> = (data: T[], error?: Error) => void;

/**
 * Real-time listener for operations with filtering
 */
export function subscribeToOperations(
  options: {
    statusFilter?: string;
    operatorFilter?: string;
    machineFilter?: string;
    limitCount?: number;
  } = {},
  callback: RealtimeCallback<Operation>
): Unsubscribe {
  const {
    statusFilter,
    operatorFilter,
    machineFilter,
    limitCount = 50
  } = options;

  // Build query constraints
  const constraints: QueryConstraint[] = [];

  if (statusFilter && statusFilter !== 'all') {
    constraints.push(where('status', '==', statusFilter));
  }

  if (operatorFilter) {
    constraints.push(where('assigneeId', '==', operatorFilter));
  }

  if (machineFilter) {
    constraints.push(where('machineId', '==', machineFilter));
  }

  constraints.push(orderBy('updatedAt', 'desc'));
  constraints.push(limit(limitCount));

  const q = query(operationsRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      try {
        const operations: Operation[] = [];

        snapshot.forEach((docSnapshot) => {
          const data = { id: docSnapshot.id, ...docSnapshot.data() };
          const validatedOperation = OperationSchema.parse(data);
          operations.push(validatedOperation);
        });

        callback(operations);
      } catch (error) {
        callback([], error instanceof Error ? error : new Error('Failed to parse operations'));
      }
    },
    (error) => {
      callback([], error);
    }
  );
}

/**
 * Real-time listener for machines with filtering
 */
export function subscribeToMachines(
  options: {
    categoryFilter?: string;
    statusFilter?: string;
    availableOnly?: boolean;
    limitCount?: number;
  } = {},
  callback: RealtimeCallback<Machine>
): Unsubscribe {
  const {
    categoryFilter,
    statusFilter,
    availableOnly,
    limitCount = 50
  } = options;

  // Build query constraints
  const constraints: QueryConstraint[] = [];

  if (categoryFilter && categoryFilter !== 'all') {
    constraints.push(where('category', '==', categoryFilter));
  }

  if (statusFilter && statusFilter !== 'all') {
    constraints.push(where('status', '==', statusFilter));
  }

  constraints.push(orderBy('updatedAt', 'desc'));
  constraints.push(limit(limitCount));

  const q = query(machinesRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      try {
        const machines: Machine[] = [];

        snapshot.forEach((docSnapshot) => {
          const data = { id: docSnapshot.id, ...docSnapshot.data() };
          const validatedMachine = MachineSchema.parse(data);

          // Apply client-side filtering for availableOnly
          if (availableOnly && validatedMachine.operators.length >= validatedMachine.maxOperators) {
            return;
          }

          machines.push(validatedMachine);
        });

        callback(machines);
      } catch (error) {
        callback([], error instanceof Error ? error : new Error('Failed to parse machines'));
      }
    },
    (error) => {
      callback([], error);
    }
  );
}

/**
 * Real-time listener for operators with filtering
 */
export function subscribeToOperators(
  options: {
    skillFilter?: string;
    rankFilter?: string;
    limitCount?: number;
  } = {},
  callback: RealtimeCallback<OperatorProfile>
): Unsubscribe {
  const {
    skillFilter,
    rankFilter,
    limitCount = 50
  } = options;

  // Build query constraints
  const constraints: QueryConstraint[] = [];

  if (skillFilter && skillFilter !== 'all') {
    constraints.push(where('skills', 'array-contains', skillFilter));
  }

  if (rankFilter && rankFilter !== 'all') {
    constraints.push(where('rank', '==', rankFilter));
  }

  constraints.push(orderBy('lastActive', 'desc'));
  constraints.push(limit(limitCount));

  const q = query(operatorsRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      try {
        const operators: OperatorProfile[] = [];

        snapshot.forEach((docSnapshot) => {
          const data = { id: docSnapshot.id, ...docSnapshot.data() };
          const validatedOperator = OperatorProfileSchema.parse(data);
          operators.push(validatedOperator);
        });

        callback(operators);
      } catch (error) {
        callback([], error instanceof Error ? error : new Error('Failed to parse operators'));
      }
    },
    (error) => {
      callback([], error);
    }
  );
}

/**
 * Real-time listener for a specific operation
 */
export function subscribeToOperation(
  operationId: string,
  callback: (operation: Operation | null, error?: Error) => void
): Unsubscribe {
  const operationDoc = doc(operationsRef, operationId);

  return onSnapshot(
    operationDoc,
    (docSnapshot) => {
      try {
        if (!docSnapshot.exists()) {
          callback(null);
          return;
        }

        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        const validatedOperation = OperationSchema.parse(data);
        callback(validatedOperation);
      } catch (error) {
        callback(null, error instanceof Error ? error : new Error('Failed to parse operation'));
      }
    },
    (error) => {
      callback(null, error);
    }
  );
}

/**
 * Real-time listener for a specific machine
 */
export function subscribeToMachine(
  machineId: string,
  callback: (machine: Machine | null, error?: Error) => void
): Unsubscribe {
  const machineDoc = doc(machinesRef, machineId);

  return onSnapshot(
    machineDoc,
    (docSnapshot) => {
      try {
        if (!docSnapshot.exists()) {
          callback(null);
          return;
        }

        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        const validatedMachine = MachineSchema.parse(data);
        callback(validatedMachine);
      } catch (error) {
        callback(null, error instanceof Error ? error : new Error('Failed to parse machine'));
      }
    },
    (error) => {
      callback(null, error);
    }
  );
}

/**
 * Real-time listener for recent activity across the network
 */
export function subscribeToRecentActivity(
  callback: RealtimeCallback<{
    type: 'operation' | 'machine' | 'operator';
    action: string;
    entityId: string;
    data: any;
    timestamp: Date;
  }>
): Unsubscribe {
  // Listen to recent operations for activity feed
  const recentOperationsQuery = query(
    operationsRef,
    orderBy('updatedAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    recentOperationsQuery,
    (snapshot) => {
      try {
        const activities: Array<{
          type: 'operation' | 'machine' | 'operator';
          action: string;
          entityId: string;
          data: any;
          timestamp: Date;
        }> = [];

        snapshot.forEach((docSnapshot) => {
          const data = { id: docSnapshot.id, ...docSnapshot.data() };

          try {
            const operation = OperationSchema.parse(data);

            // Create activity based on operation status
            let action = 'created';
            if (operation.status === 'claimed') action = 'claimed';
            else if (operation.status === 'in_progress') action = 'started';
            else if (operation.status === 'submitted') action = 'submitted';
            else if (operation.status === 'verified') action = 'completed';

            activities.push({
              type: 'operation',
              action,
              entityId: operation.id,
              data: operation,
              timestamp: operation.updatedAt instanceof Date
                ? operation.updatedAt
                : new Date(operation.updatedAt)
            });
          } catch (parseError) {
            // Skip invalid operations
          }
        });

        // Sort by timestamp
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        callback(activities);
      } catch (error) {
        callback([], error instanceof Error ? error : new Error('Failed to parse activity'));
      }
    },
    (error) => {
      callback([], error);
    }
  );
}

/**
 * Utility to clean up multiple listeners
 */
export class RealtimeManager {
  private listeners: Unsubscribe[] = [];

  addListener(unsubscribe: Unsubscribe): void {
    this.listeners.push(unsubscribe);
  }

  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export default {
  subscribeToOperations,
  subscribeToMachines,
  subscribeToOperators,
  subscribeToOperation,
  subscribeToMachine,
  subscribeToRecentActivity,
  RealtimeManager
};