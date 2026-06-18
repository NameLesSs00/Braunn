import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type { 
  PositionReadDto, 
  PositionCreateDto, 
  PositionUpdateDto 
} from '../../../models/HRMmodels/Position';

const BASE_PATH = 'hr/HRPositions';

export const positionsApi = {
  /**
   * Fetch a paginated list of positions
   */
  fetchPositions: async (params?: {
    PageNumber?: number;
    PageSize?: number;
    SearchTerm?: string;
    SortBy?: string;
    SortDirection?: string;
    IsActive?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.PageNumber !== undefined) query.append('PageNumber', String(params.PageNumber));
    if (params?.PageSize !== undefined) query.append('PageSize', String(params.PageSize));
    if (params?.SearchTerm) query.append('SearchTerm', params.SearchTerm);
    if (params?.SortBy) query.append('SortBy', params.SortBy);
    if (params?.SortDirection) query.append('SortDirection', params.SortDirection);
    if (params?.IsActive !== undefined) query.append('IsActive', String(params.IsActive));

    const qs = query.toString();
    const fullPath = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

    const response = await apiRequest<{
      pageNumber: number;
      pageSize: number;
      items: PositionReadDto[];
      totalCount: number;
    }>({ method: 'GET', path: fullPath });
    return unwrapApiResponse(response);
  },

  /**
   * Fetch a single position by ID
   */
  fetchPositionById: async (id: string) => {
    const response = await apiRequest<PositionReadDto>({ method: 'GET', path: `${BASE_PATH}/${id}` });
    return unwrapApiResponse(response);
  },

  /**
   * Create a new position
   */
  createPosition: async (payload: PositionCreateDto) => {
    const response = await apiRequest<PositionReadDto>({ method: 'POST', path: BASE_PATH, body: payload });
    return unwrapApiResponse(response);
  },

  /**
   * Update an existing position
   */
  updatePosition: async (id: string, payload: PositionUpdateDto) => {
    const response = await apiRequest<PositionReadDto>({ method: 'PUT', path: `${BASE_PATH}/${id}`, body: payload });
    return unwrapApiResponse(response);
  },

  /**
   * Delete a position
   */
  deletePosition: async (id: string) => {
    const response = await apiRequest<void>({ method: 'DELETE', path: `${BASE_PATH}/${id}` });
    return unwrapApiResponse(response);
  }
};
