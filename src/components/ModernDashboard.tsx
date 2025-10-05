/**
 * Modern Dashboard Component
 *
 * Main dashboard with metrics cards and three-column layout
 * inspired by the reference design but adapted for Operator Network
 */

import React, { useState, useEffect } from 'react';
import { OperatorProfile } from '../types/operator';
import { AnimatedCounter } from './ui/AnimatedCounter';

interface ModernDashboardProps {
  profile: OperatorProfile;
}

export function ModernDashboard({ profile }: ModernDashboardProps) {
  const [liveMetrics, setLiveMetrics] = useState({
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
    { id: 1, name: 'Validator Machine Pro', owner: '@quantum', status: 'running' },
    { id: 2, name: 'LaunchOps Engine', owner: '@nova', status: 'idle' },
    { id: 3, name: 'DeFi Farm Machine', owner: '@atlas', status: 'running' },
    { id: 4, name: 'Content Synth Machine', owner: '@cipher', status: 'running' },
    { id: 5, name: 'Analytics Processor', owner: '@quantum', status: 'idle' },
  ]);

  const metrics = [
    {
      title: 'Active Operators',
      value: liveMetrics.activeOperators,
      change: '+12.5%',
      icon: '👥',
      color: 'text-green-400',
    },
    {
      title: 'Machines Running',
      value: liveMetrics.machinesRunning,
      change: '+8.2%',
      icon: '⚙️',
      color: 'text-blue-400',
    },
    {
      title: 'Total Contributions',
      value: liveMetrics.totalContributions,
      change: '+24.1%',
      icon: '📈',
      color: 'text-purple-400',
    },
    {
      title: 'Community XP',
      value: `${Math.floor(liveMetrics.communityXP / 1000)}K`,
      change: '+15.7%',
      icon: '⚡',
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="pl-16 pt-16 min-h-screen bg-[#0a0a0a]">
      <div className="p-6 space-y-6">
        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className="bg-[#1a1a1a] rounded-xl border border-[var(--color-primary)]/20 p-6 hover:border-[var(--color-primary)]/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--color-text-muted)] text-sm font-medium">{metric.title}</span>
                <span className="text-2xl">{metric.icon}</span>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={typeof metric.value === 'number' ? metric.value : parseInt(metric.value)} suffix={typeof metric.value === 'string' && metric.value.includes('K') ? 'K' : ''} />
                </div>
                <div className={`text-sm font-medium ${metric.color}`}>
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Live Activity */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a1a] rounded-xl border border-[var(--color-primary)]/20 p-6 h-[600px]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-lg font-semibold text-white">Live Activity</h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Real-time operator actions</p>

              <div className="space-y-4">
                {liveActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black font-bold text-sm">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium text-[var(--color-primary)]">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Active Machines */}
          <div className="lg:col-span-6">
            <div className="bg-[#1a1a1a] rounded-xl border border-[var(--color-primary)]/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">⚙️</span>
                <h3 className="text-lg font-semibold text-white">Active Machines</h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Automated machines running in the network</p>

              <div className="space-y-4">
                {activeMachines.map((machine, index) => (
                  <div key={machine.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-black font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{machine.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            machine.status === 'running'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {machine.status === 'running' && <span className="w-1 h-1 rounded-full bg-green-400 inline-block mr-1"></span>}
                            {machine.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mt-1">
                          <span className="font-medium text-[var(--color-primary)]">{machine.owner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Network Analytics */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a1a] rounded-xl border border-[var(--color-primary)]/20 p-6 h-[600px]">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">📊</span>
                <h3 className="text-lg font-semibold text-white">Network Analytics</h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Performance KPIs</p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--color-text-muted)]">Avg. Success Rate</span>
                    <span className="font-medium text-white">97.2%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: '97.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--color-text-muted)]">Active Ops</span>
                    <span className="font-medium text-white"><AnimatedCounter value={15} /></span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-[var(--color-text-muted)]">Network Health</span>
                    <span className="font-medium text-white">98%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-primary)]/20 space-y-4">
                  <div className="p-3 rounded-lg bg-[var(--color-surface)]/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-[var(--color-text-muted)]">Last 24h</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Ops Completed</span>
                        <span className="font-medium text-white"><AnimatedCounter value={24} /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">XP Earned</span>
                        <span className="font-medium text-white"><AnimatedCounter value={18600} suffix="K" /></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">New Operators</span>
                        <span className="font-medium text-white">12</span>
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