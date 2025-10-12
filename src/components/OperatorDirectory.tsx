import React, { useState, useMemo, useEffect } from 'react';
import { OperatorProfile, SKILL_TAGS, SkillTag, OperatorRank } from '../types/operator';
import { getOperators } from '../lib/firebase/operators';
import { subscribeToOperators, RealtimeManager } from '../lib/firebase/realtime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, EnhancedCard } from './ui/Card';
import { Button, InteractiveButton } from './ui/Button';
import { Badge, StatusBadge, SkillBadge } from './ui/Badge';
import { LoadingSpinner, FullPageLoading, CardLoading } from './ui/Loading';
import { AnimatedCounter } from './ui/AnimatedCounter';

/**
 * Props for the OperatorDirectory component
 * @interface OperatorDirectoryProps
 */
interface OperatorDirectoryProps {
  /** Callback to navigate back to the dashboard */
  onBack: () => void;
}

/**
 * Operator Directory Component
 *
 * A comprehensive directory for discovering and searching operators within
 * the network. Provides filtering by skills, sorting by various criteria,
 * and search functionality to help operators find collaborators.
 *
 * Features:
 * - Real-time search by operator handle
 * - Filter by skill specializations
 * - Sort by newest, alphabetical, or XP
 * - Responsive operator profile cards
 * - Live activity and connection data
 * - Clear filters functionality
 *
 * @component
 * @param {OperatorDirectoryProps} props - Component props
 * @returns {JSX.Element} The operator directory interface
 *
 * @example
 * ```tsx
 * <OperatorDirectory
 *   onBack={() => setView('dashboard')}
 * />
 * ```
 */
