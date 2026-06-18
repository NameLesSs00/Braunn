import { apiRequest, unwrapApiResponse } from './apiClient'

const basePath = '/rt/ops'

export function postRTReservation(payload: any, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'POST', 
    path: `${basePath}/reservation`, 
    body: payload, 
    signal 
  }).then((r) => unwrapApiResponse<any>(r))
}

export function postRTOps(payload: any, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'POST', 
    path: `${basePath}`, 
    body: payload, 
    signal 
  }).then((r) => unwrapApiResponse<any>(r))
}
