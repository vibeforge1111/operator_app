/**
 * Operation type definitions for the Operator Network
 *
 * Defines the mission board system where operators can find
 * and complete operations (tasks/bounties) to earn XP and rewards.
 *
 * @fileoverview Operation and mission types
 */

import { z } from 'zod';

// =============================================================================
// OPERATION SCHEMAS
// =============================================================================

/**
 * Valid operation statuses
 */
export const OperationStatusSchema = z.enum([
  'Open',
  'InProgress',
  'UnderReview',
  'Completed',
  'Cancelled'
]);

export type OperationStatus = z.infer<typeof OperationStatusSchema>;

/**
 * Valid operation priorities
 */
export const OperationPrioritySchema = z.enum([
  'Low',
  'Medium',
  'High',
  'Critical'
]);

export type OperationPriority = z.infer<typeof OperationPrioritySchema>;

/**
 * Valid operation categories
 */
export const OperationCategorySchema = z.enum([
  'Development',
  'Design',
  'Content',
  'Marketing',
  'Research',
  'Testing',
  'Documentation',
  'Community'
]);

export type OperationCategory = z.infer<typeof OperationCategorySchema>;

/**
 * Operation reward validation
 */
export const OperationRewardSchema = z.object({
  xp: z.number().int().min(0).max(10000),
  tokens: z.number().min(0).optional(),
  currency: z.enum(['SOL', 'USDC', 'USD']).optional()
});

export type OperationReward = z.infer<typeof OperationRewardSchema>;

/**
 * Complete operation schema
 */
export const OperationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: OperationCategorySchema,
  status: OperationStatusSchema,
  priority: OperationPrioritySchema,

  // Assignment
  machineId: z.string().min(1),
  assignedOperatorId: z.string().optional(),
  requiredSkills: z.array(z.string()).max(5),

  // Rewards
  reward: OperationRewardSchema,

  // Timing
  estimatedHours: z.number().min(0.5).max(200),
  deadline: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Metadata
  tags: z.array(z.string()).max(10),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),

  // URLs
  repositoryUrl: z.string().url().optional(),
  docsUrl: z.string().url().optional(),
  issueUrl: z.string().url().optional()
});

export type Operation = z.infer<typeof OperationSchema>;

// =============================================================================
// OPERATION CONSTANTS
// =============================================================================

/**
 * Operation priority colors for UI display
 */
export const OPERATION_PRIORITY_COLORS = {
  Low: 'text-gray-400',
  Medium: 'text-blue-400',
  High: 'text-orange-400',
  Critical: 'text-red-400'
} as const;

/**
 * Operation status colors for UI display
 */
export const OPERATION_STATUS_COLORS = {
  Open: 'text-green-400',
  InProgress: 'text-yellow-400',
  UnderReview: 'text-blue-400',
  Completed: 'text-green-600',
  Cancelled: 'text-gray-400'
} as const;

/**
 * Operation difficulty XP multipliers
 */
export const DIFFICULTY_MULTIPLIERS = {
  Beginner: 1.0,
  Intermediate: 1.5,
  Advanced: 2.0,
  Expert: 3.0
} as const;

// =============================================================================
// OPERATION HELPER FUNCTIONS
// =============================================================================

/**
 * Calculates the final XP reward including difficulty multiplier
 *
 * @param {number} baseXp - Base XP reward for the operation
 * @param {string} difficulty - Operation difficulty level
 * @returns {number} Final XP amount with multiplier applied
 *
 * @example
 * calculateFinalXp(100, 'Expert') // 300
 */
export function calculateFinalXp(baseXp: number, difficulty: Operation['difficulty']): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  return Math.round(baseXp * multiplier);
}

/**
 * Determines if an operation is overdue based on deadline
 *
 * @param {Date | undefined} deadline - Operation deadline
 * @returns {boolean} True if operation is past deadline
 */
export function isOperationOverdue(deadline?: Date): boolean {
  if (!deadline) return false;
  return new Date() > deadline;
}

/**
 * Gets time remaining until operation deadline
 *
 * @param {Date | undefined} deadline - Operation deadline
 * @returns {string | null} Human readable time remaining or null if no deadline
 *
 * @example
 * getTimeRemaining(tomorrow) // "1 day"
 * getTimeRemaining(nextWeek) // "6 days"
 */
export function getTimeRemaining(deadline?: Date): string | null {
  if (!deadline) return null;

  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff < 0) return 'Overdue';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return 'Less than 1 hour';
}

/**
 * Filters operations by operator skills
 *
 * @param {Operation[]} operations - Array of operations to filter
 * @param {string[]} operatorSkills - Skills possessed by the operator
 * @returns {Operation[]} Operations matching operator skills
 */
export function filterOperationsBySkills(operations: Operation[], operatorSkills: string[]): Operation[] {
  return operations.filter(op =>
    op.requiredSkills.some(skill => operatorSkills.includes(skill))
  );
}

/**
 * Sorts operations by priority and deadline
 *
 * @param {Operation[]} operations - Array of operations to sort
 * @returns {Operation[]} Sorted operations (high priority and urgent first)
 */
export function sortOperationsByPriority(operations: Operation[]): Operation[] {
  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  return [...operations].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by deadline (soonest first)
    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    // Finally by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}