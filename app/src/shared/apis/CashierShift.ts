import { apiRequest, unwrapApiResponse } from './apiClient'
import type { BusinessDate } from '../../models/BusinessDate'
import type { CashierShift, OpenShiftPayload, CloseShiftPayload } from '../../models/CashierShift'

// ─── Business Date ────────────────────────────────────────────────────────────

export function getCurrentBusinessDate(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: '/business-date/current',
    signal,
  }).then((r) => unwrapApiResponse<BusinessDate>(r))
}

// ─── Cashier Shifts ───────────────────────────────────────────────────────────

export function getCurrentShift(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: '/cashier/shifts/current',
    signal,
  }).then((r) => unwrapApiResponse<CashierShift>(r))
}

export function openShift(payload: OpenShiftPayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: '/cashier/shifts/open',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CashierShift>(r))
}

export function closeShift(shiftId: string, payload: CloseShiftPayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `/cashier/shifts/${shiftId}/close`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CashierShift>(r))
}
