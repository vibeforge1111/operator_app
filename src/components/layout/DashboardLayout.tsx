/**
 * Dashboard Layout Wrapper
 *
 * Main layout component that combines sidebar, top bar, and content area
 */

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModernDashboard } from '../ModernDashboard';
import OperatorDirectory from '../OperatorDirectory';
import MachineMarketplace from '../MachineMarketplace';
import OperationBoard from '../OperationBoard';
import { OperatorProfile } from '../../types/operator';

interface DashboardLayoutProps {
  profile: OperatorProfile;
  onConnectWallet: () => void;
  demoMode: boolean;
}

export function DashboardLayout({ profile, onConnectWallet, demoMode }: DashboardLayoutProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ModernDashboard profile={profile} />;
      case 'operators':
        return <OperatorDirectory onBack={() => setCurrentView('dashboard')} />;
      case 'machines':
        return <MachineMarketplace onBack={() => setCurrentView('dashboard')} onConnectToMachine={() => {}} />;
      case 'operations':
        return <OperationBoard profile={profile} onBack={() => setCurrentView('dashboard')} onCompleteOperation={() => {}} />;
      default:
        return <ModernDashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <TopBar profile={profile} onConnectWallet={onConnectWallet} demoMode={demoMode} />
      {renderContent()}
    </div>
  );
}