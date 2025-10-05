/**
 * Notification System Component
 *
 * Displays real-time notifications for important events in the operator network.
 * Shows operation updates, machine connections, and other activity with smooth animations.
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { subscribeToRecentActivity, RealtimeManager } from '../lib/firebase/realtime';

interface Notification {
  id: string;
  type: 'operation' | 'machine' | 'operator';
  action: string;
  title: string;
  message: string;
  timestamp: Date;
  isNew: boolean;
}

interface NotificationSystemProps {
  /** Maximum number of notifications to display */
  maxNotifications?: number;
  /** Auto-hide notifications after this many milliseconds */
  autoHideDuration?: number;
}

export default function NotificationSystem({
  maxNotifications = 5,
  autoHideDuration = 8000
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realtimeManager] = useState(() => new RealtimeManager());

  useEffect(() => {
    // Subscribe to recent activity for notifications
    const unsubscribe = subscribeToRecentActivity((activities, error) => {
      if (error) {
        console.error('Failed to load activity:', error);
        return;
      }

      // Convert activities to notifications
      const newNotifications: Notification[] = activities.slice(0, maxNotifications).map(activity => {
        let title = '';
        let message = '';

        switch (activity.type) {
          case 'operation':
            switch (activity.action) {
              case 'claimed':
                title = '🎯 Operation Claimed';
                message = `"${activity.data.title}" has been claimed by an operator`;
                break;
              case 'started':
                title = '🚀 Operation Started';
                message = `Work has begun on "${activity.data.title}"`;
                break;
              case 'submitted':
                title = '📤 Operation Submitted';
                message = `"${activity.data.title}" has been submitted for review`;
                break;
              case 'completed':
                title = '✅ Operation Completed';
                message = `"${activity.data.title}" has been successfully completed`;
                break;
              default:
                title = '⚡ New Operation';
                message = `"${activity.data.title}" is now available`;
            }
            break;
          case 'machine':
            title = '🔧 Machine Update';
            message = `Machine activity detected`;
            break;
          case 'operator':
            title = '👤 Operator Activity';
            message = `Operator status updated`;
            break;
        }

        return {
          id: `${activity.type}-${activity.entityId}-${activity.timestamp.getTime()}`,
          type: activity.type,
          action: activity.action,
          title,
          message,
          timestamp: activity.timestamp,
          isNew: true
        };
      });

      setNotifications(newNotifications);
    });

    realtimeManager.addListener(unsubscribe);

    return () => {
      realtimeManager.cleanup();
    };
  }, [maxNotifications]);

  // Auto-hide notifications after duration
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timers = notifications.map(notification => {
        if (notification.isNew) {
          return setTimeout(() => {
            setNotifications(prev =>
              prev.map(n =>
                n.id === notification.id ? { ...n, isNew: false } : n
              )
            );
          }, autoHideDuration);
        }
        return null;
      });

      return () => {
        timers.forEach(timer => timer && clearTimeout(timer));
      };
    }
  }, [notifications, autoHideDuration]);

  // Remove non-new notifications after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.isNew));
    }, 1000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const getNotificationIcon = (type: string, action: string): string => {
    switch (type) {
      case 'operation':
        switch (action) {
          case 'claimed': return '🎯';
          case 'started': return '🚀';
          case 'submitted': return '📤';
          case 'completed': return '✅';
          default: return '⚡';
        }
      case 'machine':
        return '🔧';
      case 'operator':
        return '👤';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string, action: string): string => {
    switch (action) {
      case 'completed':
        return 'border-green-500/50 bg-green-900/20';
      case 'claimed':
      case 'started':
        return 'border-blue-500/50 bg-blue-900/20';
      case 'submitted':
        return 'border-yellow-500/50 bg-yellow-900/20';
      default:
        return 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`transform transition-all duration-500 ease-in-out ${
            notification.isNew
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0'
          }`}
        >
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${getNotificationColor(notification.type, notification.action)}`}>
            <div className="flex items-start space-x-3">
              <div className="text-xl mt-0.5">
                {getNotificationIcon(notification.type, notification.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">
                  {notification.title}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {notification.message}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev =>
                    prev.map(n =>
                      n.id === notification.id ? { ...n, isNew: false } : n
                    )
                  );
                }}
                className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}