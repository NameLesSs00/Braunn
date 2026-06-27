import { apiRequest, unwrapApiResponse } from './apiClient'
import type { Package, CreatePackagePayload, UpdatePackagePayload } from '../../models/Package'

export async function getPackages(signal?: AbortSignal): Promise<Package[]> {
  const response = await apiRequest<unknown>({ 
    method: 'GET', 
    path: '/local/packages', 
    signal 
  })
  return unwrapApiResponse<Package[]>(response)
}

export async function getPackageById(id: string, signal?: AbortSignal): Promise<Package> {
  const response = await apiRequest<unknown>({ 
    method: 'GET', 
    path: `/local/packages/${id}`, 
    signal 
  })
  return unwrapApiResponse<Package>(response)
}

export async function createPackage(payload: CreatePackagePayload, signal?: AbortSignal): Promise<Package> {
  const response = await apiRequest<unknown>({ 
    method: 'POST', 
    path: '/local/packages', 
    body: payload, 
    signal 
  })
  return unwrapApiResponse<Package>(response)
}

export async function updatePackage(id: string, payload: UpdatePackagePayload, signal?: AbortSignal): Promise<Package> {
  const response = await apiRequest<unknown>({ 
    method: 'PUT', 
    path: `/local/packages/${id}`, 
    body: payload, 
    signal 
  })
  return unwrapApiResponse<Package>(response)
}

export async function deletePackage(id: string, signal?: AbortSignal): Promise<void> {
  const response = await apiRequest<unknown>({ 
    method: 'DELETE', 
    path: `/local/packages/${id}`, 
    signal 
  })
  return unwrapApiResponse<void>(response)
}
