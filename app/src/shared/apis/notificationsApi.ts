// Maintenance Notifications API
import { apiRequest, unwrapApiResponse } from './apiClient';

export interface NotificationItem {
  id: number;
  planId: number;
  itemName: string;
  scheduledDate: string;
  requestStatus: 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | string;
  preventiveMaintenanceRequestId: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsParams {
  PageNumber?: number;
  PageSize?: number;
  PlanId?: number;
  RequestStatus?: string;
  PreventiveMaintenanceRequestId?: number;
  ScheduledDateFrom?: string;
  ScheduledDateTo?: string;
  CreatedAtFrom?: string;
  CreatedAtTo?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const notificationsApi = {
  getNotifications: async (params?: GetNotificationsParams) => {
    const query = new URLSearchParams();
    if (params?.PageNumber) query.append('PageNumber', String(params.PageNumber));
    if (params?.PageSize) query.append('PageSize', String(params.PageSize));
    if (params?.PlanId) query.append('PlanId', String(params.PlanId));
    if (params?.RequestStatus) query.append('RequestStatus', params.RequestStatus);
    if (params?.PreventiveMaintenanceRequestId) query.append('PreventiveMaintenanceRequestId', String(params.PreventiveMaintenanceRequestId));
    if (params?.ScheduledDateFrom) query.append('ScheduledDateFrom', params.ScheduledDateFrom);
    if (params?.ScheduledDateTo) query.append('ScheduledDateTo', params.ScheduledDateTo);
    if (params?.CreatedAtFrom) query.append('CreatedAtFrom', params.CreatedAtFrom);
    if (params?.CreatedAtTo) query.append('CreatedAtTo', params.CreatedAtTo);
    if (params?.SortBy) query.append('SortBy', params.SortBy);
    if (params?.SortDirection) query.append('SortDirection', params.SortDirection);
    
    const path = `notifications${query.toString() ? `?${query.toString()}` : ''}`;
    return apiRequest<unknown>({ method: 'GET', path }).then((r) => unwrapApiResponse<PaginatedData<NotificationItem>>(r));
  },

  getNotificationById: async (id: number) => {
    const path = `notifications/${id}`;
    return apiRequest<unknown>({ method: 'GET', path }).then((r) => unwrapApiResponse<NotificationItem>(r));
  },
};
