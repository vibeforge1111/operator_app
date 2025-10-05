import React, { useState, useEffect } from 'react';
import { OperatorProfile } from '../types/operator';

/**
 * Props for the OperatorDashboard component
 * @interface OperatorDashboardProps
 */
interface OperatorDashboardProps {
  /** The operator's profile data */
  profile: OperatorProfile;
  /** Callback to navigate to the operator directory */
  onViewDirectory: () => void;
  /** Callback to navigate to the machine marketplace */
  onViewMachines: () => void;
  /** Callback to navigate to the operation board */
  onViewOperations: () => void;
}

/**
 * Operator Dashboard Component
 *
 * Personal command center for operators showing real-time network activity,
 * operator status, and quick access to core network features.
 *
 * Features:
 * - Live network heartbeat visualization
 * - Real-time fee routing activity
 * - Operator profile and reputation display
 * - Connected machines and active operations overview
 * - Navigation to directory and machine marketplace
 *
 * @component
 * @param {OperatorDashboardProps} props - Component props
 * @returns {JSX.Element} The operator dashboard interface
 *
 * @example
 * ```tsx
 * <OperatorDashboard
 *   profile={operatorProfile}
 *   onViewDirectory={() => setView('directory')}
 *   onViewMachines={() => setView('machines')}
 * />
 * ```
 */
export default function OperatorDashboard({ profile, onViewDirectory, onViewMachines, onViewOperations }: OperatorDashboardProps) {
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState(new Date());
  const [feeRoutes, setFeeRoutes] = useState<Array<{id: string, amount: number, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isHeartbeatActive, setIsHeartbeatActive] = useState(true);

  // Initialize dashboard and simulate heartbeat
  useEffect(() => {
    // Simulate initial loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Simulate heartbeat with error recovery
    const interval = setInterval(() => {
      try {
        if (isHeartbeatActive) {
          setHeartbeatCount(prev => prev + 1);
          setLastHeartbeat(new Date());
          setNetworkError(null); // Clear any previous errors
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
        setNetworkError('Network heartbeat interrupted');
        setIsHeartbeatActive(false);

        // Attempt to restart heartbeat after 5 seconds
        setTimeout(() => {
          setIsHeartbeatActive(true);
          setNetworkError(null);
        }, 5000);
      }
    }, 1000);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(interval);
    };
  }, [isHeartbeatActive]);

  // Simulate fee routing with error handling
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Simulate occasional network failures (5% chance)
        if (Math.random() < 0.05) {
          throw new Error('Fee routing service temporarily unavailable');
        }

        const amount = 100 + Math.random() * 900;
        const newRoute = {
          id: Date.now().toString(),
          amount: Math.round(amount * 100) / 100,
          timestamp: new Date()
        };
        setFeeRoutes(prev => [newRoute, ...prev.slice(0, 9)]); // Keep last 10
        setNetworkError(null); // Clear any routing errors
      } catch (error) {
        console.error('Fee routing error:', error);
        // Don't set network error for fee routing issues as heartbeat is more critical
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="operator-card rounded-lg p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">Initializing Operator Dashboard...</div>
          <div className="text-sm text-[var(--color-text-muted)]">Connecting to network services</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen terminal-bg">
      {/* Error Banner */}
      {networkError && (
        <div className="bg-red-900/50 border-b border-red-500/50 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm">{networkError}</span>
            </div>
            <button
              onClick={() => setNetworkError(null)}
              className="text-red-300 hover:text-red-100 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[var(--color-primary)]/20 bg-[var(--color-surface)]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">OPERATOR NETWORK</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Command Center</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onViewDirectory}
              className="px-4 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 transition-colors"
            >
              Directory
            </button>
            <button
              onClick={onViewMachines}
              className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded hover:bg-[var(--color-secondary)]/80 transition-colors"
            >
              Machines
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Operator Header */}
        <div className="operator-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                <span className="text-[var(--color-primary)]">OPERATOR:</span> @{profile.handle}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Connected: {profile.walletAddress.slice(0, 8)}...{profile.walletAddress.slice(-8)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-[var(--color-text-muted)]">Status</div>
              <div className="text-[var(--color-primary)] font-medium">ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP & Rank */}
          <div className="operator-card rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Reputation
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-[var(--color-primary)]">{profile.xp}</span>
                <span className="text-sm text-[var(--color-text-muted)]">XP</span>
              </div>
              <div className="text-lg text-white">Rank: {profile.rank}</div>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="operator-card rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Machines:</span>
                <span className="text-white font-medium">{profile.connectedMachines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Active Ops:</span>
                <span className="text-white font-medium">{profile.activeOps}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="operator-card rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Skillset
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-sm font-medium border border-[var(--color-primary)]/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Empty States */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Machines */}
          <div className="operator-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Connected Machines</h3>
              <span className="text-sm text-[var(--color-text-muted)]">{profile.connectedMachines}</span>
            </div>
            <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-lg p-8 text-center space-y-3">
              <div className="text-[var(--color-text-muted)]">No machines connected yet</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Browse available machines to get started
              </div>
              <button
                onClick={onViewMachines}
                className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
              >
                Browse Machines
              </button>
            </div>
          </div>

          {/* Operations */}
          <div className="operator-card rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Active Operations</h3>
              <span className="text-sm text-[var(--color-text-muted)]">{profile.activeOps}</span>
            </div>
            <div className="border-2 border-dashed border-[var(--color-primary)]/30 rounded-lg p-8 text-center space-y-3">
              <div className="text-[var(--color-text-muted)]">No active ops</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Check the mission board for opportunities
              </div>
              <button
                onClick={onViewOperations}
                className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors"
              >
                Mission Board
              </button>
            </div>
          </div>
        </div>

        {/* Network Status & Real-time Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Heartbeat */}
          <div className="operator-card rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Network Heartbeat</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Pulse Count:</span>
                <span className="text-2xl font-bold text-[var(--color-primary)]">{heartbeatCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Last Beat:</span>
                <span className="text-white font-mono text-sm">{lastHeartbeat.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isHeartbeatActive ? (
                  <>
                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                    <span className="text-[var(--color-primary)] text-sm">Live</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 text-sm">Reconnecting...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fee Routing Activity */}
          <div className="operator-card rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Fee Routing Activity</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {feeRoutes.length === 0 ? (
                <div className="text-[var(--color-text-muted)] text-sm text-center py-4">
                  Waiting for fee routes...
                </div>
              ) : (
                feeRoutes.map((route) => (
                  <div key={route.id} className="flex justify-between items-center p-2 bg-[var(--color-bg)] rounded text-sm">
                    <span className="text-[var(--color-primary)]">${route.amount}</span>
                    <span className="text-[var(--color-text-muted)] font-mono text-xs">
                      {route.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1">
          <div>Last active: {profile.lastActive.toLocaleString()}</div>
          <div className="text-[var(--color-primary)]">tick... tick... tick... Network synchronized</div>
        </div>
      </div>
    </div>
  );
}