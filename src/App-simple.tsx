import React, { useState } from 'react';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import OperationBoard from './components/OperationBoard';
import WalletConnection from './components/WalletConnection';
import { WalletContextProvider } from './contexts/WalletContext';
import { useOperatorProfile } from './hooks/useOperatorProfile';

/**
 * Main Application Component
 *
 * Core application orchestrator that manages routing between different
 * views of the Operator Network. Handles wallet connection state,
 * view transitions, and provides a unified navigation system.
 *
 * Features:
 * - Multi-view routing (home, dashboard, directory, machines)
 * - Mock wallet connection for demo purposes
 * - Operator profile integration
 * - Machine connection handling
 * - Responsive view transitions
 *
 * Views:
 * - Home: Wallet connection and onboarding
 * - Dashboard: Personal operator command center
 * - Directory: Network operator discovery
 * - Machines: Machine marketplace and connections
 *
 * @component
 * @returns {JSX.Element} The main application interface
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'directory' | 'machines' | 'operations'>('home');
  const [connectedWallet, setConnectedWallet] = useState<string | undefined>(undefined);
  const { profile } = useOperatorProfile(connectedWallet);

  /**
   * Handles wallet connection
   *
   * Processes successful wallet connection and transitions to the dashboard view.
   * Integrates with actual Solana wallet adapters.
   */
  const handleWalletConnected = (walletAddress: string) => {
    setConnectedWallet(walletAddress);
  };

  // Auto-navigate to dashboard when both wallet is connected and profile exists
  React.useEffect(() => {
    if (connectedWallet && profile && currentView === 'home') {
      setCurrentView('dashboard');
    }
  }, [connectedWallet, profile, currentView]);

  /**
   * Handles machine connection requests
   *
   * Processes operator connections to machines and provides user feedback.
   * In production, this would update the backend and blockchain state.
   *
   * @param {string} machineId - The ID of the machine to connect to
   */
  const handleConnectToMachine = (machineId: string) => {
    // In production, this would update the backend
    console.log(`Connecting to machine: ${machineId}`);
    // Show success message and redirect to dashboard
    alert(`Successfully connected to machine!`);
    setCurrentView('dashboard');
  };

  /**
   * Handles operation completion with XP and token rewards
   *
   * Processes operator completion of operations, awards XP/tokens,
   * and updates their profile with new rank progression.
   *
   * @param {string} operationId - The ID of the operation to complete
   */
  const handleCompleteOperation = (operationId: string) => {
    // This will be handled by the OperationBoard component
    // with full XP calculation and reward distribution
    console.log(`Completing operation: ${operationId}`);
  };

  if (currentView === 'directory') {
    return <OperatorDirectory onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'machines') {
    return (
      <MachineMarketplace
        onBack={() => setCurrentView('dashboard')}
        onConnectToMachine={handleConnectToMachine}
      />
    );
  }

  if (currentView === 'operations' && profile) {
    return (
      <OperationBoard
        profile={profile}
        onBack={() => setCurrentView('dashboard')}
        onCompleteOperation={handleCompleteOperation}
      />
    );
  }

  if (currentView === 'dashboard' && profile) {
    return (
      <OperatorDashboard
        profile={profile}
        onViewDirectory={() => setCurrentView('directory')}
        onViewMachines={() => setCurrentView('machines')}
        onViewOperations={() => setCurrentView('operations')}
      />
    );
  }

  return (
    <div className="min-h-screen terminal-bg flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
            OPERATOR NETWORK
          </h1>
          <p className="text-[var(--color-text-muted)]">
            The foundational identity and discovery layer. Establish presence, showcase capabilities, discover collaborators.
          </p>
        </div>

        <WalletConnection onConnected={handleWalletConnected} />

        <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1">
          <div>tick... tick... tick...</div>
          <div className="text-[var(--color-primary)]">Network heartbeat active</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;