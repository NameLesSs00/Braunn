import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmReceptionAssignmentReadDto,
  HkmReceptionAssignmentCreateDto,
  HkmReceptionAssignmentUpdateDto,
  HkmReceptionAssignmentsListDto,
  HkmReceptionAssignmentsParams,
} from '../../../models/HKmodels/HkmReceptionAssignment'

const basePath = 'hkm/reception-assignments'

function buildQuery(params?: HkmReceptionAssignmentsParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.RequestId !== undefined) q.set('RequestId', String(params.RequestId))
  if (params.EmployeeId) q.set('EmployeeId', params.EmployeeId)

  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getHkmReceptionAssignments(params?: HkmReceptionAssignmentsParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentsListDto>(r)
  )
}

export function createHkmReceptionAssignment(payload: HkmReceptionAssignmentCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentReadDto>(r)
  )
}

export function getHkmReceptionAssignmentById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentReadDto>(r)
  )
}

export function updateHkmReceptionAssignment(
  id: number,
  payload: HkmReceptionAssignmentUpdateDto,
  signal?: AbortSignal
) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentReadDto>(r)
  )
}

export function deleteHkmReceptionAssignment(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<string>(r)
  )
}

export function setHkmReceptionAssignmentProgress(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}/set-progress`, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentReadDto>(r)
  )
}

export function completeHkmReceptionAssignment(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}/completed`, signal }).then((r) =>
    unwrapApiResponse<HkmReceptionAssignmentReadDto>(r)
  )
}
