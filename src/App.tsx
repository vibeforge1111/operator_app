import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import WalletContextProvider from './contexts/WalletProvider';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorRegistration from './components/OperatorRegistration';
import { useOperatorProfile } from './hooks/useOperatorProfile';

function AppContent() {
  const { publicKey, connected } = useWallet();
  const { profile, loading } = useOperatorProfile(publicKey?.toString());

  if (!connected) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              OPERATOR NETWORK
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
              The foundational identity and discovery layer. Establish presence, showcase capabilities, discover collaborators.
            </p>
          </div>

          <div className="space-y-4">
            <WalletMultiButton className="!bg-[var(--color-primary)] !text-black hover:!bg-[var(--color-primary)]/80" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Connect your Solana wallet to become an operator
            </p>
          </div>

          <div className="text-xs text-[var(--color-text-muted)] space-y-1">
            <div>tick... tick... tick...</div>
            <div className="text-[var(--color-primary)]">Network heartbeat active</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[var(--color-primary)]">Loading operator profile...</div>
          <div className="animate-pulse">Syncing with network...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <OperatorRegistration />;
  }

  return <OperatorDashboard profile={profile} />;
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;