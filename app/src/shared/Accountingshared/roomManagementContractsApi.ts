import { apiRequest } from '../apis/apiClient'
import type {
  RoomManagementContract,
  CreateRoomManagementContractRequest,
  UpdateRoomManagementContractRequest,
} from '../../models/Accounting/roomManagementContract'

export async function getRoomManagementContractById(id: string, signal?: AbortSignal) {
  return apiRequest<RoomManagementContract>({
    method: 'GET',
    path: `/api/pms/room-management-contracts/${id}`,
    signal,
  })
}

export async function getManagementContractsByRoomId(roomId: string, signal?: AbortSignal) {
  return apiRequest<RoomManagementContract[]>({
    method: 'GET',
    path: `/api/rooms/${roomId}/management-contracts`,
    signal,
  })
}

export async function getActiveManagementContractByRoomId(roomId: string, date: string, signal?: AbortSignal) {
  return apiRequest<RoomManagementContract>({
    method: 'GET',
    path: `/api/rooms/${roomId}/management-contracts/active?date=${date}`,
    signal,
  })
}

export async function createRoomManagementContract(payload: CreateRoomManagementContractRequest, signal?: AbortSignal) {
  return apiRequest<RoomManagementContract>({
    method: 'POST',
    path: '/api/pms/room-management-contracts',
    body: payload,
    signal,
  })
}

export async function updateRoomManagementContract(id: string, payload: UpdateRoomManagementContractRequest, signal?: AbortSignal) {
  return apiRequest<RoomManagementContract>({
    method: 'PUT',
    path: `/api/pms/room-management-contracts/${id}`,
    body: payload,
    signal,
  })
}
