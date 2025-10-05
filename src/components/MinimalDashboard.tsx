/**
 * Minimal Dashboard Component
 *
 * Clean, minimal black & white dashboard with cards and metrics
 */

import React, { useState } from 'react';
import { OperatorProfile } from '../types/operator';
import { AnimatedCounter } from './ui/AnimatedCounter';

interface MinimalDashboardProps {
  profile: OperatorProfile;
}

export function MinimalDashboard({ profile }: MinimalDashboardProps) {
  const [metrics] = useState({
    activeOperators: 4,
    machinesRunning: 4,
    totalContributions: 7073,
    communityXP: 30000,
  });

  const [liveActivity] = useState([
    { user: '@atlas', action: 'earned 111 XP', time: 'just now', avatar: 'A' },
    { user: '@nova', action: 'contributed to Content Synth Machine', time: 'just now', avatar: 'N' },
    { user: '@cipher', action: 'contributed to Data Pipeline X1', time: 'just now', avatar: 'C' },
    { user: '@quantum', action: 'earned 107 XP', time: 'just now', avatar: 'Q' },
    { user: '@nova', action: 'optimized DeFi Farm Machine', time: 'just now', avatar: 'N' },
  ]);

  const [activeMachines] = useState([
    { id: 1, name: 'Validator Machine Pro', owner: '@quantum', runs: 2156, success: 99.8, status: 'running' },
    { id: 2, name: 'LaunchOps Engine', owner: '@nova', runs: 1243, success: 98.2, status: 'idle' },
    { id: 3, name: 'DeFi Farm Machine', owner: '@atlas', runs: 987, success: 96.8, status: 'running' },
    { id: 4, name: 'Content Synth Machine', owner: '@cipher', runs: 756, success: 99.1, status: 'running' },
    { id: 5, name: 'Analytics Processor', owner: '@quantum', runs: 654, success: 94.5, status: 'idle' },
  ]);

  const metricCards = [
    {
      title: 'Active Operators',
      value: metrics.activeOperators,
      change: '+12.5%',
      color: 'text-[var(--status-active)]',
    },
    {
      title: 'Machines Running',
      value: metrics.machinesRunning,
      change: '+8.2%',
      color: 'text-[var(--color-primary)]',
    },
    {
      title: 'Total Contributions',
      value: metrics.totalContributions,
      change: '+24.1%',
      color: 'text-[var(--color-secondary)]',
    },
    {
      title: 'Community XP',
      value: `${Math.floor(metrics.communityXP / 1000)}K`,
      change: '+15.7%',
      color: 'text-[var(--status-warning)]',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div key={metric.title} className="clean-card p-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {metric.title}
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {typeof metric.value === 'number' ? (
                    <AnimatedCounter value={metric.value} />
                  ) : (
                    metric.value
                  )}
                </p>
                <p className={`text-sm font-medium ${metric.color}`}>
                  {metric.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Activity */}
        <div className="lg:col-span-3">
          <div className="clean-card p-6 h-[600px]">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="status-dot-running"></div>
                  <h3 className="text-lg font-medium text-[var(--foreground)]">Live Activity</h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">Real-time operator actions</p>
              </div>

              <div className="space-y-4">
                {liveActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                      <span className="text-black font-bold text-sm">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)]">
                        <span className="font-medium text-[var(--color-primary)]">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Machines */}
        <div className="lg:col-span-6">
          <div className="clean-card p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Active Machines</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Automated machines running in the network</p>
              </div>

              <div className="space-y-4">
                {activeMachines.map((machine, index) => (
                  <div key={machine.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                        <span className="text-black font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[var(--foreground)]">{machine.name}</span>
                          <span className={`status-${machine.status}`}>
                            {machine.status === 'running' && <span className="status-dot-running mr-1"></span>}
                            {machine.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <span className="font-medium text-[var(--color-primary)]">{machine.owner}</span>
                          <span>•</span>
                          <span><AnimatedCounter value={machine.runs} /> runs</span>
                          <span>•</span>
                          <span className="text-[var(--status-active)]">{machine.success}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Network Analytics */}
        <div className="lg:col-span-3">
          <div className="clean-card p-6 h-[600px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Network Analytics</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Performance KPIs</p>
              </div>

              <div className="space-y-6">
                {/* Success Rate */}
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--muted-foreground)]">Avg. Success Rate</span>
                    <span className="font-medium text-[var(--foreground)]">97.2%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill animate-progress-fill" style={{ width: '97.2%' }}></div>
                  </div>
                </div>

                {/* Active Deployments */}
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--muted-foreground)]">Active Deployments</span>
                    <span className="font-medium text-[var(--foreground)]"><AnimatedCounter value={234} /></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill animate-progress-fill" style={{ width: '68%' }}></div>
                  </div>
                </div>

                {/* Network Health */}
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--muted-foreground)]">Network Health</span>
                    <span className="font-medium text-[var(--foreground)]">98%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill animate-progress-fill" style={{ width: '98%' }}></div>
                  </div>
                </div>

                {/* Last 24h Stats */}
                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <div className="p-3 rounded-lg bg-[var(--muted)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="status-dot-running"></div>
                      <span className="text-sm text-[var(--muted-foreground)]">Last 24h</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Runs</span>
                        <span className="font-medium text-[var(--foreground)]"><AnimatedCounter value={1849} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">XP Earned</span>
                        <span className="font-medium text-[var(--foreground)]"><AnimatedCounter value={18} />K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">New Operators</span>
                        <span className="font-medium text-[var(--foreground)]">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}