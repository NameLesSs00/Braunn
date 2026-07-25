import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  PreventiveMaintenancePlan,
  PreventiveMaintenancePlanListResponse,
  PreventiveMaintenanceRequest,
  PreventiveMaintenanceRequestListResponse,
  PreventiveMaintenancePlanPayload,
  PreventiveMaintenanceRequestPayload,
  PreventiveMaintenanceAssignPayload,
} from '../../models/PreventiveMaintenance'

const PLANS_PATH = 'preventive-maintenance'
const REQUESTS_PATH = 'preventive-maintenance-requests'

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, String(value))
  })
  const q = query.toString()
  return q ? `?${q}` : ''
}

export const preventiveMaintenanceApi = {
  fetchPlans: async (params?: Record<string, string | number | boolean | undefined>) => {
    const response = await apiRequest<unknown>({ method: 'GET', path: `${PLANS_PATH}${buildQuery(params ?? {})}` })
    return unwrapApiResponse<PreventiveMaintenancePlanListResponse>(response)
  },

  createPlan: async (payload: PreventiveMaintenancePlanPayload) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: PLANS_PATH, body: payload })
    return unwrapApiResponse<PreventiveMaintenancePlan>(response)
  },

  updatePlan: async (id: number | string, payload: PreventiveMaintenancePlanPayload) => {
    const response = await apiRequest<unknown>({ method: 'PUT', path: `${PLANS_PATH}/${id}`, body: payload })
    return unwrapApiResponse<PreventiveMaintenancePlan>(response)
  },

  activatePlan: async (id: number | string) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${PLANS_PATH}/${id}/activate` })
    return unwrapApiResponse<PreventiveMaintenancePlan>(response)
  },

  cancelPlan: async (id: number | string) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${PLANS_PATH}/${id}/cancel` })
    return unwrapApiResponse<PreventiveMaintenancePlan>(response)
  },

  fetchRequests: async (params?: Record<string, string | number | boolean | undefined>) => {
    const response = await apiRequest<unknown>({ method: 'GET', path: `${REQUESTS_PATH}${buildQuery(params ?? {})}` })
    return unwrapApiResponse<PreventiveMaintenanceRequestListResponse>(response)
  },

  startRequest: async (id: number | string) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${REQUESTS_PATH}/${id}/start` })
    return unwrapApiResponse<PreventiveMaintenanceRequest>(response)
  },

  completeRequest: async (id: number | string, payload: PreventiveMaintenanceRequestPayload) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${REQUESTS_PATH}/${id}/complete`, body: payload })
    return unwrapApiResponse<PreventiveMaintenanceRequest>(response)
  },

  assignRequest: async (id: number | string, payload: PreventiveMaintenanceAssignPayload) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${REQUESTS_PATH}/${id}/assign`, body: payload })
    return unwrapApiResponse<PreventiveMaintenanceRequest>(response)
  },

  reassignRequest: async (id: number | string, payload: PreventiveMaintenanceAssignPayload) => {
    const response = await apiRequest<unknown>({ method: 'POST', path: `${REQUESTS_PATH}/${id}/reassign`, body: payload })
    return unwrapApiResponse<PreventiveMaintenanceRequest>(response)
  },
}
