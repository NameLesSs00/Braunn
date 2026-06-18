import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  LaundryTypeReadDto,
  LaundryTypeCreateDto,
  LaundryTypeUpdateDto,
} from '../../../models/Laundrymodels/LaundryType';

const basePath = 'laundry/types';

export function getLaundryTypes(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<LaundryTypeReadDto[]>(r)
  );
}

export function getLaundryTypeById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryTypeReadDto>(r)
  );
}

export function createLaundryType(payload: LaundryTypeCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryTypeReadDto>(r)
  );
}

export function updateLaundryType(id: number, payload: LaundryTypeUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryTypeReadDto>(r)
  );
}

export function deleteLaundryType(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  );
}
