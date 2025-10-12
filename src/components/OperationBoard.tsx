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
import { CustomDropdown } from './ui/CustomDropdown';
import logo from '../assets/logo.png';

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

// Dummy operations data for demo
const DUMMY_OPERATIONS: Operation[] = [
  {
    id: 'op_001',
    title: 'Implement Dark Mode Toggle',
    description: 'Add a dark mode toggle to the settings panel that persists user preference in local storage. Should smoothly transition between themes and update all UI components.',
    category: 'Development',
    difficulty: 'Intermediate',
    priority: 'High',
    status: 'Open',
    requiredSkills: ['React', 'CSS', 'TypeScript'],
    estimatedHours: 4,
    reward: { xp: 500, tokens: 50, currency: 'USDC' },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
    machineId: 'machine_123',
    machineName: 'DeFi Dashboard',
    tags: ['frontend', 'ui', 'feature'],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date(),
    assignedTo: [],
    completedBy: null,
    verifiedBy: null
  },
  {
    id: 'op_002',
    title: 'Write API Documentation',
    description: 'Document all REST API endpoints with clear examples, request/response formats, and error codes. Include authentication requirements and rate limiting information.',
    category: 'Documentation',
    difficulty: 'Beginner',
    priority: 'Medium',
    status: 'Open',
    requiredSkills: ['Technical Writing', 'API Design'],
    estimatedHours: 6,
    reward: { xp: 300, tokens: 30, currency: 'USDC' },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 days from now
    machineId: 'machine_456',
    machineName: 'API Gateway',
    tags: ['documentation', 'api', 'technical-writing'],
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date(),
    assignedTo: [],
    completedBy: null,
    verifiedBy: null
  },
  {
    id: 'op_003',
    title: 'Design New Landing Page',
    description: 'Create a modern, conversion-optimized landing page design. Should include hero section, features, testimonials, and clear CTAs. Mobile-responsive design required.',
    category: 'Design',
    difficulty: 'Advanced',
    priority: 'Critical',
    status: 'Open',
    requiredSkills: ['UI Design', 'Figma', 'Web Design'],
    estimatedHours: 12,
    reward: { xp: 1000, tokens: 100, currency: 'USDC' },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    machineId: 'machine_789',
    machineName: 'Marketing Site',
    tags: ['design', 'landing-page', 'ui-ux'],
    createdAt: new Date('2024-03-21'),
    updatedAt: new Date(),
    assignedTo: [],
    completedBy: null,
    verifiedBy: null
  },
  {
    id: 'op_004',
    title: 'Smart Contract Security Audit',
    description: 'Review and audit the token staking smart contract for security vulnerabilities. Provide detailed report with findings and recommendations.',
    category: 'Research',
    difficulty: 'Expert',
    priority: 'Critical',
    status: 'Open',
    requiredSkills: ['Solidity', 'Security', 'Smart Contracts'],
    estimatedHours: 20,
    reward: { xp: 2000, tokens: 500, currency: 'USDC' },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 96), // 4 days from now
    machineId: 'machine_101',
    machineName: 'DeFi Protocol',
    tags: ['blockchain', 'security', 'audit'],
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date(),
    assignedTo: [],
    completedBy: null,
    verifiedBy: null
  },
  {
    id: 'op_005',
    title: 'Community Discord Bot',
    description: 'Build a Discord bot for community management. Features: welcome messages, role assignment, moderation tools, and stats tracking.',
    category: 'Development',
    difficulty: 'Intermediate',
    priority: 'Medium',
    status: 'Open',
    requiredSkills: ['Node.js', 'Discord.js', 'JavaScript'],
    estimatedHours: 8,
    reward: { xp: 750, tokens: 75, currency: 'USDC' },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 120), // 5 days from now
    machineId: 'machine_202',
    machineName: 'Community Hub',
    tags: ['bot', 'discord', 'community'],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date(),
    assignedTo: [],
    completedBy: null,
    verifiedBy: null
  }
];

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
  const [useDummyData, setUseDummyData] = useState(true); // Use dummy data for demo

  // XP System integration
  const { calculateXPReward, awardXP, isAwarding } = useXPSystem();
  const { updateProfile } = useOperatorProfile(profile.walletAddress);

  // Set up real-time listeners for operations
  useEffect(() => {
    setIsLoading(true);
    setLoadingError(null);

    // Use dummy data for demo
    if (useDummyData) {
      setTimeout(() => {
        setOperations(DUMMY_OPERATIONS);
        setIsLoading(false);
      }, 500);
      return;
    }

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
  }, [selectedStatus, searchQuery, useDummyData]);

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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 animate-spin mx-auto">
            <img src={logo} alt="Loading" className="w-full h-full object-contain" />
          </div>
          <div className="text-[var(--foreground)]">Loading Operation Board...</div>
          <div className="text-sm text-[var(--muted-foreground)]">Fetching available missions</div>
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
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-[var(--foreground)]">
              {operations.filter(op => op.status === 'Open').length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Open Operations</div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-[var(--foreground)]">
              {filterOperationsBySkills(operations.filter(op => op.status === 'Open'), profile.skills).length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Recommended</div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-[var(--foreground)]">
              {operations.filter(op => op.assigneeId === profile.id).length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Your Operations</div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className="text-2xl font-medium text-[var(--foreground)]">
              {operations.filter(op => op.priority === 'Critical').length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Critical Priority</div>
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
              <CustomDropdown
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value as OperationCategory | 'all')}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...OPERATION_CATEGORIES.map(category => ({ value: category, label: category }))
                ]}
                placeholder="Select category..."
              />
            </div>

            {/* Priority Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Priority</label>
              <CustomDropdown
                value={selectedPriority}
                onChange={(value) => setSelectedPriority(value as OperationPriority | 'all')}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  ...OPERATION_PRIORITIES.map(priority => ({ value: priority, label: priority }))
                ]}
                placeholder="Select priority..."
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Status</label>
              <CustomDropdown
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value as OperationStatus | 'all')}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...OPERATION_STATUSES.map(status => ({ value: status, label: status }))
                ]}
                placeholder="Select status..."
              />
            </div>

            {/* Recommended Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Filter</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded">
                <label className="custom-checkbox cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecommended}
                    onChange={(e) => setShowRecommended(e.target.checked)}
                  />
                  <span className="checkbox-mark"></span>
                </label>
                <label
                  htmlFor=""
                  onClick={() => setShowRecommended(!showRecommended)}
                  className="text-[var(--foreground)] text-sm cursor-pointer select-none"
                >
                  Recommended
                </label>
              </div>
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
          <div className="space-y-4">
            {filteredOperations.map((operation) => (
              <div key={operation.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--foreground)]/20 transition-all duration-200">
                {/* Operation Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{getCategoryIcon(operation.category)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">{operation.title}</h3>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-0.5 rounded border ${
                            operation.priority === 'Critical' || operation.priority === 'High'
                              ? 'text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/30'
                              : 'text-[var(--muted-foreground)] bg-[var(--muted)] border-[var(--border)]'
                          }`}>
                            {operation.priority}
                          </span>
                          <span className="text-[var(--muted-foreground)]">{operation.category}</span>
                          <span className="text-[var(--muted-foreground)]">·</span>
                          <span className="text-[var(--muted-foreground)]">{getDifficultyIcon(operation.difficulty)} {operation.difficulty}</span>
                          <span className="text-[var(--muted-foreground)]">·</span>
                          <span className="text-[var(--foreground)]">{operation.estimatedHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-[var(--color-primary)]/70">{calculateFinalXp(operation.reward.xp, operation.difficulty)}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">XP reward</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-4">
                  {operation.description}
                </p>

                {/* Machine Info */}
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="text-[var(--muted-foreground)]">For machine:</span>
                  <span className="text-[var(--foreground)]">{operation.machineName}</span>
                </div>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {operation.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-1 rounded text-xs border ${
                        profile.skills.includes(skill as any)
                          ? 'text-[var(--color-primary)]/70 bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30'
                          : 'text-[var(--muted-foreground)] bg-[var(--background)] border-[var(--border)]'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Bottom Info Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-6 text-xs">
                    {operation.reward.tokens && (
                      <div className="text-[var(--muted-foreground)]">
                        <span className="text-[var(--foreground)] font-medium">${operation.reward.tokens}</span> {operation.reward.currency}
                      </div>
                    )}
                    {operation.deadline && (
                      <div className={`${
                        getTimeRemaining(operation.deadline) === 'Overdue' ? 'text-[#FF4D4D]' : 'text-[var(--muted-foreground)]'
                      }`}>
                        <span className="font-medium">{getTimeRemaining(operation.deadline)}</span> left
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="px-4 py-1.5 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors">
                      View Details
                    </button>
                    {operation.status === 'Open' && (
                      <button
                        onClick={() => handleAcceptOperation(operation.id)}
                        disabled={acceptingOperation === operation.id}
                        className="px-4 py-1.5 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 disabled:opacity-50 transition-opacity font-medium flex items-center"
                      >
                        {acceptingOperation === operation.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin mr-1.5"></div>
                            Accepting...
                          </>
                        ) : (
                          'Accept Operation'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}