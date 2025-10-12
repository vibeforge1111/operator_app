/**
 * Privy Authentication Component
 *
 * Handles user authentication with automatic wallet creation for
 * BNB Chain and Solana. Users get embedded wallets without needing
 * to understand crypto or have existing wallets.
 */

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Loader2, Wallet, Check, AlertCircle } from 'lucide-react';

interface WalletInfo {
  chain: string;
  address: string;
  type: 'embedded' | 'external';
}

export function PrivyAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkWallet,
    unlinkWallet,
  } = usePrivy();

  const { wallets, ready: walletsReady } = useWallets();
  const [isCreatingWallets, setIsCreatingWallets] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo[]>([]);
  const [showWalletDetails, setShowWalletDetails] = useState(false);

  // Process wallet information when wallets change
  useEffect(() => {
    if (walletsReady && wallets.length > 0) {
      const info: WalletInfo[] = wallets.map(wallet => ({
        chain: wallet.chainType === 'ethereum' ? 'BNB Chain' : 'Solana',
        address: wallet.address,
        type: wallet.walletClientType === 'privy' ? 'embedded' : 'external',
      }));
      setWalletInfo(info);
    }
  }, [wallets, walletsReady]);

  // Check if user has both BNB and Solana wallets
  const hasBNBWallet = walletInfo.some(w => w.chain === 'BNB Chain');
  const hasSolanaWallet = walletInfo.some(w => w.chain === 'Solana');
  const hasAllWallets = hasBNBWallet && hasSolanaWallet;

  // Auto-create missing wallets after login
  useEffect(() => {
    const createMissingWallets = async () => {
      if (authenticated && walletsReady && !isCreatingWallets) {
        // Check if we need to create any wallets
        if (!hasBNBWallet || !hasSolanaWallet) {
          setIsCreatingWallets(true);
          try {
            // Privy automatically creates embedded wallets based on configuration
            // Just need to wait for them to be ready
            console.log('Creating embedded wallets...');

            // Give Privy time to create wallets
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error('Error creating wallets:', error);
          } finally {
            setIsCreatingWallets(false);
          }
        }
      }
    };

    createMissingWallets();
  }, [authenticated, walletsReady, hasBNBWallet, hasSolanaWallet, isCreatingWallets]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen terminal-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-[var(--color-text-muted)]">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              OPERATOR NETWORK
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Sign in to start earning with your skills
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={login}
              className="w-full py-3 px-4 bg-[var(--color-primary)] text-black font-medium rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Get Started
            </button>

            <div className="text-sm text-[var(--color-text-muted)] space-y-2">
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-primary)]" />
                No crypto wallet needed
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-primary)]" />
                Automatic wallet creation
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-primary)]" />
                Works on BNB Chain & Solana
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet creation progress
  if (isCreatingWallets || !hasAllWallets) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 p-8 clean-card">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto" />
            <h2 className="text-2xl font-bold">Setting Up Your Wallets</h2>
            <p className="text-[var(--color-text-muted)]">
              Creating your blockchain wallets...
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {hasBNBWallet ? (
                <Check className="w-5 h-5 text-[var(--color-primary)]" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
              )}
              <span className={hasBNBWallet ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}>
                BNB Chain Wallet
              </span>
            </div>

            <div className="flex items-center gap-3">
              {hasSolanaWallet ? (
                <Check className="w-5 h-5 text-[var(--color-primary)]" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
              )}
              <span className={hasSolanaWallet ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}>
                Solana Wallet
              </span>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-500">
              This is a one-time setup. Your wallets are being created and secured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has wallets
  return (
    <div className="p-4 clean-card rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Signed in as</p>
          <p className="font-medium">{user?.email || user?.wallet?.address || 'User'}</p>
        </div>
        <button
          onClick={() => setShowWalletDetails(!showWalletDetails)}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          {showWalletDetails ? 'Hide' : 'Show'} Wallets
        </button>
      </div>

      {showWalletDetails && (
        <div className="space-y-2 pt-4 border-t border-[var(--border)]">
          {walletInfo.map((wallet, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[var(--color-text-muted)]">{wallet.chain}</span>
                {wallet.type === 'embedded' && (
                  <span className="px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded">
                    Embedded
                  </span>
                )}
              </div>
              <span className="font-mono text-xs">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => logout()}
          className="flex-1 px-4 py-2 border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
        >
          Sign Out
        </button>
        {!hasBNBWallet && (
          <button
            onClick={() => linkWallet()}
            className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            Link Wallet
          </button>
        )}
      </div>
    </div>
  );
}