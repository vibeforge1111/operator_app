import React, { useEffect, useState } from 'react';
import { PrivyProvider } from './contexts/PrivyProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Header } from './components/Header';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorRegistration from './components/OperatorRegistration';
import { useOperatorProfile } from './hooks/useOperatorProfile';

function AppContent() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [primaryWalletAddress, setPrimaryWalletAddress] = useState<string | null>(null);
  const { profile, loading } = useOperatorProfile(primaryWalletAddress);

  // Get the primary wallet address (prefer BNB Chain wallet)
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      // Prefer EVM wallet for BNB Chain
      const evmWallet = wallets.find(w => w.chainType === 'ethereum');
      const solanaWallet = wallets.find(w => w.chainType === 'solana');

      setPrimaryWalletAddress(evmWallet?.address || solanaWallet?.address || null);
    }
  }, [authenticated, wallets]);

  // Always show header
  return (
    <div className="min-h-screen terminal-bg">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Show loading while Privy initializes */}
        {!ready ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-[var(--color-primary)]">Initializing...</div>
              <div className="animate-pulse">Connecting to network...</div>
            </div>
          </div>
        ) : !authenticated ? (
          /* Landing page for non-authenticated users */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-8 max-w-3xl">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                  Welcome to the Operator Network
                </h1>
                <p className="text-xl text-[var(--color-text-muted)]">
                  Join the decentralized workforce. Connect your skills with machines that need them.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="clean-card p-6 space-y-3">
                  <div className="text-3xl">🎯</div>
                  <h3 className="font-bold">Find Operations</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Discover tasks that match your skills and start earning
                  </p>
                </div>

                <div className="clean-card p-6 space-y-3">
                  <div className="text-3xl">🤝</div>
                  <h3 className="font-bold">Connect with Machines</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Join productive machines and contribute your expertise
                  </p>
                </div>

                <div className="clean-card p-6 space-y-3">
                  <div className="text-3xl">💰</div>
                  <h3 className="font-bold">Earn Rewards</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Get paid in crypto for your contributions
                  </p>
                </div>
              </div>

              <div className="text-[var(--color-text-muted)]">
                <p className="text-lg">Connect your wallet to get started</p>
                <p className="text-sm mt-2">No existing wallet? We'll create one for you automatically!</p>
              </div>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          /* Waiting for wallets to be created */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-[var(--color-primary)]">Setting up your wallets...</div>
              <div className="animate-pulse">Creating BNB Chain and Solana wallets...</div>
              <p className="text-sm text-[var(--color-text-muted)]">This only happens once</p>
            </div>
          </div>
        ) : loading ? (
          /* Loading operator profile */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-[var(--color-primary)]">Loading operator profile...</div>
              <div className="animate-pulse">Syncing with network...</div>
            </div>
          </div>
        ) : !profile && primaryWalletAddress ? (
          /* New user - show registration */
          <OperatorRegistration walletAddress={primaryWalletAddress} />
        ) : profile ? (
          /* Existing user - show dashboard */
          <OperatorDashboard profile={profile} />
        ) : null}
      </main>
    </div>
  );
}

function App() {
  return (
    <PrivyProvider>
      <AppContent />
    </PrivyProvider>
  );
}

export default App;