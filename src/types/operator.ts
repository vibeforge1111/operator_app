/**
 * Operator type definitions for the Operator Network
 *
 * These types are derived from Zod schemas to ensure consistency
 * between runtime validation and TypeScript types.
 *
 * @fileoverview Core operator types and constants
 */

import {
  SkillTagSchema,
  OperatorProfileSchema,
  OperatorRegistrationSchema,
  type SkillTag,
  type OperatorProfile,
  type OperatorRegistration
} from '../lib/validation/schemas';

// Re-export types from validation schemas
export type { SkillTag, OperatorProfile, OperatorRegistration };

// Re-export schemas for runtime validation
export { SkillTagSchema, OperatorProfileSchema, OperatorRegistrationSchema };

/**
 * Array of all valid skill tags
 *
 * This is the authoritative list of skills available in the MVP.
 * Used for UI dropdowns and validation.
 *
 * @constant
 */
export const SKILL_TAGS: SkillTag[] = [
  'Dev',
  'Design',
  'VibeOps',
  'BizOps',
  'Narrative',
  'Coordination'
];

/**
 * Human-readable descriptions for skill tags
 *
 * Used in UI to help operators understand what each skill represents.
 * These descriptions should be kept concise for mobile displays.
 *
 * @constant
 */
export const SKILL_DESCRIPTIONS = {
  Dev: 'Engineering/Technical',
  Design: 'UI/UX/Visual',
  VibeOps: 'Community/Culture',
  BizOps: 'Strategy/Operations',
  Narrative: 'Content/Storytelling',
  Coordination: 'Project Management'
} as const;

/**
 * Operator rank progression system
 *
 * Defines the hierarchy of operator ranks based on XP thresholds.
 * This will be used for gamification and reputation display.
 *
 * @constant
 */
export const RANK_THRESHOLDS = {
  Apprentice: 0,
  Journeyman: 1000,
  Expert: 5000,
  Master: 15000
} as const;

export type OperatorRank = keyof typeof RANK_THRESHOLDS;

/**
 * Calculates operator rank based on XP
 *
 * Determines the appropriate rank for an operator based on their
 * current XP value. Used for display and access control.
 *
 * @param xp - Current XP value
 * @returns The appropriate rank for the given XP
 *
 * @example
 * calculateRank(0) // 'Apprentice'
 * calculateRank(1500) // 'Journeyman'
 * calculateRank(10000) // 'Expert'
 */
export function calculateRank(xp: number): OperatorRank {
  if (xp >= RANK_THRESHOLDS.Master) return 'Master';
  if (xp >= RANK_THRESHOLDS.Expert) return 'Expert';
  if (xp >= RANK_THRESHOLDS.Journeyman) return 'Journeyman';
  return 'Apprentice';
}

/**
 * Gets the next rank and XP required to reach it
 *
 * Provides progression information for gamification UI.
 * Returns null if already at maximum rank.
 *
 * @param currentXp - Current XP value
 * @returns Next rank info or null if at max rank
 *
 * @example
 * getNextRank(500) // { rank: 'Journeyman', xpRequired: 500 }
 * getNextRank(20000) // null (already at Master)
 */
export function getNextRank(currentXp: number): { rank: OperatorRank; xpRequired: number } | null {
  const ranks = Object.entries(RANK_THRESHOLDS) as [OperatorRank, number][];

  for (const [rank, threshold] of ranks) {
    if (currentXp < threshold) {
      return {
        rank,
        xpRequired: threshold - currentXp
      };
    }
  }

  return null; // Already at maximum rank
}