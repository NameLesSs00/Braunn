import * as signalR from '@microsoft/signalr';

export interface PreventiveMaintenanceRequestNotification {
  planId: number;
  itemName: string;
  scheduledDate: string;
  requestStatus: string;
  preventiveMaintenanceRequestId: number;
  message: string;
}

export type SignalRConnectionState = 'Connected' | 'Disconnected' | 'Reconnecting';

export type PreventiveMaintenanceRequestCreatedHandler = (notification: PreventiveMaintenanceRequestNotification) => void;
export type ConnectionStateChangeHandler = (state: SignalRConnectionState) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionState: SignalRConnectionState = 'Disconnected';
  private requestCreatedHandlers: Set<PreventiveMaintenanceRequestCreatedHandler> = new Set();
  private stateChangeHandlers: Set<ConnectionStateChangeHandler> = new Set();

  private getPossibleHubUrls(): string[] {
    if (import.meta.env.VITE_NOTIFICATION_HUB_URL) {
      return [import.meta.env.VITE_NOTIFICATION_HUB_URL];
    }

    const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const cleanBase = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    
    // Try both singular (/notification) and plural (/notifications) to handle any backend ASP.NET Core MapHub configuration
    // Also including MaintenanceRequestCreated as specified by user
  return [
  `https://pmss.runasp.net/api/hubs/notifications`
];
  }

  public async startConnection(): Promise<void> {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      console.log('[SignalR] Connection already active or reconnecting:', this.connection.state);
      return;
    }

    const possibleUrls = this.getPossibleHubUrls();
    let lastError: unknown = null;

    for (const hubUrl of possibleUrls) {
      console.log('[SignalR] Attempting connection to NotificationHub at:', hubUrl);

      const builder = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
            return token;
          },
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            const delays = [0, 2000, 5000, 10000, 30000];
            return delays[retryContext.previousRetryCount] ?? 30000;
          },
        })
        .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning);

      const testConnection = builder.build();

      try {
        this.updateState('Reconnecting');
        await testConnection.start();
        console.log('[SignalR] Connected successfully to NotificationHub at:', hubUrl);
        this.connection = testConnection;
        this.setupEventListeners();
        this.updateState('Connected');
        return; // Success!
      } catch (err) {
        console.warn(`[SignalR] Connection failed for URL ${hubUrl}:`, err);
        lastError = err;
        try {
          await testConnection.stop();
        } catch {
          // Ignore stop errors during retry loop
        }
      }
    }

    console.error('[SignalR] All connection attempts failed. Last error:', lastError);
    this.updateState('Disconnected');
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.warn('[SignalR] Connection lost. Reconnecting...', error);
      this.updateState('Reconnecting');
    });

    this.connection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected successfully. ConnectionId:', connectionId);
      this.updateState('Connected');
    });

    this.connection.onclose((error) => {
      console.warn('[SignalR] Connection closed gracefully or due to error:', error);
      this.updateState('Disconnected');
    });

    const handleEvent = (eventName: string, data: PreventiveMaintenanceRequestNotification) => {
      console.log(`[SignalR] Real-time event received [${eventName}]:`, data);
      this.requestCreatedHandlers.forEach((handler) => {
        try {
          handler(data);
        } catch (e) {
          console.error(`[SignalR] Error executing handler for ${eventName}:`, e);
        }
      });
    };

    // Register all preventive maintenance notification event names (new dedicated names & legacy fallback)
    const eventNames = [
      'PreventiveMaintenanceRequestCreated',
      'PreventiveMaintenanceNotification',
      'MaintenanceRequestCreated',
    ];

    eventNames.forEach((eventName) => {
      this.connection?.on(eventName, (data: PreventiveMaintenanceRequestNotification) => {
        handleEvent(eventName, data);
      });
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        console.log('[SignalR] Stopping connection...');
        const eventNames = [
          'PreventiveMaintenanceRequestCreated',
          'PreventiveMaintenanceNotification',
          'MaintenanceRequestCreated',
        ];
        eventNames.forEach((name) => this.connection?.off(name));
        await this.connection.stop();
      } catch (err) {
        console.error('[SignalR] Error stopping connection:', err);
      } finally {
        this.connection = null;
        this.updateState('Disconnected');
      }
    }
  }

  public subscribePreventiveMaintenanceRequestCreated(handler: PreventiveMaintenanceRequestCreatedHandler): () => void {
    this.requestCreatedHandlers.add(handler);
    return () => {
      this.requestCreatedHandlers.delete(handler);
    };
  }

  public subscribeStateChange(handler: ConnectionStateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    handler(this.connectionState);
    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }

  public getConnectionState(): SignalRConnectionState {
    return this.connectionState;
  }

  private updateState(newState: SignalRConnectionState): void {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      console.log(`[SignalR] Connection state changed: ${newState}`);
      this.stateChangeHandlers.forEach((handler) => handler(newState));
    }
  }
}

export const signalRService = new SignalRService();
