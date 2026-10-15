import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchaseCreateDto,
  LaundryPurchaseUpdateDto,
  LaundryPurchasesParams,
  LaundryPurchasesListDto,
} from '../../../models/Laundrymodels/LaundryPurchase'

const basePath = 'laundry/purchases'

function buildQuery(params?: LaundryPurchasesParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  const pageNum = params.PageNumber && params.PageNumber > 0 ? params.PageNumber : 1
  q.set('PageNumber', String(pageNum))
  const pageSize = params.PageSize && params.PageSize > 0 ? params.PageSize : 10
  q.set('PageSize', String(pageSize))

  if (params.Status && params.Status !== 'All' && params.Status !== 'ALL') {
    q.set('Status', params.Status)
  }
  if (params.FromDate) {
    q.set('FromDate', params.FromDate)
  }
  if (params.ToDate) {
    q.set('ToDate', params.ToDate)
  }
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getLaundryPurchases(
  params?: LaundryPurchasesParams,
  signal?: AbortSignal
): Promise<LaundryPurchasesListDto> {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}${buildQuery(params)}`,
    signal,
  }).then((r) => {
    const parsed = unwrapApiResponse<any>(r)
    const raw = parsed ?? {}
    const dataContainer = raw?.data ?? raw

    const rawItems = Array.isArray(dataContainer)
      ? dataContainer
      : Array.isArray(dataContainer?.items)
      ? dataContainer.items
      : Array.isArray(dataContainer?.Items)
      ? dataContainer.Items
      : []

    const totalCount = Number(
      dataContainer?.totalCount ??
        dataContainer?.TotalCount ??
        raw?.totalCount ??
        raw?.TotalCount ??
        rawItems.length
    )

    const pageNumber = Number(
      dataContainer?.pageNumber ?? dataContainer?.PageNumber ?? params?.PageNumber ?? 1
    )
    const pageSize = Number(
      dataContainer?.pageSize ?? dataContainer?.PageSize ?? params?.PageSize ?? 10
    )
    const totalPages = Number(
      dataContainer?.totalPages ??
        dataContainer?.TotalPages ??
        (Math.ceil(totalCount / pageSize) || 1)
    )
    const hasPreviousPage = Boolean(
      dataContainer?.hasPreviousPage ?? dataContainer?.HasPreviousPage
    )
    const hasNextPage = Boolean(dataContainer?.hasNextPage ?? dataContainer?.HasNextPage)

    const normalizedItems: LaundryPurchaseReadDto[] = rawItems.map((p: any) => {
      const lineItems = Array.isArray(p?.items)
        ? p.items
        : Array.isArray(p?.Items)
        ? p.Items
        : Array.isArray(p?.purchaseItems)
        ? p.purchaseItems
        : []

      return {
        ...p,
        id: Number(p?.id ?? 0),
        requiredDate: p?.requiredDate || p?.date || p?.createdAt || new Date().toISOString(),
        status: p?.status || 'Pending',
        items: lineItems.map((li: any) => ({
          id: li?.id,
          itemId: Number(li?.itemId ?? li?.id ?? 0),
          itemName: li?.itemName || li?.name || '',
          quantity: Number(li?.quantity ?? 1),
          priority: li?.priority || 'Normal',
        })),
        purchaseItems: lineItems,
        createdAt: p?.createdAt || new Date().toISOString(),
        createdBy: p?.createdBy || '',
        createdByName: p?.createdByName || '',
        updatedBy: p?.updatedBy,
        updatedByName: p?.updatedByName,
        updatedAt: p?.updatedAt,
        modifiedBy: p?.modifiedBy,
        modifiedByName: p?.modifiedByName,
        modifiedAt: p?.modifiedAt,
      }
    })

    return {
      items: normalizedItems,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    }
  })
}

export function getLaundryPurchaseById(
  id: number,
  signal?: AbortSignal
): Promise<LaundryPurchaseReadDto> {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => {
    const raw = unwrapApiResponse<any>(r)
    const p = raw?.data ?? raw
    const lineItems = Array.isArray(p?.items)
      ? p.items
      : Array.isArray(p?.Items)
      ? p.Items
      : Array.isArray(p?.purchaseItems)
      ? p.purchaseItems
      : []

    return {
      ...p,
      id: Number(p?.id ?? id),
      requiredDate: p?.requiredDate || p?.date || p?.createdAt || new Date().toISOString(),
      status: p?.status || 'Pending',
      items: lineItems.map((li: any) => ({
        id: li?.id,
        itemId: Number(li?.itemId ?? 0),
        itemName: li?.itemName || li?.name || '',
        quantity: Number(li?.quantity ?? 1),
        priority: li?.priority || 'Normal',
      })),
      purchaseItems: lineItems,
    }
  })
}

export function createLaundryPurchase(
  payload: LaundryPurchaseCreateDto,
  signal?: AbortSignal
): Promise<LaundryPurchaseReadDto> {
  const requestBody = {
    requiredDate: payload.requiredDate,
    items: payload.items.map((it) => ({
      itemId: it.itemId,
      quantity: it.quantity,
      priority: it.priority || 'Normal',
    })),
  }

  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: requestBody,
    signal,
  }).then((r) => unwrapApiResponse<LaundryPurchaseReadDto>(r))
}

export function updateLaundryPurchase(
  id: number,
  payload: LaundryPurchaseUpdateDto,
  signal?: AbortSignal
): Promise<LaundryPurchaseReadDto> {
  const requestBody = {
    requiredDate: payload.requiredDate,
    items: payload.items.map((it) => ({
      id: it.id,
      itemId: it.itemId,
      quantity: it.quantity,
      priority: it.priority || 'Normal',
    })),
  }

  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: requestBody,
    signal,
  }).then((r) => unwrapApiResponse<LaundryPurchaseReadDto>(r))
}

export function deleteLaundryPurchase(id: number, signal?: AbortSignal): Promise<void> {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}

export function changeLaundryPurchaseStatus(
  id: number,
  action: string,
  signal?: AbortSignal
): Promise<void> {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/status?action=${encodeURIComponent(action)}`,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}