// Dummy operators data for demo
const DUMMY_OPERATORS: OperatorProfile[] = [
  {
    id: 'op_001',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    handle: 'cryptobuilder',
    skills: ['Dev', 'Design'],
    xp: 4200,
    rank: 'Architect',
    connectedMachines: 5,
    activeOps: 3,
    completionRate: 98,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_002',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    handle: 'vibemaster',
    skills: ['VibeOps', 'Narrative'],
    xp: 3500,
    rank: 'Senior',
    connectedMachines: 4,
    activeOps: 2,
    completionRate: 92,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: 'op_003',
    walletAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    handle: 'defi_wizard',
    skills: ['Dev', 'BizOps'],
    xp: 5800,
    rank: 'Architect',
    connectedMachines: 8,
    activeOps: 5,
    completionRate: 99,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 'op_004',
    walletAddress: '0x90abcdef1234567890abcdef1234567890abcdef',
    handle: 'pixel_artist',
    skills: ['Design', 'Narrative'],
    xp: 2200,
    rank: 'Operator',
    connectedMachines: 3,
    activeOps: 1,
    completionRate: 88,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 'op_005',
    walletAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
    handle: 'coordination_pro',
    skills: ['Coordination', 'BizOps'],
    xp: 3800,
    rank: 'Senior',
    connectedMachines: 6,
    activeOps: 4,
    completionRate: 95,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: 'op_006',
    walletAddress: '0x34567890abcdef1234567890abcdef1234567890',
    handle: 'solidity_sage',
    skills: ['Dev'],
    xp: 6500,
    rank: 'Architect',
    connectedMachines: 10,
    activeOps: 6,
    completionRate: 100,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
  {
    id: 'op_007',
    walletAddress: '0xef1234567890abcdef1234567890abcdef123456',
    handle: 'community_lead',
    skills: ['VibeOps', 'Coordination', 'Narrative'],
    xp: 2900,
    rank: 'Senior',
    connectedMachines: 4,
    activeOps: 3,
    completionRate: 91,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: 'op_008',
    walletAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    handle: 'rookie_dev',
    skills: ['Dev', 'Design'],
    xp: 500,
    rank: 'Apprentice',
    connectedMachines: 1,
    activeOps: 0,
    completionRate: 75,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date(),
    lastActive: new Date(),
  }
];

export default function OperatorDirectory({ onBack }: OperatorDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillTag | 'all'>('all');
  const [selectedRank, setSelectedRank] = useState<OperatorRank | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'xp'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [realtimeManager] = useState(() => new RealtimeManager());
  const [useDummyData, setUseDummyData] = useState(false);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set up real-time listeners for operators
  useEffect(() => {
    setIsLoading(true);
    setNetworkError(null);

    // Use dummy data for demo
    const useMockData = true; // Set to true to always use dummy data

    if (useMockData) {
      // Apply filters and sorting to dummy data
      setTimeout(() => {
        let filteredOps = [...DUMMY_OPERATORS];

        // Filter by skill
        if (selectedSkill !== 'all') {
          filteredOps = filteredOps.filter(op => op.skills.includes(selectedSkill));
        }

        // Filter by rank
        if (selectedRank !== 'all') {
          filteredOps = filteredOps.filter(op => op.rank === selectedRank);
        }

        // Search filter
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredOps = filteredOps.filter(op =>
            op.handle.toLowerCase().includes(query)
          );
        }

        // Sorting
        if (sortBy === 'alphabetical') {
          filteredOps.sort((a, b) => a.handle.localeCompare(b.handle));
        } else if (sortBy === 'xp') {
          filteredOps.sort((a, b) => b.xp - a.xp);
        } else if (sortBy === 'newest') {
          filteredOps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        setOperators(filteredOps);
        setIsLoading(false);
      }, 500); // Simulate loading

      return;
    }

    // Clean up previous listeners
    realtimeManager.cleanup();

    // Subscribe to real-time operators
    const unsubscribe = subscribeToOperators(
      {
        skillFilter: selectedSkill === 'all' ? undefined : selectedSkill,
        rankFilter: selectedRank === 'all' ? undefined : selectedRank,
        limitCount: 50
      },
      (operators, error) => {
        if (error) {
          // Fall back to dummy data on error
          setUseDummyData(true);
          let filteredOps = [...DUMMY_OPERATORS];

          // Apply filters to dummy data
          if (selectedSkill !== 'all') {
            filteredOps = filteredOps.filter(op => op.skills.includes(selectedSkill));
          }
          if (selectedRank !== 'all') {
            filteredOps = filteredOps.filter(op => op.rank === selectedRank);
          }
          if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filteredOps = filteredOps.filter(op =>
              op.handle.toLowerCase().includes(query)
            );
          }

          setOperators(filteredOps);
          setIsLoading(false);
          return;
        }

        // Apply client-side search filter and sorting
        let filteredOps = operators;

        // Search filter
        if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredOps = operators.filter(op =>
            op.handle.toLowerCase().includes(query)
          );
        }

        // Client-side sorting for specific sort options
        if (sortBy === 'alphabetical') {
          filteredOps.sort((a, b) => a.handle.localeCompare(b.handle));
        } else if (sortBy === 'xp') {
          filteredOps.sort((a, b) => b.xp - a.xp);
        }
        // 'newest' sorting is handled by Firebase query (lastActive desc)

        setOperators(filteredOps);
        setIsLoading(false);
      }
    );

    realtimeManager.addListener(unsubscribe);

    // Cleanup on unmount
    return () => {
      realtimeManager.cleanup();
    };
  }, [selectedSkill, selectedRank, debouncedSearchQuery, sortBy]);

  // Firebase already handles filtering and sorting
  const filteredOperators = operators;

  // Show loading state
  if (isLoading) {
    return (
      <FullPageLoading
        title="Loading Operator Directory..."
        description="Discovering network operators"
        variant="spinner"
        size="lg"
      />
    );
  }

  // Show error state
  if (networkError) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 text-red-500 mx-auto">⚠️</div>
          <div className="text-white">Failed to Load Directory</div>
          <div className="text-sm text-red-400">{networkError}</div>
          <button
            onClick={async () => {
              try {
                setNetworkError(null);
                setIsLoading(true);
                const result = await getOperators({
                  skillFilter: selectedSkill === 'all' ? undefined : selectedSkill,
                  rankFilter: selectedRank === 'all' ? undefined : selectedRank,
                  searchQuery: debouncedSearchQuery || undefined,
                  sortBy,
                  limitCount: 50
                });
                setOperators(result.operators);
                setIsLoading(false);
              } catch (error) {
                setNetworkError(error instanceof Error ? error.message : 'Failed to load operators');
                setIsLoading(false);
              }
            }}
            className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
          >
            Retry
          </button>
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
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Operator Directory</h1>
            <p className="text-[var(--muted-foreground)]">Discover and connect with operators</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Search and Filters */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by handle..."
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              />
            </div>

            {/* Skill Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as SkillTag | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Skills</option>
                {SKILL_TAGS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Rank Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Rank</label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value as OperatorRank | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Ranks</option>
                <option value="Apprentice">Apprentice</option>
                <option value="Operator">Operator</option>
                <option value="Senior">Senior</option>
                <option value="Architect">Architect</option>
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'alphabetical' | 'xp')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="xp">Highest XP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-[var(--muted-foreground)] text-sm flex items-center gap-2">
          <AnimatedCounter value={filteredOperators.length} />
          <span>operator{filteredOperators.length !== 1 ? 's' : ''} found</span>
        </div>

        {/* Operator Grid */}
        {filteredOperators.length === 0 ? (
          <EnhancedCard variant="clean" className="p-12 text-center space-y-4">
            <div className="text-[var(--color-text-muted)]">No operators found with these criteria</div>
            <InteractiveButton
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('all');
                setSelectedRank('all');
              }}
            >
              Clear Filters
            </InteractiveButton>
          </EnhancedCard>
        ) : (
          <div className="space-y-2">
            {filteredOperators.map((operator, index) => (
              <div
                key={operator.id}
                className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-[var(--foreground)]/20 transition-all duration-200"
              >
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                      {operator.handle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Operator Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[var(--foreground)]">
                      {operator.handle}
                    </h3>
                    <span className="text-xs text-[var(--color-primary)]/70 bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {operator.xp} XP
                    </span>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {operator.skills.join(' · ')}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs">
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.completionRate || 95}%</span>
                    <span className="ml-1">completion</span>
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.connectedMachines}</span>
                    <span className="ml-1">machines</span>
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    <span className="text-[var(--foreground)]">{operator.activeOps}</span>
                    <span className="ml-1">ops</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <button
                    className="px-3 py-1.5 text-xs bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}