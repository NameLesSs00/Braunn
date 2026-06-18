import { apiRequest, unwrapApiResponse } from './apiClient'
import type { FinancialDiscount, FinancialService } from '../../models/FinancialSettings'

const basePath = '/admin/financial-settings'

export function getFinancialServices(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/services`,
    signal,
  }).then((r) => unwrapApiResponse<FinancialService[]>(r))
}

export function getFinancialDiscounts(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/discounts`,
    signal,
  }).then((r) => unwrapApiResponse<FinancialDiscount[]>(r))
}
export function createFinancialDiscount(data: { name: string; value: number; type: 'FixedAmount' | 'Percentage' }) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/discounts`,
    body: JSON.stringify(data),
  }).then((r) => unwrapApiResponse<FinancialDiscount>(r))
}
export function createFinancialService(data: { name: string; price: number }) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/services`,
    body: JSON.stringify(data),
  }).then((r) => unwrapApiResponse<FinancialService>(r))
}
