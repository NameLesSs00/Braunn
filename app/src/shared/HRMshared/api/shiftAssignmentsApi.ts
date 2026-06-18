import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import {
  ShiftAssignmentQueryParams,
  PaginatedShiftAssignment,
  ShiftAssignmentCreateDto,
  ShiftAssignmentUpdateDto,
  ShiftAssignmentReadDto
} from '../../../models/HRMmodels/ShiftAssignments';

const basePath = '/hr/HRShifts';

export function getShiftAssignments(params?: ShiftAssignmentQueryParams, signal?: AbortSignal) {
  // Map params to query string
  const query = new URLSearchParams();
  if (params) {
    if (params.EmployeeId) query.append('EmployeeId', params.EmployeeId);
    if (params.ShiftId) query.append('ShiftId', params.ShiftId);
    if (params.PageNumber) query.append('PageNumber', params.PageNumber.toString());
    if (params.PageSize) query.append('PageSize', params.PageSize.toString());
    if (params.SearchTerm) query.append('SearchTerm', params.SearchTerm);
    if (params.SortBy) query.append('SortBy', params.SortBy);
    if (params.SortDirection) query.append('SortDirection', params.SortDirection);
  }
  const queryString = query.toString() ? `?${query.toString()}` : '';

  return apiRequest<unknown>({ 
    method: 'GET', 
    path: `${basePath}/assignments${queryString}`, 
    signal 
  }).then((r: any) => unwrapApiResponse<PaginatedShiftAssignment>(r));
}

export function assignShift(payload: ShiftAssignmentCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'POST', 
    path: `${basePath}/assign`, 
    body: payload, 
    signal 
  }).then((r: any) => unwrapApiResponse<void>(r));
}

export function updateShiftAssignment(id: string, payload: ShiftAssignmentUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'PUT', 
    path: `${basePath}/assign/${id}`, 
    body: payload, 
    signal 
  }).then((r: any) => unwrapApiResponse<ShiftAssignmentReadDto>(r));
}

export function deleteShiftAssignment(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'DELETE', 
    path: `${basePath}/assign/${id}`, 
    signal 
  }).then((r: any) => unwrapApiResponse<void>(r));
}
