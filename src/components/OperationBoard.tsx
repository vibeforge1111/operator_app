/**
 * Operation Board Component
 *
 * Mission board interface for discovering and managing operations within
 * the Operator Network. Operators can browse available missions, view
 * details, and accept operations to earn XP and rewards.
 *
 * Features:
 * - Advanced filtering by category, priority, and difficulty
 * - Real-time search across operation titles and descriptions
 * - Skill-based operation recommendations
 * - Operation assignment and progress tracking
 * - Reward and XP visualization
 * - Deadline and time tracking
 *
 * @component
 * @param {OperationBoardProps} props - Component props
 * @returns {JSX.Element} The operation board interface
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Operation,
  OperationCategory,
  OperationPriority,
  OperationStatus,
  OPERATION_PRIORITY_COLORS,
  OPERATION_STATUS_COLORS,
  calculateFinalXp,
  getTimeRemaining,
  sortOperationsByPriority,
  filterOperationsBySkills
} from '../types/operation';
import { getOperations, claimOperation, startOperation, submitOperation } from '../lib/firebase/operations';
import { subscribeToOperations, RealtimeManager } from '../lib/firebase/realtime';
import { OperatorProfile } from '../types/operator';
import { useXPSystem } from '../hooks/useXPSystem';
import { useOperatorProfile } from '../hooks/useOperatorProfile';

/**
 * Props for the OperationBoard component
 * @interface OperationBoardProps
 */
interface OperationBoardProps {
  /** The current operator's profile */
  profile: OperatorProfile;
  /** Callback to navigate back to the dashboard */
  onBack: () => void;
  /** Callback when an operator completes an operation */
  onCompleteOperation: (operationId: string) => void;
}

/**
 * All available operation categories
 */
const OPERATION_CATEGORIES: OperationCategory[] = [
  'Development', 'Design', 'Content', 'Marketing', 'Research', 'Testing', 'Documentation', 'Community'
];

/**
 * All available operation priorities
 */
const OPERATION_PRIORITIES: OperationPriority[] = ['Low', 'Medium', 'High', 'Critical'];

/**
 * All available operation statuses for filtering
 */
const OPERATION_STATUSES: OperationStatus[] = ['Open', 'InProgress', 'UnderReview', 'Completed', 'Cancelled'];

