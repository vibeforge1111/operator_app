import React, { useState, useEffect } from 'react';
import { PrivyProvider } from './contexts/PrivyProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { MinimalDashboardLayout } from './components/layout/MinimalDashboardLayout';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import OperationBoard from './components/OperationBoard';
import NotificationSystem from './components/NotificationSystem';
import Settings from './components/Settings';
import { OperatorProfile } from './types/operator';
import { useOperatorProfile } from './hooks/useOperatorProfile';

function AppContent() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [currentView, setCurrentView] = useState<'dashboard' | 'operators' | 'machines' | 'operations' | 'settings'>('dashboard');
  const [primaryWalletAddress, setPrimaryWalletAddress] = useState<string | null>(null);
  const { profile: realProfile, loading } = useOperatorProfile(primaryWalletAddress);

  // Local state for profile updates
  const [localProfile, setLocalProfile] = useState<OperatorProfile | null>(null);

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

  // Initialize local profile from localStorage or real profile
  useEffect(() => {
    if (primaryWalletAddress) {
      // Try to load from localStorage first
      const storedProfile = localStorage.getItem(`profile_${primaryWalletAddress}`);
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          // Convert date strings back to Date objects
          parsedProfile.createdAt = new Date(parsedProfile.createdAt);
          parsedProfile.updatedAt = new Date(parsedProfile.updatedAt);
          parsedProfile.lastActive = new Date(parsedProfile.lastActive);
          setLocalProfile(parsedProfile);
        } catch (e) {
          console.error('Failed to parse stored profile', e);
          if (realProfile) {
            setLocalProfile(realProfile);
          }
        }
      } else if (realProfile) {
        setLocalProfile(realProfile);
      }
    }
  }, [realProfile, primaryWalletAddress]);

  // Use local profile if available (for immediate updates), otherwise real profile, otherwise demo
  const currentProfile = localProfile || (authenticated && realProfile ? realProfile : demoProfile);
  const demoMode = !authenticated;

  const handleConnectWallet = () => {
    if (!authenticated) {
      login(); // Open Privy login modal
    }
    // Don't logout when clicking the connected button
    // User can logout from a separate menu if needed
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
      case 'operators':
        setCurrentView('operators');
        break;
      case 'machines':
        setCurrentView('machines');
        break;
      case 'operations':
        setCurrentView('operations');
        break;
      case 'settings':
        setCurrentView('settings');
        break;
      case 'dashboard':
        setCurrentView('dashboard');
        break;
      default:
        setCurrentView('dashboard');
    }
  };

  // Handle profile update from Settings
  const handleProfileUpdate = async (updates: Partial<OperatorProfile & { profilePicture?: string }>) => {
    // Update local state immediately for responsive UI
    if (localProfile || realProfile) {
      const updatedProfile = {
        ...(localProfile || realProfile),
        ...updates,
        updatedAt: new Date()
      } as OperatorProfile & { profilePicture?: string };

      setLocalProfile(updatedProfile);

      // Store in localStorage for persistence
      localStorage.setItem(`profile_${primaryWalletAddress}`, JSON.stringify(updatedProfile));
    }

    // In a real app, this would also save to Firebase/blockchain
    console.log('Profile updated:', updates);
    return Promise.resolve();
  };

  // Handle wallet disconnect
  const handleDisconnect = () => {
    logout();
    setCurrentView('dashboard');
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

  // All views now use the MinimalDashboardLayout with sidebar
  return (
    <>
      <MinimalDashboardLayout
        profile={currentProfile}
        onConnectWallet={handleConnectWallet}
        demoMode={demoMode}
        onNavigate={handleNavigation}
        authenticated={authenticated}
        walletAddress={primaryWalletAddress}
        currentView={currentView}
        onConnectToMachine={handleConnectToMachine}
        onCompleteOperation={handleCompleteOperation}
        onProfileUpdate={handleProfileUpdate}
        onDisconnect={handleDisconnect}
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