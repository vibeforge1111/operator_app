import React, { useState, useEffect } from 'react';
import { OperatorProfile } from '../types/operator';

interface OperatorDashboardProps {
  profile: OperatorProfile;
  onViewDirectory: () => void;
  onViewMachines: () => void;
}

export default function OperatorDashboard({ profile, onViewDirectory, onViewMachines }: OperatorDashboardProps) {
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState(new Date());
  const [feeRoutes, setFeeRoutes] = useState<Array<{id: string, amount: number, timestamp: Date}>>([]);

  // Simulate heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatCount(prev => prev + 1);
      setLastHeartbeat(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate fee routing
  useEffect(() => {
    const interval = setInterval(() => {
      const amount = 100 + Math.random() * 900;
      const newRoute = {
        id: Date.now().toString(),
        amount: Math.round(amount * 100) / 100,
        timestamp: new Date()
      };
      setFeeRoutes(prev => [newRoute, ...prev.slice(0, 9)]); // Keep last 10
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen terminal-bg">
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
              <button className="px-4 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/30 transition-colors">
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
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                <span className="text-[var(--color-primary)] text-sm">Live</span>
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