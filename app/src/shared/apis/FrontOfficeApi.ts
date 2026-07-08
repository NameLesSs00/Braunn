import { apiRequest, unwrapApiResponse } from './apiClient'

export interface PostChargeRequest {
  department?: string
  description?: string
  amount: number
  taxAmount: number
  externalReference?: string
  sourceSystem?: string
  paymentMode?: string
  paymentMethod?: string
  paymentAmount?: number
  paymentReference?: string
  paymentDate?: string
  cashierUserId?: string
  shiftId?: string
}

export async function postFrontOfficeCharge(
  reservationRoomId: string,
  payload: PostChargeRequest,
  signal?: AbortSignal
): Promise<void> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `frontoffice/in-house/${reservationRoomId}/post-charge`,
    body: payload,
    signal,
  })
  return unwrapApiResponse<void>(response)
}
