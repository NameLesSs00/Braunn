// ─── Stock Overview ───────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minLevel: number;
  maxLevel: number;
  status: 'normal' | 'low';
  lastUpdated: string;
}

export const inventoryData: InventoryItem[] = [
  { id: '1', code: 'HK-001', name: 'Glass Cleaner', category: 'Cleaning Supplies', unit: 'Bottle', currentStock: 45, minLevel: 20, maxLevel: 100, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '2', code: 'HK-002', name: 'Multi-surface Cleaner', category: 'Cleaning Supplies', unit: 'Bottle', currentStock: 8, minLevel: 20, maxLevel: 100, status: 'low', lastUpdated: '12/22/2025' },
  { id: '3', code: 'HK-003', name: 'Glass Cleaner', category: 'Cleaning Supplies', unit: 'Bottle', currentStock: 45, minLevel: 20, maxLevel: 100, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '4', code: 'HK-004', name: 'Bath Towels', category: 'Linens', unit: 'Piece', currentStock: 0, minLevel: 50, maxLevel: 300, status: 'low', lastUpdated: '12/22/2025' },
  { id: '5', code: 'HK-005', name: 'Bed Sheets', category: 'Linens', unit: 'Piece', currentStock: 120, minLevel: 30, maxLevel: 200, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '6', code: 'HK-006', name: 'Glass Cleaner', category: 'Cleaning Supplies', unit: 'Bottle', currentStock: 45, minLevel: 20, maxLevel: 100, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '7', code: 'HK-007', name: 'Pillow Cases', category: 'Linens', unit: 'Piece', currentStock: 12, minLevel: 40, maxLevel: 150, status: 'low', lastUpdated: '12/22/2025' },
  { id: '8', code: 'HK-008', name: 'Toilet Paper', category: 'Amenities', unit: 'Roll', currentStock: 300, minLevel: 100, maxLevel: 500, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '9', code: 'HK-009', name: 'Floor Cleaner', category: 'Cleaning Supplies', unit: 'Bottle', currentStock: 5, minLevel: 15, maxLevel: 50, status: 'low', lastUpdated: '12/22/2025' },
  { id: '10', code: 'HK-010', name: 'Hand Soap', category: 'Amenities', unit: 'Bottle', currentStock: 0, minLevel: 50, maxLevel: 200, status: 'low', lastUpdated: '12/22/2025' },
  { id: '11', code: 'HK-011', name: 'Trash Bags', category: 'Cleaning Supplies', unit: 'Roll', currentStock: 22, minLevel: 10, maxLevel: 100, status: 'normal', lastUpdated: '12/22/2025' },
  { id: '12', code: 'HK-012', name: 'Shampoo Bottles', category: 'Amenities', unit: 'Bottle', currentStock: 180, minLevel: 100, maxLevel: 400, status: 'normal', lastUpdated: '12/22/2025' },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export type TransactionActionType = 'withdraw' | 'restock';

export interface WithdrawTransaction {
  id: string;
  item: string;
  quantity: number; // negative = withdrawn, positive = restocked
  actionType: TransactionActionType;
  dateTime: string;
  staffName: string;
  reason: string;
}

export const transactionsData: WithdrawTransaction[] = [
  { id: 't1', item: 'Glass Cleaner', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Room Cleaning' },
  { id: 't2', item: 'Bed Sheets', quantity: -3, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Room Cleaning' },
  { id: 't3', item: 'Bed Sheets', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Room Cleaning' },
  { id: 't4', item: 'Multi-surface Cleaner', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Deep Clean' },
  { id: 't5', item: 'Multi-surface Cleaner', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Deep Clean' },
  { id: 't6', item: 'Glass Cleaner', quantity: -2, actionType: 'withdraw', dateTime: '12/21/2025 9:00am', staffName: 'Ahmed Sayed', reason: 'Room Cleaning' },
  { id: 't7', item: 'Bath Towels', quantity: -1, actionType: 'withdraw', dateTime: '12/21/2025 11:30am', staffName: 'Sara Ali', reason: 'Room Prep' },
  { id: 't8', item: 'Toilet Paper', quantity: -4, actionType: 'withdraw', dateTime: '12/21/2025 2:00pm', staffName: 'John Doe', reason: 'Room Restock' },
  { id: 't9', item: 'Glass Cleaner', quantity: 20, actionType: 'restock', dateTime: '12/20/2025 8:00am', staffName: 'Omar Hassan', reason: 'Weekly Restock' },
  { id: 't10', item: 'Multi-surface Cleaner', quantity: 15, actionType: 'restock', dateTime: '12/20/2025 8:15am', staffName: 'Omar Hassan', reason: 'Weekly Restock' },
];

// ─── Low Stock ────────────────────────────────────────────────────────────────
export interface LowStockItem {
  id: string;
  name: string;
  current: number;
  minimum: number;
  needed: number;
  unit: string;
}

export const lowStockData: LowStockItem[] = [
  { id: 'ls1', name: 'Bed Sheets', current: 27, minimum: 40, needed: 13, unit: 'pieces' },
  { id: 'ls2', name: 'Glass Cleaner', current: 18, minimum: 30, needed: 12, unit: 'bottles' },
  { id: 'ls3', name: 'Multi-surface Cleaner', current: 12, minimum: 20, needed: 8, unit: 'bottles' },
];

// ─── Purchase Requests ────────────────────────────────────────────────────────
export type PurchaseRequestStatus = 'In Transit' | 'Pending' | 'Received' | 'Cancelled';

export interface PurchaseRequest {
  id: string;
  itemName: string;
  status: PurchaseRequestStatus;
  quantity: string;
  supplier: string;
  requestedBy: string;
  date: string;
}

export const purchaseRequestsData: PurchaseRequest[] = [
  { id: 'pr1', itemName: 'Multi-surface Cleaner - 1 Gallon', status: 'In Transit', quantity: '200 bottles', supplier: 'Chem Solutions, LLC', requestedBy: 'Omar Hassan', date: '06/22/2024' },
];
