import { apiRequest, unwrapApiResponse } from './apiClient'

export interface PerPersonPricing {
  id: string
  roomTypeId: string
  adultPrice: number
  childPrice: number
  extraBedPrice: number
  maxOccupancy: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export interface CreatePerPersonPricingRequest {
  roomTypeId: string
  adultPrice: number
  childPrice: number
  extraBedPrice: number
  maxOccupancy: number
  validFrom: string
  validTo: string
  isActive: boolean
}

const basePath = 'local/per-person-pricing'

export function getPerPersonPricing(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: basePath,
    signal,
  }).then((r) => unwrapApiResponse<PerPersonPricing[]>(r))
}

export function createPerPersonPricing(payload: CreatePerPersonPricingRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<PerPersonPricing>(r))
}

export function getPerPersonPricingById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<PerPersonPricing>(r))
}

export interface UpdatePerPersonPricingRequest {
  roomTypeId: string
  adultPrice: number
  childPrice: number
  extraBedPrice: number
  maxOccupancy: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export function updatePerPersonPricing(id: string, payload: UpdatePerPersonPricingRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function deletePerPersonPricing(id: string, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'DELETE',
    path: `${basePath}/${id}`,
    signal,
  })
}
