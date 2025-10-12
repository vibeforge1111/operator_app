/**
 * Minimal Dashboard Layout
 *
 * Three-layer layout with collapsible sidebar, fixed top bar, and main content
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { MinimalTopBar } from './MinimalTopBar';
import { MVPDashboard } from '../MVPDashboard';
import OperatorDirectory from '../OperatorDirectory';
import MachineMarketplace from '../MachineMarketplace';
import OperationBoard from '../OperationBoard';
import { OperatorProfile } from '../../types/operator';

interface MinimalDashboardLayoutProps {
  profile: OperatorProfile;
  onConnectWallet: () => void;
  demoMode: boolean;
  onNavigate?: (view: string) => void;
  authenticated?: boolean;
  walletAddress?: string | null;
  currentView?: string;
  onConnectToMachine?: (machineId: string) => void;
  onCompleteOperation?: (operationId: string) => void;
}

export function MinimalDashboardLayout({
  profile,
  onConnectWallet,
  demoMode,
  onNavigate,
  authenticated,
  walletAddress,
  currentView: externalView,
  onConnectToMachine,
  onCompleteOperation
}: MinimalDashboardLayoutProps) {
  const [currentView, setCurrentView] = useState(externalView || 'dashboard');

  // Sync with external view changes
  useEffect(() => {
    if (externalView) {
      setCurrentView(externalView);
    }
  }, [externalView]);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default expanded width

  // Listen for sidebar width changes
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar) {
        setSidebarWidth(sidebar.getBoundingClientRect().width);
      }
    };

    // Update initially and on resize
    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);

    // Also listen for transition end to catch collapse/expand
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      sidebar.addEventListener('transitionend', updateSidebarWidth);
    }

    return () => {
      window.removeEventListener('resize', updateSidebarWidth);
      if (sidebar) {
        sidebar.removeEventListener('transitionend', updateSidebarWidth);
      }
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <MVPDashboard profile={profile} onNavigate={(view) => {
          setCurrentView(view);
          if (onNavigate) {
            onNavigate(view);
          }
        }} />;
      case 'operators':
        return <OperatorDirectory onBack={() => setCurrentView('dashboard')} />;
      case 'machines':
        return <MachineMarketplace onBack={() => setCurrentView('dashboard')} onConnectToMachine={onConnectToMachine || (() => {})} />;
      case 'operations':
        return <OperationBoard profile={profile} onBack={() => setCurrentView('dashboard')} onCompleteOperation={onCompleteOperation || (() => {})} />;
      default:
        return <MVPDashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (onNavigate) {
            onNavigate(view);
          }
        }}
      />

      {/* Fixed Top Bar */}
      <MinimalTopBar
        profile={profile}
        onConnectWallet={onConnectWallet}
        demoMode={demoMode}
        sidebarWidth={sidebarWidth}
      />

      {/* Main Content Area */}
      <main
        className="pt-16 min-h-screen transition-all duration-200 scrollbar-hide overflow-auto"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}