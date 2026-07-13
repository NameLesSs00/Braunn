import {
  PmsReservation,
  PmsReservationDetails,
  PmsCheckInByDate,
  PmsInHouseReservation,
  PmsReservationFolio,
  ReservationPolicy,
  ReservationPolicyEvaluationResult,
  EvaluateLateCheckoutRequest,
  EvaluateLateCheckoutResponse,
  CompleteLateCheckoutRequest,
  EvaluateEarlyCheckoutRequest,
  EvaluateEarlyCheckoutResponse,
  CompleteEarlyCheckoutRequest,
  EvaluateExtendStayRequest,
  EvaluateExtendStayResponse,
  ExecuteExtendStayRequest,
  ExecuteExtendStayResponse,
  EvaluateRoomChangeRequest,
  EvaluateRoomChangeResponse,
  ChangeRoomRequest,
  ChangeRoomResponse,
  CancelReservationRequest,
  CancelReservationResult,
} from '../../models/PmsReservation'
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
      roomNumber: item.roomNumber || null,
      channelName: item.bookingSource || item.channelName || null
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

export type ReservationPaymentMethod = 'Card' | 'Cash' | 'Online'
export type ReservationPaymentType = 'Deposit' | 'Payment'

export interface CreateReservationPaymentParams {
  amount: number
  currency?: string | null
  paymentMethod: ReservationPaymentMethod
  paymentReference?: string | null
  paymentDate?: string | null
  paymentType: ReservationPaymentType
  method: ReservationPaymentMethod
  reference?: string | null
}

export function createReservationPayment(id: string, payload: CreateReservationPaymentParams, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `reservations/${id}/finance/payments`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function getActiveCancellationPolicies(signal?: AbortSignal) {
  const query = new URLSearchParams({
    policyType: 'Cancellation',
    isActive: 'true',
  }).toString()

  return apiRequest<ReservationPolicy[]>({
    method: 'GET',
    path: `admin/reservation-policies?${query}`,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicy[]>(r))
}

export interface CancellationEvaluationRequest {
  reservationId: string
  evaluationDateTime: string
}

export function evaluateCancellationPolicy(payload: CancellationEvaluationRequest, signal?: AbortSignal) {
  return apiRequest<ReservationPolicyEvaluationResult>({
    method: 'POST',
    path: 'reservation-policies/evaluate/cancellation',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ReservationPolicyEvaluationResult>(r))
}

export function evaluateLateCheckout(payload: EvaluateLateCheckoutRequest, signal?: AbortSignal) {
  return apiRequest<EvaluateLateCheckoutResponse>({
    method: 'POST',
    path: 'reservation-policies/evaluate/late-checkout',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<EvaluateLateCheckoutResponse>(r))
}

export function completeLateCheckout(reservationRoomId: string, payload: CompleteLateCheckoutRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `reservations/${reservationRoomId}/late-checkout`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function evaluateEarlyCheckout(payload: EvaluateEarlyCheckoutRequest, signal?: AbortSignal) {
  return apiRequest<EvaluateEarlyCheckoutResponse>({
    method: 'POST',
    path: 'reservation-policies/evaluate/early-checkout',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<EvaluateEarlyCheckoutResponse>(r))
}

export function completeEarlyCheckout(reservationRoomId: string, payload: CompleteEarlyCheckoutRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `reservations/${reservationRoomId}/early-checkout`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function evaluateExtendStay(payload: EvaluateExtendStayRequest, signal?: AbortSignal) {
  return apiRequest<EvaluateExtendStayResponse>({
    method: 'POST',
    path: 'reservation-policies/evaluate/extend-stay',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<EvaluateExtendStayResponse>(r))
}

export function executeExtendStay(reservationId: string, payload: ExecuteExtendStayRequest, signal?: AbortSignal) {
  return apiRequest<ExecuteExtendStayResponse>({
    method: 'POST',
    path: `reservations/${reservationId}/extend-stay`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ExecuteExtendStayResponse>(r))
}

export function evaluateRoomChange(payload: EvaluateRoomChangeRequest, signal?: AbortSignal) {
  return apiRequest<EvaluateRoomChangeResponse>({
    method: 'POST',
    path: 'reservation-policies/evaluate/room-change',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<EvaluateRoomChangeResponse>(r))
}

export function changeReservationRoom(reservationRoomId: string, payload: ChangeRoomRequest, signal?: AbortSignal) {
  return apiRequest<ChangeRoomResponse>({
    method: 'POST',
    path: `reservations/${reservationRoomId}/change-room`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<ChangeRoomResponse>(r))
}

export function cancelPmsReservation(id: string, payload: CancelReservationRequest, signal?: AbortSignal) {
  return apiRequest<CancelReservationResult>({
    method: 'POST',
    path: `reservations/${id}/cancel`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CancelReservationResult>(r))
}

export interface CheckOutPmsReservationParams {
  reservationId: string
}

export interface CheckOutPmsReservationResult {
  message?: string | null
  roomNumber?: string | null
  finalZeroBalance: boolean
  actualCheckOutTime: string
}

export function checkOutPmsReservation(params: CheckOutPmsReservationParams, signal?: AbortSignal) {
  return apiRequest<CheckOutPmsReservationResult>({
    method: 'POST',
    path: `${basePath}/check-out`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<CheckOutPmsReservationResult>(r))
}

export interface CheckOutReservationRoomParams {
  notes?: string | null
  checkedOutByUserId?: string | null
}

export function checkOutReservationRoom(reservationRoomId: string, payload: CheckOutReservationRoomParams, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `stay/reservation-rooms/${reservationRoomId}/check-out`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
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

