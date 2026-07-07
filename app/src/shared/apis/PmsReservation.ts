import { PmsReservation, PmsReservationDetails, PmsCheckInByDate, PmsInHouseReservation, PmsReservationFolio } from '../../models/PmsReservation'
import { apiRequest, unwrapApiResponse } from './apiClient'

const basePath = 'pms/reservations'

export interface GetPmsReservationsParams {
  startDate: string
  endDate: string
}

export function getPmsReservations(params: GetPmsReservationsParams, signal?: AbortSignal) {
  const query = new URLSearchParams(params as any).toString()
  return apiRequest<any[]>({
    method: 'GET',
    path: `local/reservations/by-date?${query}`,
    signal
  }).then((r) => {
    const data = unwrapApiResponse<any[]>(r)
    return data.map((item) => ({
      ...item,
      guestName: item.guest?.fullName || '',
      channelName: item.bookingSource || null
    })) as PmsReservation[]
  })
}

export function getPmsReservationById(id: string, signal?: AbortSignal) {
  return apiRequest<PmsReservationDetails>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal
  }).then((r) => unwrapApiResponse<PmsReservationDetails>(r))
}

export function getPmsReservationFolio(id: string, signal?: AbortSignal) {
  return apiRequest<PmsReservationFolio>({
    method: 'GET',
    path: `${basePath}/${id}/folio`,
    signal
  }).then((r) => unwrapApiResponse<PmsReservationFolio>(r))
}

export interface PmsCheckInParams {
  reservationId: string
  roomNumber: string
  selectedServices: Array<{
    additionalServiceId: string
    quantity: number
  }>
  selectedDiscountIds: string[]
}

export function checkInPmsReservation(params: PmsCheckInParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `${basePath}/check-in`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}

export function getPmsCheckInsByDate(date: string, signal?: AbortSignal) {
  return apiRequest<PmsCheckInByDate[]>({
    method: 'GET',
    path: `${basePath}/check-ins/by-date?date=${date}`,
    signal
  }).then((r) => unwrapApiResponse<PmsCheckInByDate[]>(r))
}

export function getPmsInHouseReservations(signal?: AbortSignal) {
  return apiRequest<PmsInHouseReservation[]>({
    method: 'GET',
    path: `${basePath}/in-house`,
    signal
  }).then((r) => unwrapApiResponse<PmsInHouseReservation[]>(r))
}

export interface AddPmsReservationServiceParams {
  reservationId: string
  additionalServiceId: string
  quantity: number
  serviceDate: string
}

export function addPmsReservationService(id: string, params: AddPmsReservationServiceParams, signal?: AbortSignal) {
  return apiRequest<{ success: boolean; message: string }>({
    method: 'POST',
    path: `${basePath}/${id}/add-service`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<{ success: boolean; message: string }>(r))
}

