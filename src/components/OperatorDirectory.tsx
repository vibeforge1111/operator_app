import React, { useState, useMemo, useEffect } from 'react';
import { OperatorProfile, SKILL_TAGS, SkillTag, OperatorRank } from '../types/operator';
import { getOperators } from '../lib/firebase/operators';

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

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load operators from Firebase
  useEffect(() => {
    const loadOperators = async () => {
      try {
        setIsLoading(true);
        setNetworkError(null);

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
    };

    loadOperators();
  }, [selectedSkill, selectedRank, debouncedSearchQuery, sortBy]);

  // Firebase already handles filtering and sorting
  const filteredOperators = operators;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">Loading Operator Directory...</div>
          <div className="text-sm text-[var(--color-text-muted)]">Discovering network operators</div>
        </div>
      </div>
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
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[var(--color-surface)] text-white border border-[var(--color-primary)]/30 rounded hover:border-[var(--color-primary)]/50 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Search and Filters */}
        <div className="operator-card rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Results Count */}
        <div className="text-[var(--color-text-muted)] text-sm">
          {filteredOperators.length} operator{filteredOperators.length !== 1 ? 's' : ''} found
        </div>

        {/* Operator Grid */}
        {filteredOperators.length === 0 ? (
          <div className="operator-card rounded-lg p-12 text-center space-y-4">
            <div className="text-[var(--color-text-muted)]">No operators found with these criteria</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('all');
                setSelectedRank('all');
              }}
              className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOperators.map((operator) => (
              <div key={operator.id} className="operator-card rounded-lg p-6 space-y-4 hover:border-[var(--color-primary)]/40 transition-colors">
                {/* Operator Header */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    <span className="text-[var(--color-primary)]">@</span>{operator.handle}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-[var(--color-primary)]">{operator.xp} XP</span>
                    <span className="text-[var(--color-text-muted)]">|</span>
                    <span className="text-white">{operator.rank}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="text-sm text-[var(--color-text-muted)]">Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {operator.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded text-xs border border-[var(--color-primary)]/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-[var(--color-text-muted)]">Machines:</div>
                    <div className="text-white font-medium">{operator.connectedMachines}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--color-text-muted)]">Active Ops:</div>
                    <div className="text-white font-medium">{operator.activeOps}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[var(--color-primary)]/20">
                  <button className="w-full py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors text-sm">
                    View Profile
                  </button>
                </div>

                {/* Last Active */}
                <div className="text-xs text-[var(--color-text-muted)]">
                  Last active: {operator.lastActive instanceof Date
                    ? operator.lastActive.toLocaleDateString()
                    : new Date(operator.lastActive).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}