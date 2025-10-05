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
          setNetworkError(error.message);
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
      <div className="border-b border-[var(--color-primary)]/20 bg-[var(--color-surface)]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">OPERATOR DIRECTORY</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Discover and connect with operators</p>
          </div>
          <Button
            variant="secondary"
            onClick={onBack}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Search and Filters */}
        <EnhancedCard variant="glass" className="p-8 bg-gradient-to-r from-[var(--color-surface)]/90 via-[var(--color-surface)]/95 to-[var(--color-surface)]/90 backdrop-blur-xl border-2 border-[var(--color-primary)]/40 shadow-2xl shadow-[var(--color-primary)]/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-[var(--color-secondary)]/5 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
              <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></span>
              Advanced Operator Search
              <span className="text-sm font-normal text-[var(--color-text-muted)]">Discover network talent</span>
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Search Operators</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by handle..."
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-primary)]/30 rounded text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            {/* Skill Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Filter by Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as SkillTag | 'all')}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-primary)]/30 rounded text-white focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="all">All Skills</option>
                {SKILL_TAGS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Rank Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Filter by Rank</label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value as OperatorRank | 'all')}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-primary)]/30 rounded text-white focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="all">All Ranks</option>
                <option value="Apprentice">Apprentice</option>
                <option value="Operator">Operator</option>
                <option value="Senior">Senior</option>
                <option value="Architect">Architect</option>
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'alphabetical' | 'xp')}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-primary)]/30 rounded text-white focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="xp">Highest XP</option>
              </select>
            </div>
          </div>
          </div>
        </EnhancedCard>

        {/* Results Count */}
        <div className="text-[var(--color-text-muted)] text-sm flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOperators.map((operator) => (
              <EnhancedCard key={operator.id} variant="elevated" hover interactive className="p-6 space-y-4 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface)]/80">
                {/* Operator Header */}
                <div className="space-y-2 relative">
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--color-primary)] rounded-full animate-pulse shadow-lg shadow-[var(--color-primary)]/50"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-ping"></span>
                    <span className="text-[var(--color-primary)]">@</span>{operator.handle}
                    <span className="text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-normal">ONLINE</span>
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-[var(--color-primary)]">
                      <AnimatedCounter value={operator.xp} suffix=" XP" />
                    </span>
                    <span className="text-[var(--color-text-muted)]">|</span>
                    <Badge variant="secondary" size="sm">{operator.rank}</Badge>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="text-sm text-[var(--color-text-muted)]">Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {operator.skills.map((skill) => (
                      <SkillBadge
                        key={skill}
                        skill={skill}
                        interactive
                        className="bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:from-[var(--color-primary)]/30 hover:to-[var(--color-secondary)]/30 hover:border-[var(--color-primary)]/60 transform hover:scale-110 shadow-lg shadow-[var(--color-primary)]/20"
                      />
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-[var(--color-text-muted)]">Machines:</div>
                    <div className="text-white font-medium">
                      <AnimatedCounter value={operator.connectedMachines} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--color-text-muted)]">Active Ops:</div>
                    <div className="text-white font-medium">
                      <AnimatedCounter value={operator.activeOps} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[var(--color-primary)]/30">
                  <InteractiveButton
                    variant="operator"
                    size="sm"
                    className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black font-bold hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 transform hover:scale-105"
                    glow
                    pulse={false}
                  >
                    🔍 View Profile
                  </InteractiveButton>
                </div>

                {/* Last Active */}
                <div className="text-xs text-[var(--color-text-muted)]">
                  Last active: {operator.lastActive instanceof Date
                    ? operator.lastActive.toLocaleDateString()
                    : new Date(operator.lastActive).toLocaleDateString()}
                </div>
              </EnhancedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}