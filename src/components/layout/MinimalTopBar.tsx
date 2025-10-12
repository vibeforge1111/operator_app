/**
 * Fixed Top Navigation Bar
 *
 * Modern minimal top bar with logo, brand title, wallet connection, and theme toggle
 */

import React, { useState } from 'react';
import { Wallet, ChevronDown, LogOut, User } from 'lucide-react';
import { OperatorProfile } from '../../types/operator';
import { usePrivy } from '@privy-io/react-auth';

interface MinimalTopBarProps {
  profile: OperatorProfile & { profilePicture?: string };
  onConnectWallet: () => void;
  demoMode: boolean;
  sidebarWidth: number;
}

export function MinimalTopBar({
  profile,
  onConnectWallet,
  demoMode,
  sidebarWidth
}: MinimalTopBarProps) {
  const { logout } = usePrivy();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header
      className="
        fixed top-0 h-16 bg-[var(--background)] border-b border-[var(--border)]
        flex items-center justify-between px-6 z-30 transition-all duration-200
      "
      style={{ left: `${sidebarWidth}px`, right: '0' }}
    >
      {/* Left: Empty for now */}
      <div></div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-4">
        {/* Wallet Connection */}
        {demoMode ? (
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
              Connect Wallet
            </span>
            <div className="w-2 h-2 rounded-full bg-[var(--status-inactive)]"></div>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="
                flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[var(--border)]
                bg-[var(--card)] hover:bg-[var(--muted)] transition-all duration-200
                hover:border-[var(--muted-foreground)]
              "
            >
              {/* Profile Picture */}
              <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.handle} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                )}
              </div>
              {/* Handle */}
              <span className="text-sm font-medium text-[var(--foreground)]">
                {profile.handle}
              </span>
              <div className="w-2 h-2 rounded-full bg-[var(--status-active)]"></div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
                    Handle
                  </div>
                  <div className="px-3 py-2 text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">
                    @{profile.handle}
                  </div>
                  <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] mt-2">
                    Wallet Address
                  </div>
                  <div className="px-3 py-2 text-xs font-mono text-[var(--foreground)]">
                    {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="
                      w-full flex items-center space-x-2 px-3 py-2 mt-2
                      text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors
                    "
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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