import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useOperatorProfile } from '../hooks/useOperatorProfile';
import ProfileCreation from './ProfileCreation';

interface WalletConnectionProps {
  onConnected: (walletAddress: string) => void;
}

/**
 * Wallet Connection Component
 *
 * Handles Solana wallet connection with real wallet adapters.
 * Replaces the demo wallet connection with actual Phantom/Solflare integration.
 *
 * Features:
 * - Real wallet connection via Solana wallet adapters
 * - Connection state management
 * - Error handling for connection failures
 * - Profile creation flow integration
 * - Responsive design with terminal aesthetic
 *
 * @component
 */
export default function WalletConnection({ onConnected }: WalletConnectionProps) {
  const { publicKey, connected, connecting, disconnect } = useWalletContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  // Get operator profile for connected wallet
  const { profile, loading: profileLoading } = useOperatorProfile(
    connected && publicKey ? publicKey.toString() : undefined
  );

  // Handle successful wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      setError(null);
      setIsLoading(false);
      onConnected(publicKey.toString());
    }
  }, [connected, publicKey, onConnected]);

  // Handle connection errors
  useEffect(() => {
    if (!connecting && !connected && publicKey === null) {
      // Connection was attempted but failed
      setIsLoading(false);
    }
  }, [connecting, connected, publicKey]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect wallet');
    }
  };

  // Show profile creation form if connected but no profile
  if (connected && publicKey && !profileLoading && !profile && showProfileCreation) {
    return (
      <ProfileCreation
        walletAddress={publicKey.toString()}
        onProfileCreated={() => {
          setShowProfileCreation(false);
          // Profile will be automatically loaded by the hook
        }}
        onCancel={() => setShowProfileCreation(false)}
      />
    );
  }

  if (connected && publicKey) {
    return (
      <div className="space-y-6">
        {/* Connected State */}
        <div className="operator-card rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[var(--color-primary)]">
                Wallet Connected
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] font-mono">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              <span className="text-sm text-[var(--color-primary)]">Live</span>
            </div>
          </div>

          {profileLoading ? (
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-[var(--color-text-muted)]">
                Loading operator profile...
              </span>
            </div>
          ) : profile ? (
            <div className="space-y-2">
              <div className="text-white">
                <span className="text-[var(--color-primary)]\">OPERATOR:</span> @{profile.handle}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Rank: {profile.rank} • XP: {profile.xp}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[var(--color-text-muted)] text-sm">
                No operator profile found for this wallet
              </div>
              <button
                onClick={() => setShowProfileCreation(true)}
                className="px-4 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 transition-colors"
              >
                Create Operator Profile
              </button>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              Disconnect
            </button>
            {profile && (
              <button
                onClick={() => onConnected(publicKey.toString())}
                className="px-4 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 transition-colors"
              >
                Enter Network
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection Interface */}
      <div className="operator-card rounded-lg p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            Connect Your Wallet
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Connect a Solana wallet to access the Operator Network
          </p>
        </div>

        <div className="space-y-4">
          {/* Wallet Connect Button */}
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-[var(--color-primary)] !text-black hover:!bg-[var(--color-primary)]/80 !rounded-lg !font-medium !px-8 !py-4" />
          </div>

          {connecting && (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-[var(--color-text-muted)]">
                Connecting to wallet...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-[var(--color-text-muted)] space-y-1">
          <div>Supported wallets: Phantom, Solflare</div>
          <div className="text-[var(--color-primary)]">Network: Solana Devnet</div>
        </div>
      </div>

      {/* Information Card */}
      <div className="operator-card rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-white">Why Connect a Wallet?</h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <li className="flex items-start space-x-2">
            <span className="text-[var(--color-primary)] mt-1">•</span>
            <span>Secure operator profile creation and authentication</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-[var(--color-primary)] mt-1">•</span>
            <span>Earn XP and token rewards for completed operations</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-[var(--color-primary)] mt-1">•</span>
            <span>Connect to machines and participate in the network</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-[var(--color-primary)] mt-1">•</span>
            <span>Cryptographic verification of all network activities</span>
          </li>
        </ul>
      </div>
    </div>
  );
}