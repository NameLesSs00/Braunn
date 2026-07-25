import { useContext, useEffect, useRef } from 'react';
import { NotificationContext, NotificationContextValue } from '../context/NotificationContext';
import { PreventiveMaintenanceRequestNotification } from '../services/signalr.service';

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Custom hook to listen specifically for new PreventiveMaintenanceRequestCreated notifications inside components.
 * Useful for components/pages that need to trigger side-effects like list refresh.
 */
export function useOnPreventiveMaintenanceRequestCreated(
  callback: (notification: PreventiveMaintenanceRequestNotification) => void
): void {
  const { latestNotification } = useNotifications();
  const lastProcessedRef = useRef<PreventiveMaintenanceRequestNotification | null>(null);

  useEffect(() => {
    if (latestNotification && latestNotification !== lastProcessedRef.current) {
      lastProcessedRef.current = latestNotification;
      callback(latestNotification);
    }
  }, [latestNotification, callback]);
}
