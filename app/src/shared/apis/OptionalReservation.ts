import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  OptionalReservationListItem,
  OptionalReservationListResponse,
  OptionalReservationDetail,
  OptionalReservationFilters,
  CreateOptionalReservationRequest,
  UpdateOptionalReservationRequest,
  ExtendExpiryRequest,
  DeleteOptionalReservationRequest,
  ConvertOptionalReservationRequest,
  ConversionPreviewResponse,
} from '../../models/OptionalReservation'

const basePath = 'optional-reservations'

function buildQuery(filters: OptionalReservationFilters): string {
  const params = new URLSearchParams()
  if (filters.Status) params.set('Status', filters.Status)
  if (filters.BookingSource) params.set('BookingSource', filters.BookingSource)
  if (filters.RoomTypeId) params.set('RoomTypeId', filters.RoomTypeId)
  if (filters.CheckInFrom) params.set('CheckInFrom', filters.CheckInFrom)
  if (filters.CheckInTo) params.set('CheckInTo', filters.CheckInTo)
  if (filters.CheckOutFrom) params.set('CheckOutFrom', filters.CheckOutFrom)
  if (filters.CheckOutTo) params.set('CheckOutTo', filters.CheckOutTo)
  if (filters.ExpiresFrom) params.set('ExpiresFrom', filters.ExpiresFrom)
  if (filters.ExpiresTo) params.set('ExpiresTo', filters.ExpiresTo)
  if (filters.OnlyExpired !== undefined) params.set('OnlyExpired', String(filters.OnlyExpired))
  if (filters.Page !== undefined) params.set('Page', String(filters.Page))
  if (filters.PageSize !== undefined) params.set('PageSize', String(filters.PageSize))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/** GET /api/optional-reservations — paginated list with optional filters */
export function getOptionalReservationsList(
  filters: OptionalReservationFilters = {},
  signal?: AbortSignal
): Promise<OptionalReservationListResponse> {
  return apiRequest<unknown>({
    method: 'GET',
    path: buildQuery(filters),
    signal,
  }).then((r) => unwrapApiResponse<OptionalReservationListResponse>(r))
}

/** GET /api/optional-reservations/{id} — full detail */
export function getOptionalReservationById(
  id: string,
  signal?: AbortSignal
): Promise<OptionalReservationDetail> {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<OptionalReservationDetail>(r))
}

/** POST /api/optional-reservations — create */
export function createOptionalReservation(
  data: CreateOptionalReservationRequest
): Promise<OptionalReservationListItem> {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: data,
  }).then((r) => unwrapApiResponse<OptionalReservationListItem>(r))
}

/** PUT /api/optional-reservations/{id} — update */
export function updateOptionalReservation(
  id: string,
  data: UpdateOptionalReservationRequest
): Promise<OptionalReservationDetail> {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: data,
  }).then((r) => unwrapApiResponse<OptionalReservationDetail>(r))
}

/** DELETE /api/optional-reservations/{id} */
export function deleteOptionalReservation(
  id: string,
  body: DeleteOptionalReservationRequest
): Promise<void> {
  return apiRequest<unknown>({
    method: 'DELETE',
    path: `${basePath}/${id}`,
    body,
  }).then(() => undefined)
}

/** POST /api/optional-reservations/{id}/extend-expiry */
export function extendOptionalReservationExpiry(
  id: string,
  data: ExtendExpiryRequest
): Promise<void> {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/extend-expiry`,
    body: data,
  }).then(() => undefined)
}

// ── Legacy aliases kept for backwards compat ──────────────────────────────────
export const getOptionalReservations = (signal?: AbortSignal) =>
  getOptionalReservationsList({}, signal).then((r) => r.items)

export const confirmOptionalReservation = (id: string) =>
  apiRequest<unknown>({ method: 'POST', path: `${basePath}/${id}/confirm` }).then(() => undefined)

/** POST /api/optional-reservations/{id}/conversion-preview */
export function previewOptionalReservationConversion(
  id: string,
  data: ConvertOptionalReservationRequest
): Promise<ConversionPreviewResponse> {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/conversion-preview`,
    body: data,
  }).then((r) => unwrapApiResponse<ConversionPreviewResponse>(r))
}

/** POST /api/optional-reservations/{id}/convert */
export function convertOptionalReservation(
  id: string,
  data: ConvertOptionalReservationRequest
): Promise<void> {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/convert`,
    body: data,
  }).then(() => undefined)
}
