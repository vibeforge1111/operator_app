/**
 * Fixed Top Navigation Bar
 *
 * Modern minimal top bar with logo, brand title, wallet connection, and theme toggle
 */

import React from 'react';
import { Sun, Moon, Wallet } from 'lucide-react';
import { OperatorProfile } from '../../types/operator';

interface MinimalTopBarProps {
  profile: OperatorProfile;
  onConnectWallet: () => void;
  demoMode: boolean;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  sidebarWidth: number;
}

export function MinimalTopBar({
  profile,
  onConnectWallet,
  demoMode,
  isDarkMode,
  onThemeToggle,
  sidebarWidth
}: MinimalTopBarProps) {
  return (
    <header
      className="
        fixed top-0 h-16 bg-[var(--background)] border-b border-[var(--border)]
        flex items-center justify-between px-6 z-30 transition-all duration-200
      "
      style={{ left: `${sidebarWidth}px`, right: '0' }}
    >
      {/* Left: Logo + Brand Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">O</span>
          </div>
          <h1 className="text-xl font-medium text-[var(--foreground)]">
            Operator Network
          </h1>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-transparent border border-[var(--status-active)]">
          <div className="w-2 h-2 rounded-full bg-[var(--status-active)] animate-subtle-pulse"></div>
          <span className="text-xs font-medium text-[var(--foreground)]">LIVE</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="
            w-10 h-10 rounded-lg bg-[var(--switch-background)] border border-[var(--border)]
            flex items-center justify-center transition-all duration-200
            hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]
            text-[var(--muted-foreground)] hover:text-[var(--foreground)]
          "
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Wallet Connection */}
        <button
          onClick={onConnectWallet}
          className="
            flex items-center space-x-2 px-4 py-2 rounded-lg border border-[var(--border)]
            bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200
            hover:border-[var(--muted-foreground)]
          "
        >
          <Wallet className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {demoMode ? 'Connect Wallet' : 'Connected'}
          </span>
          <div className={`
            w-2 h-2 rounded-full
            ${demoMode ? 'bg-[var(--status-inactive)]' : 'bg-[var(--status-active)]'}
          `}></div>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-[var(--border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {profile.handle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--foreground)]">
              @{profile.handle}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {profile.rank}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}