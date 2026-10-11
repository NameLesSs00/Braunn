import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  CashPaymentDto,
  CashPaymentResponse,
  AdvancePaymentDto,
  AdvancePaymentResponse,
  MixedPaymentDto,
  MixedPaymentResponse,
} from '../../../models/Purchasemodels/PurchasingPayment';

const BASE_PATH = 'purchasing/payments';

export const purchasingPaymentsApi = {
  /**
   * Process a direct cash payment for an invoice
   */
  payCash: async (
    payload: CashPaymentDto,
    signal?: AbortSignal
  ): Promise<CashPaymentResponse> => {
    return unwrapApiResponse<CashPaymentResponse>(
      await apiRequest<CashPaymentResponse>({
        method: 'POST',
        path: `/${BASE_PATH}/cash`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Pay/reconcile an invoice using an existing advance balance
   */
  payAdvance: async (
    payload: AdvancePaymentDto,
    signal?: AbortSignal
  ): Promise<AdvancePaymentResponse> => {
    return unwrapApiResponse<AdvancePaymentResponse>(
      await apiRequest<AdvancePaymentResponse>({
        method: 'POST',
        path: `/${BASE_PATH}/advance`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Process a mixed payment combining advance, cash, and installment allocations
   */
  payMixed: async (
    payload: MixedPaymentDto,
    signal?: AbortSignal
  ): Promise<MixedPaymentResponse> => {
    return unwrapApiResponse<MixedPaymentResponse>(
      await apiRequest<MixedPaymentResponse>({
        method: 'POST',
        path: `/${BASE_PATH}/mixed`,
        body: payload,
        signal,
      })
    );
  },
};
