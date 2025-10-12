/**
 * Header Component with Privy Authentication
 *
 * Main navigation header with Privy sign-in integration.
 * Shows user status, wallets, and navigation options.
 */

import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Wallet, User, LogOut, ChevronDown, Loader2 } from 'lucide-react';

export function Header() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [showDropdown, setShowDropdown] = useState(false);

  // Get display name from user object
  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.email?.address) return user.email.address;
    if (user.google?.email) return user.google.email;
    if (user.discord?.username) return user.discord.username;
    if (user.twitter?.username) return `@${user.twitter.username}`;
    if (user.github?.username) return user.github.username;
    if (user.wallet?.address) return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;
    return 'User';
  };

  // Get wallet addresses
  const evmWallet = wallets.find(w => w.chainType === 'ethereum');
  const solanaWallet = wallets.find(w => w.chainType === 'solana');

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            OPERATOR NETWORK
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Dashboard
          </a>
          <a href="#operators" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Operators
          </a>
          <a href="#machines" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Machines
          </a>
          <a href="#operations" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Operations
          </a>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!ready ? (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : !authenticated ? (
            <button
              onClick={login}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-black font-medium rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{getDisplayName()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                  <div className="p-4 space-y-3">
                    {/* User Info */}
                    <div className="pb-3 border-b border-[var(--border)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Signed in as</p>
                      <p className="text-sm font-medium mt-1">{getDisplayName()}</p>
                    </div>

                    {/* Wallets */}
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">Your Wallets</p>

                      {evmWallet && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-3 h-3" />
                            <span>BNB Chain</span>
                          </div>
                          <span className="font-mono text-[var(--color-text-muted)]">
                            {evmWallet.address.slice(0, 6)}...{evmWallet.address.slice(-4)}
                          </span>
                        </div>
                      )}

                      {solanaWallet && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-3 h-3" />
                            <span>Solana</span>
                          </div>
                          <span className="font-mono text-[var(--color-text-muted)]">
                            {solanaWallet.address.slice(0, 6)}...{solanaWallet.address.slice(-4)}
                          </span>
                        </div>
                      )}

                      {wallets.length === 0 && (
                        <p className="text-xs text-[var(--color-text-muted)] italic">
                          Creating wallets...
                        </p>
                      )}
                    </div>

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-500/20 text-red-500 rounded hover:bg-red-500/10 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}