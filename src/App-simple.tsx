import React, { useState } from 'react';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import OperationBoard from './components/OperationBoard';
import { OperatorProfile } from './types/operator';

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
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'directory' | 'machines' | 'operations'>('dashboard');
  const [demoMode, setDemoMode] = useState(true);

  // Demo operator profile for showcasing the platform
  const demoProfile: OperatorProfile = {
    id: 'demo_operator',
    walletAddress: 'Demo Mode - Connect Wallet to Upgrade',
    handle: 'demo_operator',
    skills: ['Dev', 'Design', 'VibeOps'],
    xp: 2750,
    rank: 'Journeyman',
    connectedMachines: 3,
    activeOps: 2,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date(),
    lastActive: new Date(),
  };

  /**
   * Handles wallet connection upgrade
   */
  const handleConnectWallet = () => {
    // This will open wallet connection modal when implemented
    alert('Wallet connection will be available soon! For now, enjoy exploring the demo.');
  };

  /**
   * Switch to demo wallet view
   */
  const handleViewWalletOptions = () => {
    setCurrentView('home');
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

  // Wallet connection view (for future implementation)
  if (currentView === 'home') {
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              OPERATOR NETWORK
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Wallet connection will be available soon. For now, explore the demo!
            </p>
          </div>

          <div className="operator-card rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-primary)]">
              Coming Soon: Wallet Integration
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Connect your Solana wallet to create a real operator profile, earn XP, and participate in the network.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full px-4 py-2 bg-[var(--color-primary)] text-black rounded hover:bg-[var(--color-primary)]/80 transition-colors"
            >
              Continue with Demo
            </button>
          </div>

          <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1">
            <div>tick... tick... tick...</div>
            <div className="text-[var(--color-primary)]">Network heartbeat active</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'operations') {
    return (
      <OperationBoard
        profile={demoProfile}
        onBack={() => setCurrentView('dashboard')}
        onCompleteOperation={handleCompleteOperation}
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <OperatorDashboard
        profile={demoProfile}
        onViewDirectory={() => setCurrentView('directory')}
        onViewMachines={() => setCurrentView('machines')}
        onViewOperations={() => setCurrentView('operations')}
        onConnectWallet={handleConnectWallet}
        demoMode={demoMode}
      />
    );
  }

  // Default fallback - shouldn't reach here
  return null;
}

export default App;