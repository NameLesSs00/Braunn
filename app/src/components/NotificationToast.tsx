import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Wrench, X } from 'lucide-react';
import type { MaintenanceRequestNotification } from '../services/signalr.service';

export interface ToastItem {
  id: string;
  notification: MaintenanceRequestNotification;
  timestamp: number;
}

interface NotificationToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <NotificationToastItem key={toast.id} item={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const NotificationToastItem: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { notification } = item;

  useEffect(() => {
    // Trigger entrance animation
    const enterTimeout = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 7 seconds
    const dismissTimeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 7000);

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(dismissTimeout);
    };
  }, [onDismiss]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const formattedDate = notification.scheduledDate
    ? new Date(notification.scheduledDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div
      className={`pointer-events-auto flex w-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
          <Wrench className="h-5 w-5 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              <Bell className="h-3 w-3" /> Preventive Maintenance
            </span>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h4 className="mt-1.5 text-sm font-bold text-slate-900 truncate">
            {notification.itemName || 'Preventive Maintenance Item'}
          </h4>

          <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">
            {notification.message}
          </p>

          <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Scheduled: <strong className="text-slate-700">{formattedDate}</strong>
            </span>
            <span className="ml-auto inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {notification.requestStatus || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className="h-full bg-blue-600 transition-all duration-[7000ms] ease-linear"
          style={{ width: isVisible ? '0%' : '100%' }}
        />
      </div>
    </div>
  );
};
