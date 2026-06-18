import { apiRequest, unwrapApiResponse } from './apiClient'
import { GroupContract } from '../../models/GroupContract'

export interface CreateGroupContractRequest {
  groupName: string
  contactPerson: string
  arrivalDate: string
  departureDate: string
  blockedRooms: number
  discountAmount: number
  depositRequired: number
  status: string
  roomTypeId: string
}

export interface UpdateGroupContractRequest {
  groupName: string
  contactPerson: string
  arrivalDate: string
  departureDate: string
  blockedRooms: number
  discountAmount: number
  depositRequired: number
  status: string
  roomTypeId: string
}

const basePath = 'local/group-contracts'

export function getGroupContracts(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: basePath,
    signal,
  }).then((r) => unwrapApiResponse<GroupContract[]>(r))
}

export function createGroupContract(payload: CreateGroupContractRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<string>(r)) // Returns string id
}

export function getGroupContractById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<GroupContract>(r))
}

export function updateGroupContract(id: string, payload: UpdateGroupContractRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function deleteGroupContract(id: string, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'DELETE',
    path: `${basePath}/${id}`,
    signal,
  })
}

export function releaseGroupContract(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/release`,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}
