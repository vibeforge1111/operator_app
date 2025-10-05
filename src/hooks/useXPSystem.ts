import { useState, useCallback } from 'react';
import { OperatorProfile } from '../types/operator';
import { Operation } from '../types/operation';

/**
 * XP calculation constants
 *
 * Base XP values for different operation categories and difficulties.
 * Multipliers are applied based on operation characteristics.
 */
const XP_REWARDS = {
  // Base XP by difficulty
  difficulty: {
    'Beginner': 50,
    'Intermediate': 100,
    'Advanced': 200
  },

  // Category multipliers
  category: {
    'Development': 1.2,
    'Design': 1.0,
    'Content': 0.8,
    'Testing': 0.9,
    'Documentation': 0.7,
    'Research': 1.1
  },

  // Priority bonuses
  priority: {
    'Low': 0,
    'Medium': 25,
    'High': 50,
    'Critical': 100
  },

  // Time completion bonuses
  timeBonus: {
    early: 0.2,      // 20% bonus for early completion
    onTime: 0.1,     // 10% bonus for on-time completion
    late: -0.1       // 10% penalty for late completion
  }
};

/**
 * Rank progression thresholds
 *
 * XP requirements for advancing to each rank level.
 */
const RANK_THRESHOLDS = {
  'Apprentice': 0,
  'Journeyman': 1000,
  'Expert': 5000,
  'Master': 15000
} as const;

type Rank = keyof typeof RANK_THRESHOLDS;

/**
 * XP System Hook
 *
 * Manages XP earning, rank progression, and reward calculation
 * for operator profiles. Provides functions for awarding XP
 * and calculating rewards based on operation completion.
 *
 * Features:
 * - Dynamic XP calculation based on multiple factors
 * - Automatic rank progression
 * - Time-based completion bonuses
 * - Achievement tracking
 * - Reward distribution simulation
 *
 * @returns {Object} XP system functions and state
 */
export function useXPSystem() {
  const [isAwarding, setIsAwarding] = useState(false);
  const [lastAward, setLastAward] = useState<{
    xp: number;
    tokens: number;
    operation: string;
    timestamp: Date;
  } | null>(null);

  /**
   * Calculates XP reward for completing an operation
   *
   * @param operation - The completed operation
   * @param completionTime - When the operation was completed
   * @returns {number} Calculated XP reward
   */
  const calculateXPReward = useCallback((operation: Operation, completionTime: Date = new Date()): number => {
    // Base XP from difficulty
    const baseXP = XP_REWARDS.difficulty[operation.difficulty];

    // Category multiplier
    const categoryMultiplier = XP_REWARDS.category[operation.category] || 1.0;

    // Priority bonus
    const priorityBonus = XP_REWARDS.priority[operation.priority];

    // Time completion bonus/penalty
    let timeMultiplier = 0;
    if (operation.deadline) {
      const timeDiff = operation.deadline.getTime() - completionTime.getTime();
      const timeBuffer = 24 * 60 * 60 * 1000; // 24 hours

      if (timeDiff > timeBuffer) {
        timeMultiplier = XP_REWARDS.timeBonus.early;
      } else if (timeDiff >= 0) {
        timeMultiplier = XP_REWARDS.timeBonus.onTime;
      } else {
        timeMultiplier = XP_REWARDS.timeBonus.late;
      }
    }

    // Calculate final XP
    const categoryXP = baseXP * categoryMultiplier;
    const bonusXP = priorityBonus + (categoryXP * timeMultiplier);
    const totalXP = Math.round(categoryXP + bonusXP);

    return Math.max(totalXP, 10); // Minimum 10 XP
  }, []);

  /**
   * Determines rank based on total XP
   *
   * @param totalXP - Total XP earned by operator
   * @returns {Rank} Current rank
   */
  const calculateRank = useCallback((totalXP: number): Rank => {
    const ranks = Object.keys(RANK_THRESHOLDS) as Rank[];

    for (let i = ranks.length - 1; i >= 0; i--) {
      const rank = ranks[i];
      if (totalXP >= RANK_THRESHOLDS[rank]) {
        return rank;
      }
    }

    return 'Apprentice';
  }, []);

  /**
   * Gets XP needed for next rank
   *
   * @param currentXP - Current XP amount
   * @returns {number | null} XP needed for next rank, or null if at max rank
   */
  const getXPToNextRank = useCallback((currentXP: number): number | null => {
    const currentRank = calculateRank(currentXP);
    const ranks = Object.keys(RANK_THRESHOLDS) as Rank[];
    const currentIndex = ranks.indexOf(currentRank);

    if (currentIndex === ranks.length - 1) {
      return null; // Already at max rank
    }

    const nextRank = ranks[currentIndex + 1];
    return RANK_THRESHOLDS[nextRank] - currentXP;
  }, [calculateRank]);

  /**
   * Awards XP and tokens for completing an operation
   *
   * @param profile - Current operator profile
   * @param operation - Completed operation
   * @param updateProfile - Function to update the profile
   * @returns {Promise<Object>} Award results with XP, tokens, and rank changes
   */
  const awardXP = useCallback(async (
    profile: OperatorProfile,
    operation: Operation,
    updateProfile: (updates: Partial<OperatorProfile>) => Promise<void>
  ) => {
    setIsAwarding(true);

    try {
      // Calculate rewards
      const xpEarned = calculateXPReward(operation);
      const tokensEarned = operation.reward.tokens;
      const newTotalXP = profile.xp + xpEarned;

      // Check for rank progression
      const oldRank = profile.rank;
      const newRank = calculateRank(newTotalXP);
      const rankChanged = oldRank !== newRank;

      // Update profile
      const updates: Partial<OperatorProfile> = {
        xp: newTotalXP,
        rank: newRank,
        activeOps: profile.activeOps - 1,
        updatedAt: new Date(),
        lastActive: new Date()
      };

      await updateProfile(updates);

      // Track the award
      const award = {
        xp: xpEarned,
        tokens: tokensEarned,
        operation: operation.title,
        timestamp: new Date()
      };

      setLastAward(award);

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        xpEarned,
        tokensEarned,
        newTotalXP,
        oldRank,
        newRank,
        rankChanged,
        award
      };

    } finally {
      setIsAwarding(false);
    }
  }, [calculateXPReward, calculateRank]);

  /**
   * Gets achievement info for an XP milestone
   *
   * @param xp - XP amount to check
   * @returns {Object | null} Achievement info if milestone reached
   */
  const getAchievement = useCallback((xp: number) => {
    const milestones = [100, 500, 1000, 2500, 5000, 10000, 15000];
    const milestone = milestones.find(m => xp >= m && xp < m + 200); // Within 200 XP of milestone

    if (milestone) {
      return {
        title: `${milestone} XP Milestone`,
        description: `Reached ${milestone} total experience points`,
        icon: '🏆',
        xp: milestone
      };
    }

    return null;
  }, []);

  return {
    // State
    isAwarding,
    lastAward,

    // Calculation functions
    calculateXPReward,
    calculateRank,
    getXPToNextRank,
    getAchievement,

    // Action functions
    awardXP,

    // Constants
    XP_REWARDS,
    RANK_THRESHOLDS
  };
}