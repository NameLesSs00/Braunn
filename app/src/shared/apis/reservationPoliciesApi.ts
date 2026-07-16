import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  ReservationPolicy,
  ReservationPolicyPayload,
  ReservationPolicyType,
  CancellationPolicySettings,
  EarlyCheckoutPolicySettings,
  LateCheckoutPolicySettings,
  ExtendStayPolicySettings,
  RoomChangePolicySettings,
} from '../../models/ReservationPolicy'

const basePath = 'admin/reservation-policies'

export type GetReservationPoliciesParams = {
  policyType?: ReservationPolicyType
  isActive?: boolean
}

function withQuery(path: string, params?: GetReservationPoliciesParams) {
  const query = new URLSearchParams()
  if (params?.policyType) query.set('policyType', params.policyType)
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive))
  const value = query.toString()
  return value ? `${path}?${value}` : path
}

export function getReservationPolicies(params?: GetReservationPoliciesParams, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: withQuery(basePath, params),
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy[]>(r))
}

export function getReservationPolicyById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function createCancellationPolicy(payload: ReservationPolicyPayload<CancellationPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/cancellation-policy`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function updateCancellationPolicy(id: number, payload: ReservationPolicyPayload<CancellationPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/cancellation-policy/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function createEarlyCheckoutPolicy(payload: ReservationPolicyPayload<EarlyCheckoutPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/early-checkout-policy`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function updateEarlyCheckoutPolicy(id: number, payload: ReservationPolicyPayload<EarlyCheckoutPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/early-checkout-policy/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function createLateCheckoutPolicy(payload: ReservationPolicyPayload<LateCheckoutPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/late-checkout-policy`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function updateLateCheckoutPolicy(id: number, payload: ReservationPolicyPayload<LateCheckoutPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/late-checkout-policy/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function createExtendStayPolicy(payload: ReservationPolicyPayload<ExtendStayPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/extend-policy`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function updateExtendStayPolicy(id: number, payload: ReservationPolicyPayload<ExtendStayPolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/extend-policy/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function createRoomChangePolicy(payload: ReservationPolicyPayload<RoomChangePolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/room-change-policy`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}

export function updateRoomChangePolicy(id: number, payload: ReservationPolicyPayload<RoomChangePolicySettings>, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/room-change-policy/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy>(r))
}
