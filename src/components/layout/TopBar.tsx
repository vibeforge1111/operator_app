/**
 * Top Navigation Bar
 *
 * Modern top bar with user controls, wallet connection, and theme toggle
 */

import React from 'react';
import { OperatorProfile } from '../../types/operator';

interface TopBarProps {
  profile: OperatorProfile;
  onConnectWallet: () => void;
  demoMode: boolean;
}

export function TopBar({ profile, onConnectWallet, demoMode }: TopBarProps) {
  return (
    <div className="fixed top-0 left-16 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[var(--color-primary)]/20 flex items-center justify-between px-6 z-30">
      {/* Left side - Page title and status */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">Operator Network</h1>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-400">LIVE</span>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">Real-time operations and performance</span>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-4">
        {/* Time range selector */}
        <div className="flex items-center space-x-1 bg-[var(--color-surface)] rounded-lg p-1">
          <button className="px-3 py-1 text-xs rounded-md bg-[var(--color-primary)] text-black font-medium">
            24h
          </button>
          <button className="px-3 py-1 text-xs rounded-md text-[var(--color-text-muted)] hover:text-white transition-colors">
            7d
          </button>
          <button className="px-3 py-1 text-xs rounded-md text-[var(--color-text-muted)] hover:text-white transition-colors">
            30d
          </button>
        </div>

        {/* Theme toggle */}
        <button className="w-10 h-10 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors">
          ☀️
        </button>

        {/* Wallet Connection */}
        <button
          onClick={onConnectWallet}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-surface)] rounded-lg border border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/50 transition-colors"
        >
          <span className="text-sm font-medium text-white">
            {demoMode ? 'Connect Wallet' : 'Connected'}
          </span>
          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {profile.handle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white">@{profile.handle}</span>
            <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}