// ─── Stock Overview ───────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export const inventoryData: InventoryItem[] = [
  { id: '1', code: 'LND-001', name: 'Laundry Detergent', category: 'Detergents', unit: 'Litre', currentStock: 45, minLevel: 20, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '2', code: 'LND-002', name: 'Bleach', category: 'Chemicals', unit: 'Litre', currentStock: 8, minLevel: 20, status: 'Low Stock', lastUpdated: '12/22/2025' },
  { id: '3', code: 'LND-003', name: 'Laundry Detergent', category: 'Detergents', unit: 'Litre', currentStock: 45, minLevel: 20, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '4', code: 'LND-004', name: 'Stain Remover', category: 'Chemicals', unit: 'Litre', currentStock: 0, minLevel: 20, status: 'Out of Stock', lastUpdated: '12/22/2025' },
  { id: '5', code: 'LND-005', name: 'Fabric Softener', category: 'Detergents', unit: 'Litre', currentStock: 45, minLevel: 20, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '6', code: 'LND-006', name: 'Laundry Detergent', category: 'Detergents', unit: 'Litre', currentStock: 45, minLevel: 20, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '7', code: 'LND-007', name: 'Softener Pro', category: 'Detergents', unit: 'Litre', currentStock: 12, minLevel: 15, status: 'Low Stock', lastUpdated: '12/22/2025' },
  { id: '8', code: 'LND-008', name: 'Ironing Spray', category: 'Finishing', unit: 'Can', currentStock: 30, minLevel: 10, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '9', code: 'LND-009', name: 'Dry Clean Solvent', category: 'Chemicals', unit: 'Litre', currentStock: 5, minLevel: 10, status: 'Low Stock', lastUpdated: '12/22/2025' },
  { id: '10', code: 'LND-010', name: 'Colour Brightener', category: 'Finishing', unit: 'Kg', currentStock: 0, minLevel: 5, status: 'Out of Stock', lastUpdated: '12/22/2025' },
  { id: '11', code: 'LND-011', name: 'Anti-Static Spray', category: 'Finishing', unit: 'Can', currentStock: 22, minLevel: 8, status: 'In Stock', lastUpdated: '12/22/2025' },
  { id: '12', code: 'LND-012', name: 'Enzyme Cleaner', category: 'Detergents', unit: 'Litre', currentStock: 18, minLevel: 10, status: 'In Stock', lastUpdated: '12/22/2025' },
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
  { id: 't1', item: 'Heavy-Duty Detergent', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Clothes Washing' },
  { id: 't2', item: 'Fabric Softener', quantity: -3, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Clothes Washing' },
  { id: 't3', item: 'Fabric Softener', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Clothes Washing' },
  { id: 't4', item: 'Bleach', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Clothes Washing' },
  { id: 't5', item: 'Bleach', quantity: -1, actionType: 'withdraw', dateTime: '12/22/2025 3:00pm', staffName: 'Maria Garcia', reason: 'Clothes Washing' },
  { id: 't6', item: 'Laundry Detergent', quantity: -2, actionType: 'withdraw', dateTime: '12/21/2025 9:00am', staffName: 'Ahmed Sayed', reason: 'Delicate Wash' },
  { id: 't7', item: 'Stain Remover', quantity: -1, actionType: 'withdraw', dateTime: '12/21/2025 11:30am', staffName: 'Sara Ali', reason: 'Stain Treatment' },
  { id: 't8', item: 'Ironing Spray', quantity: -4, actionType: 'withdraw', dateTime: '12/21/2025 2:00pm', staffName: 'John Doe', reason: 'Guest Laundry' },
  { id: 't9', item: 'Laundry Detergent', quantity: 20, actionType: 'restock', dateTime: '12/20/2025 8:00am', staffName: 'Omar Hassan', reason: 'Weekly Restock' },
  { id: 't10', item: 'Bleach', quantity: 15, actionType: 'restock', dateTime: '12/20/2025 8:15am', staffName: 'Omar Hassan', reason: 'Weekly Restock' },
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
  { id: 'ls1', name: 'Fabric Softener', current: 27, minimum: 40, needed: 13, unit: 'bottles' },
  { id: 'ls2', name: 'Laundry Detergent', current: 18, minimum: 30, needed: 12, unit: 'bottles' },
  { id: 'ls3', name: 'Bleach', current: 12, minimum: 20, needed: 8, unit: 'bottles' },
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
  { id: 'pr1', itemName: 'Bleach - 1 Gallon', status: 'In Transit', quantity: '200 bottles', supplier: 'Chem Solutions, LLC', requestedBy: 'Omar Hassan', date: '06/22/2024' },
];
