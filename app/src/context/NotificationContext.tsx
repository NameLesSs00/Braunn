import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  PreventiveMaintenanceRequestNotification,
  SignalRConnectionState,
  signalRService,
} from '../services/signalr.service';
import { playNotificationSound } from '../shared/utils/sound';
import { NotificationToastContainer, ToastItem } from '../components/NotificationToast';
import { useAppDispatch } from '../shared/apis/hooks';
import { addNotification } from '../features/notifications/notificationsSlice';

export interface StoredNotification {
  id: string;
  data: PreventiveMaintenanceRequestNotification;
  read: boolean;
  receivedAt: Date;
}

export interface NotificationContextValue {
  connectionState: SignalRConnectionState;
  notifications: StoredNotification[];
  unreadCount: number;
  latestNotification: PreventiveMaintenanceRequestNotification | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reconnectSignalR: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>(
    signalRService.getConnectionState()
  );
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<PreventiveMaintenanceRequestNotification | null>(null);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Handle incoming notification
  const handlePreventiveMaintenanceRequestCreated = useCallback((notification: PreventiveMaintenanceRequestNotification) => {
    console.log('[NotificationContext] Handling PreventiveMaintenanceRequestCreated:', notification);

    const newNotificationItem: StoredNotification = {
      id: `${notification.preventiveMaintenanceRequestId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      data: notification,
      read: false,
      receivedAt: new Date(),
    };

    // Store in memory state
    setNotifications((prev) => [newNotificationItem, ...prev]);
    setLatestNotification(notification);

    // Also sync to Redux store
    dispatch(
      addNotification({
        type: 'maintenance_request_created',
        itemName: notification.itemName,
        message: notification.message,
        scheduledDate: notification.scheduledDate,
        status: notification.requestStatus,
      })
    );

    // Add to toast notifications queue
    const toastId = newNotificationItem.id;
    setActiveToasts((prev) => [...prev, { id: toastId, notification, timestamp: Date.now() }]);

    // Play notification sound
    playNotificationSound();
  }, [dispatch]);


  const dismissToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const reconnectSignalR = useCallback(async () => {
    await signalRService.startConnection();
  }, []);

  useEffect(() => {
    console.log('[NotificationContext] Mounting SignalR connection...');

    // Subscribe to state changes
    const unsubscribeState = signalRService.subscribeStateChange((newState) => {
      setConnectionState(newState);
    });

    // Subscribe to PreventiveMaintenanceRequestCreated event
    const unsubscribeEvent = signalRService.subscribePreventiveMaintenanceRequestCreated(
      handlePreventiveMaintenanceRequestCreated
    );

    // Start connection automatically when application starts
    signalRService.startConnection().catch((err) => {
      console.error('[NotificationContext] Connection start error:', err);
    });

    // Cleanup on unmount
    return () => {
      console.log('[NotificationContext] Unmounting, stopping SignalR connection and unsubscribing...');
      unsubscribeEvent();
      unsubscribeState();
      signalRService.stopConnection().catch((err) => {
        console.error('[NotificationContext] Error stopping SignalR connection during unmount:', err);
      });
    };
  }, [handlePreventiveMaintenanceRequestCreated]);

  const value = useMemo(
    () => ({
      connectionState,
      notifications,
      unreadCount,
      latestNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      reconnectSignalR,
    }),
    [
      connectionState,
      notifications,
      unreadCount,
      latestNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      reconnectSignalR,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToastContainer toasts={activeToasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
};
