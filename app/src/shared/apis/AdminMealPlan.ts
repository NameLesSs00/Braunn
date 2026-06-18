import { apiRequest, unwrapApiResponse } from './apiClient'
import type { MealPlan, CreateMealPlanRequest } from '../../models/MealPlan'

const basePath = 'admin/meal-plans'

export function getMealPlans(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: basePath,
    signal,
  }).then((r) => unwrapApiResponse<MealPlan[]>(r))
}

export function getMealPlanById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<MealPlan>(r))
}

export function createMealPlan(data: CreateMealPlanRequest) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: data,
  }).then((r) => unwrapApiResponse<string>(r))
}

export function updateMealPlan(id: string, data: CreateMealPlanRequest) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: data,
  }).then((r) => unwrapApiResponse<boolean>(r))
}

export function toggleMealPlan(id: string) {
  return apiRequest<unknown>({
    method: 'PATCH',
    path: `${basePath}/${id}/toggle`,
  }).then((r) => unwrapApiResponse<boolean>(r))
}
