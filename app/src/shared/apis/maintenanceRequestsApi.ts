// Maintenance Requests API
import { apiRequest, unwrapApiResponse } from './apiClient';
import type {
  CreateMaintenanceRequest,
  MaintenanceRequestListItem,
  MaintenanceRequestDetails,
  AssignEmployeeRequest,
  ReassignEmployeeRequest,
  PagedMaintenanceRequestsResponse
} from '../../models/MaintenanceRequest';

export const maintenanceRequestsApi = {
  // List with pagination, filters, search, sort
  fetchRequests: async (params: {
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    isDescending?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    if (params.priority) query.append('priority', params.priority);
    if (params.status) query.append('status', params.status);
    if (params.pageNumber) query.append('pageNumber', String(params.pageNumber));
    if (params.pageSize) query.append('pageSize', String(params.pageSize));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.isDescending !== undefined) query.append('isDescending', String(params.isDescending));
    const path = `maintenance-requests?${query.toString()}`;
    return apiRequest<unknown>({ method: 'GET', path }).then((r) => unwrapApiResponse<PagedMaintenanceRequestsResponse>(r));
  },

  // Get a single request by ID
  fetchRequestById: async (id: number | string) => {
    const path = `maintenance-requests/${id}`;
    return apiRequest<unknown>({ method: 'GET', path }).then((r) => unwrapApiResponse<MaintenanceRequestDetails>(r));
  },

  // Create a new request
  createRequest: async (payload: CreateMaintenanceRequest) => {
    const path = 'maintenance-requests';
    return apiRequest<unknown>({ method: 'POST', path, body: payload }).then((r) => unwrapApiResponse<MaintenanceRequestDetails>(r));
  },

  // Upload images (multipart/form-data)
  uploadImages: async (requestId: number | string, files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("Images", file);
    });

    const path = `maintenance-requests/${requestId}/images`;

    return apiRequest<unknown>({
      method: "POST",
      path,
      body: formData,
    }).then((r) => unwrapApiResponse<void>(r));
  },
  // Assign employee
  assignEmployee: async (id: number | string, payload: AssignEmployeeRequest) => {
    const path = `maintenance-requests/${id}/assign`;
    return apiRequest<unknown>({ method: 'POST', path, body: payload }).then((r) => unwrapApiResponse<void>(r));
  },

  // Reassign employee
  reassignEmployee: async (id: number | string, payload: ReassignEmployeeRequest) => {
    const path = `maintenance-requests/${id}/reassign`;
    return apiRequest<unknown>({ method: 'POST', path, body: payload }).then((r) => unwrapApiResponse<void>(r));
  },

  // Start request
  startRequest: async (id: number | string) => {
    const path = `maintenance-requests/${id}/start`;
    return apiRequest<unknown>({ method: 'POST', path }).then((r) => unwrapApiResponse<void>(r));
  },

  // Complete request
  completeRequest: async (id: number | string) => {
    const path = `maintenance-requests/${id}/complete`;
    return apiRequest<unknown>({ method: 'POST', path }).then((r) => unwrapApiResponse<void>(r));
  },

  // Fetch reassign history for a request
  fetchReassignHistory: async (id: number | string) => {
    const path = `maintenance-requests/${id}/reassign-history`;
    return apiRequest<unknown>({ method: 'GET', path }).then((r) => unwrapApiResponse<any>(r));
  }
};
