/**
 * MVP Dashboard Component
 *
 * Operator Network MVP dashboard following ui_wireframes_notes.md specification
 * Uses canonical terminology: Operator, Machine, Op
 */

import React, { useState } from 'react';
import { OperatorProfile } from '../types/operator';
import { AnimatedCounter } from './ui/AnimatedCounter';

interface MVPDashboardProps {
  profile: OperatorProfile;
  onNavigate?: (view: string) => void;
}

export function MVPDashboard({ profile, onNavigate }: MVPDashboardProps) {
  // MVP Stat Cards Data (following canonical schema)
  const [operatorStats] = useState({
    activeOps: 2,
    openOpsAvailable: 15,
    machinesConnected: 3,
    xp: profile.xp,
    rank: profile.rank,
  });

  // Recent Activity (MVP format - live activity style)
  const [recentActivity] = useState([
    { user: '@nova', action: 'optimized Analytics Processor', time: 'just now' },
    { user: '@atlas', action: 'completed Op on Validator Machine Pro', time: 'just now' },
    { user: '@quantum', action: 'completed Op on LaunchOps Engine', time: 'just now' },
    { user: '@quantum', action: 'earned 85 XP', time: 'just now' },
    { user: '@quantum', action: 'optimized NFT Mint Factory', time: 'just now' },
  ]);

  // Your Machines (MVP format with correct badges)
  const [yourMachines] = useState([
    {
      id: 1,
      name: 'CT Online',
      category: 'Gaming',
      role: 'Contributor',
      openOps: 47,
      activeOps: 34,
      contributors: 2,
      completed7d: 5,
      monthlyRevenue: 8500000
    },
    {
      id: 2,
      name: 'Predictooor',
      category: 'Prediction Markets',
      role: 'Maintainer',
      openOps: 32,
      activeOps: 45,
      contributors: 1,
      completed7d: 8,
      monthlyRevenue: 12400000
    },
    {
      id: 3,
      name: 'Clipper Marketplace',
      category: 'Social',
      role: 'Owner',
      openOps: 28,
      activeOps: 23,
      contributors: 0,
      completed7d: 0,
      monthlyRevenue: 5700000
    },
  ]);

  // MVP Stat Cards (canonical labels from wireframes)
  const metricCards = [
    {
      title: 'Active Ops',
      value: operatorStats.activeOps,
    },
    {
      title: 'Open Ops Available',
      value: operatorStats.openOpsAvailable,
    },
    {
      title: 'Machines Connected',
      value: operatorStats.machinesConnected,
    },
    {
      title: 'XP / Rank',
      value: `${operatorStats.xp} XP · ${operatorStats.rank}`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome, @{profile.handle}
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Your command center for Machines and Ops
        </p>
      </div>

      {/* Stat Cards (four across on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <div key={metric.title} className="clean-card p-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {metric.title}
              </p>
              <div className="text-2xl font-bold text-[var(--foreground)]">
                {typeof metric.value === 'number' ? (
                  <AnimatedCounter value={metric.value} />
                ) : (
                  metric.value
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Section */}
        <div>
          <div className="clean-card p-6 h-full flex flex-col">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-[var(--muted-foreground)]">⚡</span>
                <h3 className="text-lg font-medium text-[var(--foreground)]">Recent Activity</h3>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Real-time operator actions</p>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--status-active)] mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)]">
                        <span className="font-medium text-[var(--foreground)]">{activity.user}</span>
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        {activity.action}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Machines Section */}
        <div>
          <div className="clean-card p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl text-[var(--muted-foreground)]">⚙️</span>
                  <h3 className="text-lg font-medium text-[var(--foreground)]">Active Machines</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">Automated machines running in the network</p>
              </div>

              <div className="space-y-4">
                {yourMachines.map((machine, index) => (
                  <div key={machine.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                        <span className="text-[var(--foreground)] font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[var(--foreground)]">{machine.name}</span>
                          <span className="px-2 py-0.5 rounded text-xs text-[var(--muted-foreground)] bg-[var(--muted)]">
                            {machine.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <span>${(machine.monthlyRevenue / 1000000).toFixed(1)}M/mo</span>
                          <span>•</span>
                          <span>{machine.activeOps} active ops</span>
                          <span>•</span>
                          <span>{machine.openOps} open ops</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => onNavigate?.('operations')}
          className="px-4 py-2 bg-[var(--color-primary)] text-black font-medium rounded hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          Find Ops
        </button>
        <button
          onClick={() => onNavigate?.('machines')}
          className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] rounded hover:bg-[var(--border)] transition-colors"
        >
          Connect a Machine
        </button>
      </div>
    </div>
  );
}