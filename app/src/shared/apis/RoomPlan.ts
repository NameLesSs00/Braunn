import type { GetRoomPlanParams, RoomPlanResponse } from '../../models/RoomPlan'
import { apiRequest, unwrapApiResponse } from './apiClient'

const basePath = 'frontoffice/room-plan'

export function getRoomPlan(params: GetRoomPlanParams = {}, signal?: AbortSignal) {
  const query = new URLSearchParams()

  if (params.from) query.set('From', params.from)
  if (params.to) query.set('To', params.to)
  if (params.date) query.set('Date', params.date)
  if (params.roomTypeId) query.set('RoomTypeId', params.roomTypeId)
  if (params.floor) query.set('Floor', params.floor)
  if (params.roomStatus) query.set('RoomStatus', params.roomStatus)
  if (params.reservationStatus) query.set('ReservationStatus', params.reservationStatus)
  if (params.bookingType) query.set('BookingType', params.bookingType)

  const queryString = query.toString()
  return apiRequest<RoomPlanResponse>({
    method: 'GET',
    path: `${basePath}${queryString ? `?${queryString}` : ''}`,
    signal,
  }).then((response) => unwrapApiResponse<RoomPlanResponse>(response))
}
