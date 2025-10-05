import React, { useState } from 'react';
import OperatorDashboard from './components/OperatorDashboard';
import OperatorDirectory from './components/OperatorDirectory';
import MachineMarketplace from './components/MachineMarketplace';
import { useOperatorProfile } from './hooks/useOperatorProfile';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'directory' | 'machines'>('home');
  const [isConnected, setIsConnected] = useState(false);
  const [mockWallet] = useState('5KxW...g8Qp'); // Mock wallet for demo
  const { profile } = useOperatorProfile(isConnected ? mockWallet : undefined);

  const handleConnect = () => {
    setIsConnected(true);
    setCurrentView('dashboard');
  };

  const handleConnectToMachine = (machineId: string) => {
    // In production, this would update the backend
    console.log(`Connecting to machine: ${machineId}`);
    // Show success message and redirect to dashboard
    alert(`Successfully connected to machine!`);
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

  if (currentView === 'dashboard' && profile) {
    return (
      <OperatorDashboard
        profile={profile}
        onViewDirectory={() => setCurrentView('directory')}
        onViewMachines={() => setCurrentView('machines')}
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