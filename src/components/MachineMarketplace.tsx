import React, { useState, useMemo, useEffect } from 'react';
import { Machine, MachineCategory } from '../types/machine';
import { getMachines, connectOperatorToMachine } from '../lib/firebase/machines';
import { getOperators } from '../lib/firebase/operators';
import { subscribeToMachines, subscribeToOperators, RealtimeManager } from '../lib/firebase/realtime';

/**
 * Props for the MachineMarketplace component
 * @interface MachineMarketplaceProps
 */
interface MachineMarketplaceProps {
  /** Callback to navigate back to the dashboard */
  onBack: () => void;
  /** Callback when an operator connects to a machine */
  onConnectToMachine: (machineId: string) => void;
}

/**
 * All available machine categories in the network
 * @constant
 */
const MACHINE_CATEGORIES: MachineCategory[] = ['Game', 'Tool', 'Product', 'Service', 'Content', 'Infrastructure'];

/**
 * Machine Marketplace Component
 *
 * A comprehensive marketplace for discovering and connecting to Machines of Production.
 * Operators can browse, filter, and join autonomous systems that generate value
 * through collaborative operation.
 *
 * Features:
 * - Advanced filtering by category, status, and availability
 * - Real-time search across names, descriptions, and tags
 * - Rich machine metadata display (revenue, operators, metrics)
 * - One-click connection system with operator slot management
 * - Live links to running machines
 * - Revenue and operator transparency
 *
 * @component
 * @param {MachineMarketplaceProps} props - Component props
 * @returns {JSX.Element} The machine marketplace interface
 *
 * @example
 * ```tsx
 * <MachineMarketplace
 *   onBack={() => setView('dashboard')}
 *   onConnectToMachine={(machineId) => handleConnection(machineId)}
 * />
 * ```
 */
