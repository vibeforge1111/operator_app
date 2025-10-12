import React, { useState, useEffect } from 'react';
import { PrivyProvider } from './contexts/PrivyProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { MinimalDashboardLayout } from './components/layout/MinimalDashboardLayout';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import OperationBoard from './components/OperationBoard';
import NotificationSystem from './components/NotificationSystem';
import { OperatorProfile } from './types/operator';
import { useOperatorProfile } from './hooks/useOperatorProfile';

function AppContent() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'directory' | 'machines' | 'operations'>('dashboard');
  const [primaryWalletAddress, setPrimaryWalletAddress] = useState<string | null>(null);
  const { profile: realProfile, loading } = useOperatorProfile(primaryWalletAddress);

  // Get the primary wallet address (prefer BNB Chain wallet)
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      const evmWallet = wallets.find(w => w.chainType === 'ethereum');
      const solanaWallet = wallets.find(w => w.chainType === 'solana');
      setPrimaryWalletAddress(evmWallet?.address || solanaWallet?.address || null);
    }
  }, [authenticated, wallets]);

  // Demo profile for non-authenticated users
  const demoProfile: OperatorProfile = {
    id: 'demo_operator',
    walletAddress: 'Demo Mode - Connect Wallet to Upgrade',
    handle: 'demo_operator',
    skills: ['Dev', 'Design', 'VibeOps'],
    xp: 2750,
    rank: 'Senior',
    connectedMachines: 3,
    activeOps: 2,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date(),
    lastActive: new Date(),
  };

  // Use real profile if available, otherwise demo
  const currentProfile = authenticated && realProfile ? realProfile : demoProfile;
  const demoMode = !authenticated;

  const handleConnectWallet = () => {
    if (!authenticated) {
      login(); // Open Privy login modal
    } else {
      logout(); // Disconnect wallet
    }
  };

  const handleConnectToMachine = (machineId: string) => {
    console.log(`Connecting to machine: ${machineId}`);
    alert(`Successfully connected to machine!`);
    setCurrentView('dashboard');
  };

  const handleCompleteOperation = (operationId: string) => {
    console.log(`Completing operation: ${operationId}`);
  };

  // Navigation handling from MinimalDashboardLayout
  const handleNavigation = (view: string) => {
    switch(view) {
      case 'directory':
        setCurrentView('directory');
        break;
      case 'machines':
        setCurrentView('machines');
        break;
      case 'operations':
        setCurrentView('operations');
        break;
      default:
        setCurrentView('dashboard');
    }
  };

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[var(--color-primary)]">Initializing...</div>
          <div className="animate-pulse">Connecting to network...</div>
        </div>
      </div>
    );
  }

  // Render different views based on currentView
  if (currentView === 'directory') {
    return (
      <>
        <OperatorDirectory onBack={() => setCurrentView('dashboard')} />
        <NotificationSystem />
      </>
    );
  }

  if (currentView === 'machines') {
    return (
      <>
        <MachineMarketplace
          onBack={() => setCurrentView('dashboard')}
          onConnectToMachine={handleConnectToMachine}
        />
        <NotificationSystem />
      </>
    );
  }

  if (currentView === 'operations') {
    return (
      <>
        <OperationBoard
          profile={currentProfile}
          onBack={() => setCurrentView('dashboard')}
          onCompleteOperation={handleCompleteOperation}
        />
        <NotificationSystem />
      </>
    );
  }

  // Default view - Dashboard with Privy integration
  return (
    <>
      <MinimalDashboardLayout
        profile={currentProfile}
        onConnectWallet={handleConnectWallet}
        demoMode={demoMode}
        onNavigate={handleNavigation}
        authenticated={authenticated}
        walletAddress={primaryWalletAddress}
      />
      <NotificationSystem />
    </>
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