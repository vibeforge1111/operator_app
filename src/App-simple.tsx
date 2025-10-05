import React, { useState } from 'react';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import OperationBoard from './components/OperationBoard';
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
function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'directory' | 'machines' | 'operations'>('home');
  const [isConnected, setIsConnected] = useState(false);
  const [mockWallet] = useState('5KxW...g8Qp'); // Mock wallet for demo
  const { profile } = useOperatorProfile(isConnected ? mockWallet : undefined);

  /**
   * Handles wallet connection for demo purposes
   *
   * Simulates wallet connection and transitions to the dashboard view.
   * In production, this would integrate with actual Solana wallet adapters.
   */
  const handleConnect = () => {
    setIsConnected(true);
    setCurrentView('dashboard');
  };

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
   * Handles operation acceptance requests
   *
   * Processes operator acceptance of operations and updates their profile.
   * In production, this would update the backend and award XP/tokens.
   *
   * @param {string} operationId - The ID of the operation to accept
   */
  const handleAcceptOperation = (operationId: string) => {
    // In production, this would update the backend and operator profile
    console.log(`Accepting operation: ${operationId}`);
    // Show success message and redirect to dashboard
    alert(`Successfully accepted operation! Check your dashboard for updates.`);
    setCurrentView('dashboard');
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
        onAcceptOperation={handleAcceptOperation}
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
          <button
            onClick={handleConnect}
            className="px-8 py-4 bg-[var(--color-primary)] text-black font-medium rounded-lg hover:bg-[var(--color-primary)]/80 transition-colors"
          >
            {isConnected ? 'Enter Network' : 'Connect Wallet (Demo)'}
          </button>
          <p className="text-sm text-[var(--color-text-muted)]">
            Demo mode - exploring the operator network
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

export default App;