export default function MachineMarketplace({ onBack, onConnectToMachine }: MachineMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MachineCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Active' | 'Development'>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectingToMachine, setConnectingToMachine] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operators, setOperators] = useState<{ [id: string]: string }>({});
  const [realtimeManager] = useState(() => new RealtimeManager());

  // Set up real-time listeners for machines and operators
  useEffect(() => {
    setIsLoading(true);
    setConnectionError(null);

    // Clean up previous listeners
    realtimeManager.cleanup();

    // Subscribe to real-time machines
    const machinesUnsubscribe = subscribeToMachines(
      {
        categoryFilter: selectedCategory === 'all' ? undefined : selectedCategory,
        statusFilter: selectedStatus === 'all' ? undefined : selectedStatus,
        availableOnly: showAvailableOnly,
        limitCount: 50
      },
      (machines, error) => {
        if (error) {
          setConnectionError(error.message);
          setIsLoading(false);
          return;
        }

        // Apply client-side search filter
        let filteredMachines = machines;
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredMachines = machines.filter(machine =>
            machine.name.toLowerCase().includes(query) ||
            machine.description.toLowerCase().includes(query) ||
            machine.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        setMachines(filteredMachines);
        setIsLoading(false);
      }
    );

    // Subscribe to operators for name mapping
    const operatorsUnsubscribe = subscribeToOperators(
      { limitCount: 200 },
      (operators, error) => {
        if (error) {
          console.error('Failed to load operators:', error);
          return;
        }

        // Create operator ID to handle mapping
        const operatorMap: { [id: string]: string } = {};
        operators.forEach(op => {
          operatorMap[op.id] = op.handle;
        });
        setOperators(operatorMap);
      }
    );

    realtimeManager.addListener(machinesUnsubscribe);
    realtimeManager.addListener(operatorsUnsubscribe);

    // Cleanup on unmount
    return () => {
      realtimeManager.cleanup();
    };
  }, [selectedCategory, selectedStatus, showAvailableOnly, searchQuery]);

  // Firebase already handles filtering
  const filteredMachines = machines;

  /**
   * Handles machine connection with error handling and loading states
   *
   * @param {string} machineId - The ID of the machine to connect to
   */
  const handleMachineConnection = async (machineId: string) => {
    setConnectingToMachine(machineId);
    setConnectionError(null);

    try {
      // TODO: Get actual operator ID from context/auth
      const demoOperatorId = 'demo-operator-id';

      // Connect to machine - realtime listener will automatically update the UI
      await connectOperatorToMachine(machineId, demoOperatorId);

      onConnectToMachine(machineId);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setConnectingToMachine(null);
    }
  };

  /**
   * Retrieves operator handles from operator IDs
   *
   * @param {string[]} operatorIds - Array of operator IDs to look up
   * @returns {string[]} Array of operator handles or 'Unknown' for missing operators
   */
  const getOperatorNames = (operatorIds: string[]) => {
    return operatorIds.map(id => operators[id] || 'Unknown');
  };

  /**
   * Returns the appropriate emoji icon for a machine category
   *
   * @param {MachineCategory} category - The machine category
   * @returns {string} Emoji icon representing the category
   */
  const getCategoryIcon = (category: MachineCategory) => {
    switch (category) {
      case 'Game': return '🎮';
      case 'Tool': return '🔧';
      case 'Product': return '📦';
      case 'Service': return '⚙️';
      case 'Content': return '📄';
      case 'Infrastructure': return '🏗️';
      default: return '⚡';
    }
  };

  /**
   * Returns the appropriate CSS color class for a machine status
   *
   * @param {string} status - The machine status
   * @returns {string} Tailwind CSS color class for the status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Development': return 'text-yellow-400';
      case 'Maintenance': return 'text-orange-400';
      case 'Archived': return 'text-gray-400';
      default: return 'text-[var(--color-text-muted)]';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">Loading Machine Marketplace...</div>
          <div className="text-sm text-[var(--color-text-muted)]">Fetching available machines</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg">
      {/* Error Banner */}
      {connectionError && (
        <div className="bg-red-900/50 border-b border-red-500/50 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm">{connectionError}</span>
            </div>
            <button
              onClick={() => setConnectionError(null)}
              className="text-red-300 hover:text-red-100 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Machine Marketplace</h1>
            <p className="text-[var(--muted-foreground)]">Discover and connect to Machines of Production</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Filters */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search machines..."
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MachineCategory | 'all')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Categories</option>
                {MACHINE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'Active' | 'Development')}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Development">Development</option>
              </select>
            </div>

            {/* Available Only */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)]">Filter</label>
              <label className="flex items-center space-x-2 cursor-pointer px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded focus:ring-[var(--foreground)]"
                />
                <span className="text-[var(--foreground)] text-sm">Available only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-[var(--muted-foreground)] text-sm">
          {filteredMachines.length} machine{filteredMachines.length !== 1 ? 's' : ''} found
        </div>

        {/* Machine Grid */}
        {filteredMachines.length === 0 ? (
          <div className="operator-card rounded-lg p-12 text-center space-y-4">
            <div className="text-[var(--color-text-muted)]">No machines found with these criteria</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setShowAvailableOnly(false);
              }}
              className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMachines.map((machine) => (
              <div key={machine.id} className="operator-card rounded-lg p-6 space-y-4 hover:border-[var(--color-primary)]/40 transition-colors">
                {/* Machine Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCategoryIcon(machine.category)}</span>
                      <h3 className="text-lg font-bold text-white">{machine.name}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${getStatusColor(machine.status)}`}>{machine.status}</span>
                      <span className="text-[var(--color-text-muted)]">•</span>
                      <span className="text-[var(--color-text-muted)]">{machine.category}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-[var(--color-primary)] font-medium">{machine.earnings.monthly} {machine.earnings.currency}/mo</div>
                    <div className="text-[var(--color-text-muted)]">{machine.metrics.users} users</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{machine.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {machine.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded text-xs border border-[var(--color-primary)]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Operators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Operators ({machine.operators.length}/{machine.maxOperators})</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: machine.maxOperators }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < machine.operators.length
                              ? 'bg-[var(--color-primary)]'
                              : 'bg-[var(--color-primary)]/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {machine.operators.length > 0 && (
                    <div className="text-sm text-[var(--color-text-muted)]">
                      Connected: {getOperatorNames(machine.operators).join(', ')}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm border-t border-[var(--color-primary)]/20 pt-4">
                  <div>
                    <div className="text-[var(--color-primary)] font-medium">${machine.metrics.revenue.toLocaleString()}</div>
                    <div className="text-[var(--color-text-muted)] text-xs">Revenue</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-primary)] font-medium">{machine.metrics.users.toLocaleString()}</div>
                    <div className="text-[var(--color-text-muted)] text-xs">Users</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-primary)] font-medium">{machine.metrics.uptime}%</div>
                    <div className="text-[var(--color-text-muted)] text-xs">Uptime</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  {machine.liveUrl && (
                    <a
                      href={machine.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors text-sm"
                    >
                      Visit Live
                    </a>
                  )}
                  <button
                    onClick={() => handleMachineConnection(machine.id)}
                    disabled={machine.operators.length >= machine.maxOperators || connectingToMachine === machine.id}
                    className="flex-1 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    {connectingToMachine === machine.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </>
                    ) : machine.operators.length >= machine.maxOperators ? 'Full' : 'Connect'}
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