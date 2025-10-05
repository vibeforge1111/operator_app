/**
 * MVP Dashboard Component
 *
 * Operator Network MVP dashboard following ui_wireframes_notes.md specification
 */

import React, { useState } from 'react';
import { OperatorProfile } from '../types/operator';
import { AnimatedCounter } from './ui/AnimatedCounter';

interface MinimalDashboardProps {
  profile: OperatorProfile;
}

export function MinimalDashboard({ profile }: MinimalDashboardProps) {
  // MVP Stat Cards Data (following canonical schema)
  const [operatorStats] = useState({
    activeOps: 2,
    openOpsAvailable: 15,
    machinesConnected: 3,
    xp: profile.xp,
    rank: profile.rank,
  });

  // Live Activity (for current component)
  const [liveActivity] = useState([
    { user: 'alex_mars', avatar: 'A', action: 'completed Op in Mars Game', time: '2m ago' },
    { user: 'sam_ai', avatar: 'S', action: 'joined AI Content Generator', time: '5m ago' },
    { user: 'maya_code', avatar: 'M', action: 'claimed new Op', time: '8m ago' },
    { user: 'dev_ops', avatar: 'D', action: 'deployed to Analytics', time: '12m ago' },
    { user: 'jane_ui', avatar: 'J', action: 'started UI enhancement', time: '15m ago' },
  ]);

  // Recent Activity (MVP format)
  const [recentActivity] = useState([
    { action: 'Verified Op: API Integration in Mars Survival Game', reward: '+50 XP', time: '2 hours ago' },
    { action: 'Joined Machine: AI Content Generator as Contributor', reward: '', time: '1 day ago' },
    { action: 'Claimed Op: UI Enhancement in Design Studio', reward: '', time: '2 days ago' },
    { action: 'Completed Op: Bug Fix in LaunchOps Engine', reward: '+75 XP', time: '3 days ago' },
    { action: 'Connected Machine: Analytics Dashboard', reward: '', time: '5 days ago' },
  ]);

  // Active Machines (for current component - MVP compliant)
  const [activeMachines] = useState([
    { id: 1, name: 'Mars Survival Game', owner: 'GameDev Team', status: 'running' },
    { id: 2, name: 'AI Content Generator', owner: 'AI Labs', status: 'running' },
    { id: 3, name: 'Analytics Dashboard', owner: 'Data Team', status: 'running' },
    { id: 4, name: 'Design Studio', owner: 'UX Team', status: 'running' },
  ]);

  // Your Machines (MVP format with correct badges)
  const [yourMachines] = useState([
    {
      id: 1,
      name: 'Mars Survival Game',
      category: 'GameOps',
      role: 'Contributor',
      openOps: 3,
      activeOps: 1,
      contributors: 2,
      completed7d: 5
    },
    {
      id: 2,
      name: 'AI Content Generator',
      category: 'Tooling',
      role: 'Maintainer',
      openOps: 2,
      activeOps: 2,
      contributors: 1,
      completed7d: 8
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      category: 'Other',
      role: 'Owner',
      openOps: 5,
      activeOps: 0,
      contributors: 0,
      completed7d: 0
    },
  ]);

  // MVP Stat Cards (canonical labels)
  const metricCards = [
    {
      title: 'Active Ops',
      value: operatorStats.activeOps,
      color: 'text-[var(--foreground)]',
    },
    {
      title: 'Open Ops Available',
      value: operatorStats.openOpsAvailable,
      color: 'text-[var(--muted-foreground)]',
    },
    {
      title: 'Machines Connected',
      value: operatorStats.machinesConnected,
      color: 'text-[var(--foreground)]',
    },
    {
      title: 'XP / Rank',
      value: `${operatorStats.xp} XP · ${operatorStats.rank}`,
      color: 'text-[var(--muted-foreground)]',
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
                    <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <span className="text-[var(--foreground)] font-bold text-sm">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)]">
                        <span className="font-medium text-[var(--foreground)]">{activity.user}</span>{' '}
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
                      <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                        <span className="text-[var(--foreground)] font-bold">#{index + 1}</span>
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
                          <span className="font-medium text-[var(--foreground)]">{machine.owner}</span>
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

                {/* Active Ops */}
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--muted-foreground)]">Active Ops</span>
                    <span className="font-medium text-[var(--foreground)]"><AnimatedCounter value={15} /></span>
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
                        <span className="text-[var(--muted-foreground)]">Ops Completed</span>
                        <span className="font-medium text-[var(--foreground)]"><AnimatedCounter value={24} /></span>
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