export default function OperationBoard({ profile, onBack, onCompleteOperation }: OperationBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<OperationPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<OperationStatus | 'all'>('open');
  const [showRecommended, setShowRecommended] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingOperation, setAcceptingOperation] = useState<string | null>(null);
  const [completingOperation, setCompletingOperation] = useState<string | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [realtimeManager] = useState(() => new RealtimeManager());

  // XP System integration
  const { calculateXPReward, awardXP, isAwarding } = useXPSystem();
  const { updateProfile } = useOperatorProfile(profile.walletAddress);

  // Set up real-time listeners for operations
  useEffect(() => {
    setIsLoading(true);
    setLoadingError(null);

    // Clean up previous listeners
    realtimeManager.cleanup();

    // Subscribe to real-time operations
    const unsubscribe = subscribeToOperations(
      {
        statusFilter: selectedStatus === 'all' ? undefined : selectedStatus,
        limitCount: 50
      },
      (operations, error) => {
        if (error) {
          setLoadingError(error.message);
          setIsLoading(false);
          return;
        }

        // Apply client-side search filter
        let filteredOps = operations;
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredOps = operations.filter(op =>
            op.title.toLowerCase().includes(query) ||
            op.description.toLowerCase().includes(query) ||
            op.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        setOperations(filteredOps);
        setIsLoading(false);
      }
    );

    realtimeManager.addListener(unsubscribe);

    // Cleanup on unmount
    return () => {
      realtimeManager.cleanup();
    };
  }, [selectedStatus, searchQuery]);

  /**
   * Filters and sorts operations based on current criteria
   */
  const filteredOperations = useMemo(() => {
    let filteredOps = [...operations];

    // Client-side filtering for criteria not handled by Firebase
    if (selectedCategory !== 'all') {
      filteredOps = filteredOps.filter(op => op.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filteredOps = filteredOps.filter(op => op.priority === selectedPriority);
    }

    // Filter by recommended (matching operator skills)
    if (showRecommended) {
      filteredOps = filterOperationsBySkills(filteredOps, profile.skills);
    }

    // Sort by priority and deadline
    return sortOperationsByPriority(filteredOps);
  }, [operations, selectedCategory, selectedPriority, showRecommended, profile.skills]);

  /**
   * Handles operation acceptance with loading state
   *
   * @param {string} operationId - The ID of the operation to accept
   */
  const handleAcceptOperation = async (operationId: string) => {
    setAcceptingOperation(operationId);

    try {
      // Claim the operation - realtime listener will automatically update the UI
      await claimOperation(operationId, profile.id);
      console.log(`Operation ${operationId} accepted by ${profile.handle}`);
    } catch (error) {
      console.error('Failed to accept operation:', error);
      setLoadingError(error instanceof Error ? error.message : 'Failed to accept operation');
    } finally {
      setAcceptingOperation(null);
    }
  };

  /**
   * Handles completing an operation with XP and token rewards
   *
   * @param {string} operationId - The ID of the operation to complete
   */
  const handleCompleteOperation = async (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    setCompletingOperation(operationId);

    try {
      // Submit operation for verification - realtime listener will automatically update the UI
      await submitOperation(operationId, profile.id);

      // Award XP and tokens
      const reward = await awardXP(profile, operation, updateProfile);

      setLastReward(reward);
      setShowRewardModal(true);

      // Call parent callback
      onCompleteOperation(operationId);

      console.log(`Operation ${operationId} completed! Awarded ${reward.xpEarned} XP`);

    } catch (error) {
      console.error('Failed to complete operation:', error);
      setLoadingError(error instanceof Error ? error.message : 'Failed to complete operation');
    } finally {
      setCompletingOperation(null);
    }
  };

  /**
   * Returns the appropriate icon for operation category
   *
   * @param {OperationCategory} category - The operation category
   * @returns {string} Emoji icon for the category
   */
  const getCategoryIcon = (category: OperationCategory): string => {
    switch (category) {
      case 'Development': return '💻';
      case 'Design': return '🎨';
      case 'Content': return '📝';
      case 'Marketing': return '📢';
      case 'Research': return '🔬';
      case 'Testing': return '🧪';
      case 'Documentation': return '📚';
      case 'Community': return '👥';
      default: return '⚡';
    }
  };

  /**
   * Returns the appropriate icon for operation difficulty
   *
   * @param {string} difficulty - The operation difficulty
   * @returns {string} Icon representing difficulty level
   */
  const getDifficultyIcon = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner': return '🟢';
      case 'Intermediate': return '🟡';
      case 'Advanced': return '🟠';
      case 'Expert': return '🔴';
      default: return '⚪';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">Loading Operation Board...</div>
          <div className="text-sm text-[var(--color-text-muted)]">Fetching available missions</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg">
      {/* Header */}
      <div className="">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Operation Board</h1>
            <p className="text-[var(--muted-foreground)]">Missions and bounties for operators</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="operator-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {operations.filter(op => op.status === 'open').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Open Operations</div>
          </div>
          <div className="operator-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {filterOperationsBySkills(operations.filter(op => op.status === 'open'), profile.skills).length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Recommended</div>
          </div>
          <div className="operator-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {operations.filter(op => op.assigneeId === profile.id).length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Your Operations</div>
          </div>
          <div className="operator-card rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {operations.filter(op => op.priority === 'Critical').length}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Critical Priority</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search operations..."
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as OperationCategory | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Categories</option>
                {OPERATION_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as OperationPriority | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Priorities</option>
                {OPERATION_PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OperationStatus | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Statuses</option>
                {OPERATION_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Recommended Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Filter</label>
              <label className="flex items-center space-x-2 cursor-pointer px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded">
                <input
                  type="checkbox"
                  id="recommended"
                  checked={showRecommended}
                  onChange={(e) => setShowRecommended(e.target.checked)}
                  className="w-4 h-4 text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded focus:ring-[var(--foreground)]"
                />
                <span className="text-[var(--foreground)] text-sm">Recommended</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-[var(--muted-foreground)] text-sm">
          {filteredOperations.length} operation{filteredOperations.length !== 1 ? 's' : ''} found
        </div>

        {/* Operations Grid */}
        {filteredOperations.length === 0 ? (
          <div className="operator-card rounded-lg p-12 text-center space-y-4">
            <div className="text-[var(--color-text-muted)]">No operations found with these criteria</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSelectedStatus('open');
                setShowRecommended(false);
              }}
              className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOperations.map((operation) => (
              <div key={operation.id} className="operator-card rounded-lg p-6 space-y-4 hover:border-[var(--color-primary)]/40 transition-colors">
                {/* Operation Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white">{operation.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${OPERATION_PRIORITY_COLORS[operation.priority]}`}>
                        {operation.priority}
                      </span>
                      <span className={`text-sm ${OPERATION_STATUS_COLORS[operation.status]}`}>
                        {operation.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <span>{getCategoryIcon(operation.category)}</span>
                      <span className="text-[var(--color-text-muted)]">{operation.category}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>{getDifficultyIcon(operation.difficulty)}</span>
                      <span className="text-[var(--color-text-muted)]">{operation.difficulty}</span>
                    </span>
                    <span className="text-[var(--color-text-muted)]">{operation.estimatedHours}h</span>
                  </div>
                </div>

                {/* Description */}
                <div className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                  {operation.description.split('\n')[0].substring(0, 150)}
                  {operation.description.length > 150 && '...'}
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <div className="text-sm text-[var(--color-text-muted)]">Required Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {operation.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-2 py-1 rounded text-xs border ${
                          profile.skills.includes(skill as any)
                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rewards */}
                <div className="grid grid-cols-3 gap-4 py-2 border-t border-[var(--color-primary)]/20">
                  <div className="text-center">
                    <div className="text-[var(--color-primary)] font-bold">
                      {calculateFinalXp(operation.reward.xp, operation.difficulty)}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">XP</div>
                  </div>
                  {operation.reward.tokens && (
                    <div className="text-center">
                      <div className="text-[var(--color-primary)] font-bold">
                        {operation.reward.tokens}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">{operation.reward.currency}</div>
                    </div>
                  )}
                  {operation.deadline && (
                    <div className="text-center">
                      <div className={`font-bold ${
                        getTimeRemaining(operation.deadline) === 'Overdue' ? 'text-red-400' : 'text-white'
                      }`}>
                        {getTimeRemaining(operation.deadline)}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">remaining</div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {operation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {operation.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[var(--color-bg)] text-[var(--color-text-muted)] rounded text-xs border border-[var(--color-primary)]/20"
                      >
                        #{tag}
                      </span>
                    ))}
                    {operation.tags.length > 4 && (
                      <span className="text-xs text-[var(--color-text-muted)] px-2 py-1">
                        +{operation.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 py-2 bg-[var(--color-surface)] text-white border border-[var(--color-primary)]/30 rounded hover:border-[var(--color-primary)]/50 transition-colors text-sm">
                    View Details
                  </button>
                  {operation.status === 'open' && (
                    <button
                      onClick={() => handleAcceptOperation(operation.id)}
                      disabled={acceptingOperation === operation.id}
                      className="flex-1 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {acceptingOperation === operation.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Accepting...
                        </>
                      ) : (
                        'Accept Operation'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}