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
  /** Callback to connect wallet (upgrade from demo) */
  onConnectWallet?: () => void;
  /** Whether in demo mode */
  demoMode?: boolean;
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
export default function OperatorDashboard({ profile, onViewDirectory, onViewMachines, onViewOperations, onConnectWallet, demoMode = false }: OperatorDashboardProps) {
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState(new Date());
  const [feeRoutes, setFeeRoutes] = useState<Array<{id: string, amount: number, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isHeartbeatActive, setIsHeartbeatActive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [networkUptime] = useState(99.4);
  const [xpGrowth] = useState(15.7);
  const [activeOperations] = useState(3);
  const [completionRate] = useState(92.3);

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
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-gradient-to-r from-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 border-b border-[var(--color-secondary)]/30">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[var(--color-secondary)] rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">
                  🚀 You're exploring the Operator Network in demo mode. Connect your wallet to create a real profile and earn rewards!
                </span>
              </div>
              {onConnectWallet && (
                <button
                  onClick={onConnectWallet}
                  className="px-4 py-2 bg-[var(--color-primary)] text-black rounded-lg text-sm font-bold hover:bg-[var(--color-primary)]/80 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network Status Banner */}
      <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border-b border-[var(--color-primary)]/20">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              <span className="text-[var(--color-primary)] text-sm font-medium">
                ⚡ The Operator Network is operating at {networkUptime}% uptime — excellent work, operators.
              </span>
            </div>
            <div className="px-3 py-1 bg-[var(--color-primary)] text-black rounded-full text-xs font-bold">
              LIVE
            </div>
          </div>
        </div>
      </div>

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
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Operator Dashboard</h1>
              <p className="text-[var(--color-text-muted)]">Real-time operations and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Period Selector */}
              <div className="flex bg-[var(--color-surface)] rounded-lg p-1 border border-[var(--color-primary)]/20">
                {(['24h', '7d', '30d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      selectedTimeframe === period
                        ? 'bg-[var(--color-primary)] text-black'
                        : 'text-[var(--color-text-muted)] hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
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
                {demoMode ? 'Demo Mode - Connect Wallet to Upgrade' : `Connected: ${profile.walletAddress.slice(0, 8)}...${profile.walletAddress.slice(-8)}`}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-[var(--color-text-muted)]">Status</div>
              <div className="text-[var(--color-primary)] font-medium">ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Active Ops */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Active Ops
              </h3>
              <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-primary)] text-lg">⚡</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">{profile.activeOps}</div>
              <div className="flex items-center space-x-2">
                <span className="text-[var(--color-primary)] text-sm font-medium">In Progress</span>
                <span className="text-[var(--color-text-muted)] text-sm">across all machines</span>
              </div>
            </div>
          </div>

          {/* Open Ops Available */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Open Ops Available
              </h3>
              <div className="w-8 h-8 bg-[var(--color-secondary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-secondary)] text-lg">🎯</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">7</div>
              <div className="flex items-center space-x-2">
                <span className="text-[var(--color-primary)] text-sm font-medium">Ready to claim</span>
                <span className="text-[var(--color-text-muted)] text-sm">matching your skills</span>
              </div>
            </div>
          </div>

          {/* Machines Connected */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Machines Connected
              </h3>
              <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-primary)] text-lg">🔗</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">{profile.connectedMachines}</div>
              <div className="flex items-center space-x-2">
                <span className="text-[var(--color-primary)] text-sm font-medium">All active</span>
                <span className="text-[var(--color-text-muted)] text-sm">100% uptime</span>
              </div>
            </div>
          </div>

          {/* XP / Rank */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                XP / Rank
              </h3>
              <div className="w-8 h-8 bg-[var(--color-secondary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-secondary)] text-lg">👑</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">{profile.xp} XP</div>
              <div className="flex items-center space-x-2">
                <span className="text-[var(--color-primary)] text-sm font-medium">{profile.rank}</span>
                <span className="text-[var(--color-text-muted)] text-sm">level</span>
              </div>
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

        {/* Active Machines Section */}
        <div className="operator-card rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-[var(--color-secondary)]/20 rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-secondary)] text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-medium text-white">Active Machines</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Connected machines running in the network</p>

          <div className="space-y-4">
            {/* Machine 1 - AI Content Generator */}
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded flex items-center justify-center">
                    <span className="text-[var(--color-primary)] text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">CONTENT-GEN</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Role: Contributor • 3 Open Ops</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-primary)] font-bold text-sm">97.8%</div>
                  <div className="text-xs text-[var(--color-text-muted)]">uptime</div>
                </div>
              </div>
              <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                <div className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-1000" style={{width: '97.8%'}}></div>
              </div>
            </div>

            {/* Machine 2 - DeFi Analytics */}
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--color-secondary)]/20 rounded flex items-center justify-center">
                    <span className="text-[var(--color-secondary)] text-sm font-bold">DF</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">DEFI-ANALYTICS</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Role: Maintainer • 2 Open Ops</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-primary)] font-bold text-sm">94.2%</div>
                  <div className="text-xs text-[var(--color-text-muted)]">uptime</div>
                </div>
              </div>
              <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full transition-all duration-1000" style={{width: '94.2%'}}></div>
              </div>
            </div>

            {/* Machine 3 - Mars Survival Game */}
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded flex items-center justify-center">
                    <span className="text-[var(--color-primary)] text-sm font-bold">MG</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">MARS-GAME</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Role: Owner • 2 Open Ops</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-primary)] font-bold text-sm">99.1%</div>
                  <div className="text-xs text-[var(--color-text-muted)]">uptime</div>
                </div>
              </div>
              <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                <div className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-1000" style={{width: '99.1%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Activity Feed */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              <h3 className="text-lg font-medium text-white">Live Activity</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Real-time operator actions</p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[var(--color-bg)]/50 border border-[var(--color-primary)]/10">
                <div className="w-6 h-6 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[var(--color-primary)] text-xs">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Verified Op: Mars Game Performance in MARS-GAME</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[var(--color-text-muted)] text-xs">@demo_operator</p>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <p className="text-[var(--color-text-muted)] text-xs">12m ago</p>
                  </div>
                </div>
                <div className="text-[var(--color-primary)] text-sm font-bold">+50 XP</div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[var(--color-bg)]/50 border border-[var(--color-secondary)]/10">
                <div className="w-6 h-6 bg-[var(--color-secondary)]/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[var(--color-secondary)] text-xs">🔗</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Joined Machine: CONTENT-GEN as Contributor</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[var(--color-text-muted)] text-xs">@demo_operator</p>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <p className="text-[var(--color-text-muted)] text-xs">1h ago</p>
                  </div>
                </div>
                <div className="text-[var(--color-secondary)] text-sm font-bold">JOINED</div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[var(--color-bg)]/50 border border-[var(--color-primary)]/10">
                <div className="w-6 h-6 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[var(--color-primary)] text-xs">📝</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Claimed Op: UI Enhancement in DEFI-ANALYTICS</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[var(--color-text-muted)] text-xs">@demo_operator</p>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <p className="text-[var(--color-text-muted)] text-xs">3h ago</p>
                  </div>
                </div>
                <div className="text-[var(--color-primary)] text-sm font-bold">CLAIMED</div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-[var(--color-bg)]/50 border border-[var(--color-secondary)]/10">
                <div className="w-6 h-6 bg-[var(--color-secondary)]/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[var(--color-secondary)] text-xs">🎯</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Created Op: Documentation Update in MARS-GAME</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[var(--color-text-muted)] text-xs">@demo_operator</p>
                    <span className="text-[var(--color-text-muted)]">•</span>
                    <p className="text-[var(--color-text-muted)] text-xs">5h ago</p>
                  </div>
                </div>
                <div className="text-[var(--color-secondary)] text-sm font-bold">CREATED</div>
              </div>
            </div>
          </div>

          {/* Op Analytics */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-secondary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-secondary)] text-lg">📊</span>
              </div>
              <h3 className="text-lg font-medium text-white">Op Analytics</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Your operation performance</p>

            <div className="space-y-6">
              {/* Op Completion Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--color-text-muted)] text-sm">Op Completion Rate</span>
                  <span className="text-[var(--color-primary)] font-bold">{completionRate}%</span>
                </div>
                <div className="w-full bg-[var(--color-bg)] rounded-full h-3">
                  <div
                    className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Active Machines */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--color-text-muted)] text-sm">Active Machines</span>
                  <span className="text-white font-bold">{profile.connectedMachines}</span>
                </div>
                <div className="w-full bg-[var(--color-bg)] rounded-full h-3">
                  <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-3 rounded-full transition-all duration-1000" style={{width: '100%'}}></div>
                </div>
              </div>

              {/* Skill Match Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--color-text-muted)] text-sm">Skill Match Rate</span>
                  <span className="text-white font-bold">95%</span>
                </div>
                <div className="w-full bg-[var(--color-bg)] rounded-full h-3">
                  <div className="bg-[var(--color-secondary)] h-3 rounded-full transition-all duration-1000" style={{width: '95%'}}></div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-primary)]/20 mt-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] text-sm">Total Ops Completed</span>
                  <span className="text-[var(--color-primary)] font-bold">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] text-sm">Avg XP per Op</span>
                  <span className="text-[var(--color-primary)] font-bold">75 XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Analytics */}
          <div className="operator-card rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-lg flex items-center justify-center">
                <span className="text-[var(--color-primary)] text-lg">⚙️</span>
              </div>
              <h3 className="text-lg font-medium text-white">Machine Analytics</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Your connected machines</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)] text-sm">Total XP Earned</span>
                <span className="text-[var(--color-primary)] font-bold">{profile.xp} XP</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)] text-sm">Current Rank</span>
                <span className="text-[var(--color-primary)] font-bold">{profile.rank}</span>
              </div>
            </div>

            <div className="border-t border-[var(--color-primary)]/20 mt-6 pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Last {selectedTimeframe}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">Ops Completed</span>
                  <span className="text-white font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">XP Earned</span>
                  <span className="text-[var(--color-primary)] font-bold">850 XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)]">New Machines Joined</span>
                  <span className="text-white font-bold">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="operator-card rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Operator Skillset</h3>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill) => (
              <div
                key={skill}
                className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border border-[var(--color-primary)]/30 rounded-lg"
              >
                <span className="text-[var(--color-primary)] font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1 mt-8">
          <div>Last active: {profile.lastActive.toLocaleString()}</div>
          <div className="text-[var(--color-primary)]">tick... tick... tick... Network synchronized</div>
        </div>
      </div>
    </div>
  );
}