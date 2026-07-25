import { apiRequest, unwrapApiResponse } from './apiClient'
import type { MaintenanceIssue, CreateMaintenanceIssueRequest, UpdateMaintenanceIssueRequest } from '../../models/MaintenanceIssue'

// Based on the swagger definition /api/maintenance/issues
const basePath = 'issues'

// Notice the response is wrapped in a pagination object in swagger:
// { data: { items: MaintenanceIssue[], totalCount: number, ... } }
// If unwrapApiResponse handles 'data' extraction we just need the type.
export type PaginatedMaintenanceIssues = {
  items: MaintenanceIssue[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export function getMaintenanceIssues(status?: string, signal?: AbortSignal) {
  // If there's a status filter for issues, add it here. The prompt implies maybe status='Low' or just fetching them.
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal })
    .then((r) => unwrapApiResponse<PaginatedMaintenanceIssues>(r))
}

export function getMaintenanceIssueById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<MaintenanceIssue>(r))
}

export function createMaintenanceIssue(payload: CreateMaintenanceIssueRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<MaintenanceIssue>(r))
}

export function updateMaintenanceIssue(id: number, payload: UpdateMaintenanceIssueRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) => unwrapApiResponse<MaintenanceIssue>(r))
}

export function deleteMaintenanceIssue(id: number, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}
