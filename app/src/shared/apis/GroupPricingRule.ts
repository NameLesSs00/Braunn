import { apiRequest, unwrapApiResponse } from './apiClient'

export interface GroupPricingRule {
  id: string
  roomTypeId: string
  groupName: string
  minNumberOfRooms: number
  discountPercentage: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export interface CreateGroupPricingRuleRequest {
  roomTypeId: string
  groupName: string
  minNumberOfRooms: number
  discountPercentage: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export interface UpdateGroupPricingRuleRequest {
  roomTypeId: string
  groupName: string
  minNumberOfRooms: number
  discountPercentage: number
  validFrom: string
  validTo: string
  isActive: boolean
}

const basePath = 'local/group-pricing'

export function getGroupPricingRules(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: basePath,
    signal,
  }).then((r) => unwrapApiResponse<GroupPricingRule[]>(r))
}

export function createGroupPricingRule(payload: CreateGroupPricingRuleRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<GroupPricingRule>(r))
}

export function getGroupPricingRuleById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<GroupPricingRule>(r))
}

export function updateGroupPricingRule(id: string, payload: UpdateGroupPricingRuleRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function deleteGroupPricingRule(id: string, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'DELETE',
    path: `${basePath}/${id}`,
    signal,
  })
}
