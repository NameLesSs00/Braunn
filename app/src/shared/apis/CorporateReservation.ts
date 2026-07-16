import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  CreateCorporateReservationV2Request,
  CreateCorporateReservationV2Response,
} from '../../models/CorporateReservation'

const basePath = '/corporate-reservations/v2'

export function createCorporateReservationV2(
  payload: CreateCorporateReservationV2Request,
  signal?: AbortSignal,
) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<CreateCorporateReservationV2Response>(r),
  )
}
