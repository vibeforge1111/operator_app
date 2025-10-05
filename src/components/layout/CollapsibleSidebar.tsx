/**
 * Collapsible Sidebar Navigation
 *
 * Modern minimal sidebar with collapse functionality
 * Width: 64px collapsed / 256px expanded
 */

import React, { useState } from 'react';
import { LayoutDashboard, Cpu, Users, Activity, Settings, ChevronRight } from 'lucide-react';

interface CollapsibleSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'operators', icon: Users, label: 'Operators' },
  { id: 'machines', icon: Cpu, label: 'Machines' },
  { id: 'operations', icon: Activity, label: 'Operations' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function CollapsibleSidebar({ currentView, onViewChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      data-sidebar
      className={`
        fixed left-0 top-0 h-full bg-[var(--sidebar)] border-r border-[var(--border)]
        flex flex-col z-40 transition-all duration-200 ease-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-sm">O</span>
        </div>
        {!isCollapsed && (
          <div className="ml-3 animate-fade-in">
            <h1 className="text-lg font-medium text-[var(--foreground)]">Operator</h1>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200
                hover:bg-[var(--muted)] group relative
                ${isActive
                  ? 'bg-[var(--foreground)] text-[var(--background)] !important'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-medium animate-fade-in">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)]
                  text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity
                  whitespace-nowrap pointer-events-none z-50
                ">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            w-full flex items-center justify-center px-3 py-2 rounded-lg
            text-[var(--muted-foreground)] hover:text-[var(--foreground)]
            hover:bg-[var(--muted)] transition-all duration-200
          "
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            className={`
              w-5 h-5 transition-transform duration-200
              ${!isCollapsed ? 'rotate-180' : ''}
            `}
          />
          {!isCollapsed && (
            <span className="ml-3 font-medium animate-fade-in">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}