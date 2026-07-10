import { apiRequest, unwrapApiResponse } from './apiClient';
import type { 
  FrontOfficeComplaintReadDto, 
  FrontOfficeComplaintCreateDto, 
  FrontOfficeComplaintUpdateStatusDto 
} from '../../models/FrontOfficeComplaint';

const BASE_PATH = 'frontoffice/complaints';

export const frontOfficeComplaintsApi = {
  fetchComplaints: async (params?: {
    DateFrom?: string;
    DateTo?: string;
    Status?: string;
    Priority?: string;
    Category?: string;
    GuestId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.DateFrom) query.append('DateFrom', params.DateFrom);
    if (params?.DateTo) query.append('DateTo', params.DateTo);
    if (params?.Status) query.append('Status', params.Status);
    if (params?.Priority) query.append('Priority', params.Priority);
    if (params?.Category) query.append('Category', params.Category);
    if (params?.GuestId) query.append('GuestId', params.GuestId);

    const qs = query.toString();
    const fullPath = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

    const response = await apiRequest<FrontOfficeComplaintReadDto[]>({ method: 'GET', path: fullPath });
    return unwrapApiResponse<FrontOfficeComplaintReadDto[]>(response);
  },

  fetchComplaintById: async (id: string) => {
    const response = await apiRequest<FrontOfficeComplaintReadDto>({ method: 'GET', path: `${BASE_PATH}/${id}` });
    return unwrapApiResponse<FrontOfficeComplaintReadDto>(response);
  },

  createComplaint: async (payload: FrontOfficeComplaintCreateDto) => {
    const response = await apiRequest<FrontOfficeComplaintReadDto>({ method: 'POST', path: BASE_PATH, body: payload });
    return unwrapApiResponse<FrontOfficeComplaintReadDto>(response);
  },

  updateComplaintStatus: async (id: string, payload: FrontOfficeComplaintUpdateStatusDto) => {
    const response = await apiRequest<FrontOfficeComplaintReadDto>({ method: 'PATCH', path: `${BASE_PATH}/${id}/status`, body: payload });
    return unwrapApiResponse<FrontOfficeComplaintReadDto>(response);
  }
};
