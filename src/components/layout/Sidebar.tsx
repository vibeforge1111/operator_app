/**
 * Left Navigation Sidebar
 *
 * Modern sidebar navigation with icons for the Operator Network dashboard
 */

import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'operators', icon: '👥', label: 'Operators' },
  { id: 'machines', icon: '⚙️', label: 'Machines' },
  { id: 'operations', icon: '⚡', label: 'Operations' },
  { id: 'analytics', icon: '📊', label: 'Analytics' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-[#0a0a0a] border-r border-[var(--color-primary)]/20 flex flex-col items-center py-4 z-40">
      {/* Logo */}
      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center mb-8">
        <span className="text-black font-bold text-sm">O</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col space-y-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200
              ${currentView === item.id
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/50 hover:text-white'
              }
            `}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      {/* Bottom Help Icon */}
      <button className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/50 hover:text-white transition-all duration-200">
        ?
      </button>
    </div>
  );
}