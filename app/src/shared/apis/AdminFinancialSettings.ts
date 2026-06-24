import { apiRequest, unwrapApiResponse } from './apiClient'
import type { FinancialDiscount, FinancialService, CreateDiscountPayload, UpdateDiscountPayload } from '../../models/FinancialSettings'

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

export function createFinancialDiscount(data: CreateDiscountPayload) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/discounts`,
    body: data,
  }).then((r) => unwrapApiResponse<string>(r))
}

export function updateFinancialDiscount(id: string, data: UpdateDiscountPayload) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/discounts/${id}`,
    body: data,
  }).then((r) => unwrapApiResponse<boolean>(r))
}

export function toggleFinancialDiscount(id: string) {
  return apiRequest<unknown>({
    method: 'PATCH',
    path: `${basePath}/discounts/${id}/toggle`,
  }).then((r) => unwrapApiResponse<boolean>(r))
}

export function createFinancialService(data: { name: string; price: number }) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/services`,
    body: data,
  }).then((r) => unwrapApiResponse<FinancialService>(r))
}
