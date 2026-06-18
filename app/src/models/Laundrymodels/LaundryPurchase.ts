export interface LaundryPurchaseItemDto {
  id?: number;
  itemId: number;
  itemName?: string;
  purchaseId?: number;
  quantity: number;
}

export interface LaundryPurchaseReadDto {
  id: number;
  supplierName: string;
  createdAt: string;
  createdBy: string;
  purchaseItems: LaundryPurchaseItemDto[];
}

export interface LaundryPurchaseCreateDto {
  supplierName: string;
  purchaseItems: Pick<LaundryPurchaseItemDto, 'itemId' | 'quantity'>[];
}

export interface LaundryPurchaseUpdateDto {
  supplierName: string;
  purchaseItems: Pick<LaundryPurchaseItemDto, 'itemId' | 'quantity'>[];
}

export interface LaundryPurchasesParams {
  PageNumber?: number;
  PageSize?: number;
  SupplierName?: string;
  Date?: string;
}

export interface LaundryPurchasesListDto {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: LaundryPurchaseReadDto[];
}
