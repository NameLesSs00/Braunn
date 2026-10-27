import { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertCircle,
  ArrowRightLeft,
  Utensils,
  Wrench,
  Sparkles,
  Home,
  RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchRestaurantMaterials } from '../../../../features/restaurant/restaurantMaterialsSlice';
import { getLaundryInventoryItems } from '../../../../shared/Laundryshared/api/laundryInventoryItemsApi';
import { getHkmInventoryItems } from '../../../../shared/HKshared/api/hkmInventoryItemsApi';
import { getMaintenanceItems } from '../../../../shared/apis/maintenanceItemsApi';
import type {
  PurchasingInventoryItem,
  RestaurantMaterialRequest,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  UnifiedDepartmentRequest,
} from '../../../../models/Purchasemodels/InventoryTransfer';

import {
  MaterialSearchCombobox,
  CatalogItem,
  SelectedMaterialPayload,
} from './create/MaterialSearchCombobox';
import { TransferLineItemsTable, StagedTransferRow } from './create/TransferLineItemsTable';
import { RestaurantRequestSelector } from './create/RestaurantRequestSelector';
import { DepartmentRequestCardSelector } from './create/DepartmentRequestCardSelector';

interface CreateTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitRestaurant: (payload: CreateRestaurantTransferRequest) => Promise<void>;
  onSubmitAdHoc: (
    payload: CreateAdHocTransferRequest[],
    fulfilledRequisition?: { department: TargetDepartment; id: number; referenceCode?: string }
  ) => Promise<void>;
  purchasingInventory: PurchasingInventoryItem[];
  materialRequests: RestaurantMaterialRequest[];
  departmentRequests?: UnifiedDepartmentRequest[];
  initialSelectedRequest?: UnifiedDepartmentRequest | null;
  warehouses: Array<{ warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>;
  isSubmitting: boolean;
  fulfilledRequestIds?: Set<number>;
}

export type TargetDepartment = 'Restaurant' | 'Laundry' | 'Housekeeping' | 'Maintenance';

function matchInventoryItem(
  inventory: PurchasingInventoryItem[],
  dept: string,
  itemId?: number,
  itemName?: string
): PurchasingInventoryItem | undefined {
  const normDept = (dept || '').trim().toLowerCase();
  const normName = (itemName || '').trim().toLowerCase();
  return inventory.find((p) => {
    const pDept = (p.departmentType || '').trim().toLowerCase();
    if (pDept !== normDept) return false;
    if (itemId && p.itemId && p.itemId === itemId) return true;
    if (normName && p.itemName && p.itemName.trim().toLowerCase() === normName) return true;
    return false;
  });
}

export function CreateTransferModal({
  open,
  onClose,
  onSubmitRestaurant,
  onSubmitAdHoc,
  purchasingInventory,
  materialRequests,
  departmentRequests = [],
  initialSelectedRequest,
  warehouses,
  isSubmitting,
  fulfilledRequestIds,
}: CreateTransferModalProps) {
  // Target Department: 'Restaurant' | 'Laundry' | 'Housekeeping' | 'Maintenance'
  const [selectedDept, setSelectedDept] = useState<TargetDepartment>('Restaurant');

  // Mode: 'request' | 'direct'
  const [transferMode, setTransferMode] = useState<'request' | 'direct'>('request');

  // Restaurant specific state
  const [selectedRequestId, setSelectedRequestId] = useState<number | 'none'>('none');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(warehouses[0]?.warehouseId || 1);

  // Other Department specific request selection
  const [selectedDeptReqId, setSelectedDeptReqId] = useState<string | 'none'>('none');

  // Shared form state
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<StagedTransferRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Department catalog items for rich search across all 4 modules
  const dispatch = useAppDispatch();
  const restaurantMaterials = useAppSelector((state) => state.restaurantMaterials.items);
  const [laundryCatalog, setLaundryCatalog] = useState<CatalogItem[]>([]);
  const [hkCatalog, setHkCatalog] = useState<CatalogItem[]>([]);
  const [maintenanceCatalog, setMaintenanceCatalog] = useState<CatalogItem[]>([]);

  // Preload department catalogs when modal opens
  useEffect(() => {
    if (open) {
      if (restaurantMaterials.length === 0) {
        dispatch(fetchRestaurantMaterials());
      }

      const loadCatalogs = async () => {
        try {
          const [laundryRes, hkRes, maintRes] = await Promise.allSettled([
            getLaundryInventoryItems({ PageSize: 100 }),
            getHkmInventoryItems({ PageSize: 100 }),
            getMaintenanceItems({ pageSize: 100 }),
          ]);

          if (laundryRes.status === 'fulfilled' && laundryRes.value?.items) {
            setLaundryCatalog(
              laundryRes.value.items.map((i) => ({
                id: i.id,
                name: i.name,
                categoryName: i.categoryName,
                unitName: i.unitName,
                quantity: i.quantity ?? 0,
              }))
            );
          }

          if (hkRes.status === 'fulfilled' && hkRes.value?.items) {
            setHkCatalog(
              hkRes.value.items.map((i) => ({
                id: i.id,
                name: i.name,
                categoryName: i.categoryName,
                unitName: i.unitName,
                quantity: i.quantity ?? 0,
              }))
            );
          }

          if (maintRes.status === 'fulfilled' && maintRes.value?.items) {
            setMaintenanceCatalog(
              maintRes.value.items.map((i) => ({
                id: Number(i.id) || 0,
                name: i.name,
                categoryName: i.categoryName,
                code: i.code,
                quantity: i.quantity ?? 0,
              }))
            );
          }
        } catch (err) {
          console.error('Failed to preload department catalogs for transfer', err);
        }
      };

      loadCatalogs();
    }
  }, [open, restaurantMaterials.length, dispatch]);

  // Compute active department's catalog items
  const activeDepartmentCatalog = useMemo<CatalogItem[]>(() => {
    switch (selectedDept) {
      case 'Laundry':
        return laundryCatalog;
      case 'Housekeeping':
        return hkCatalog;
      case 'Maintenance':
        return maintenanceCatalog;
      case 'Restaurant':
      default:
        return restaurantMaterials.map((m) => ({
          id: m.id,
          name: m.name,
          unitName: m.unitName || m.unitSymbol,
        }));
    }
  }, [selectedDept, laundryCatalog, hkCatalog, maintenanceCatalog, restaurantMaterials]);

  // Reset form or populate from initialSelectedRequest when modal opens
  useEffect(() => {
    if (open) {
      setFormError(null);
      if (initialSelectedRequest) {
        setSelectedDept(initialSelectedRequest.department);
        setTransferMode('request');
        if (initialSelectedRequest.department === 'Restaurant') {
          setSelectedRequestId(initialSelectedRequest.id);
          setSelectedDeptReqId(String(initialSelectedRequest.id));
          const matchingReq = materialRequests.find((r) => r.id === initialSelectedRequest.id);
          if (matchingReq) {
            const matchingWh = warehouses.find((w) => w.restaurantId === matchingReq.restaurantId);
            if (matchingWh) {
              setSelectedWarehouseId(matchingWh.warehouseId);
            }
          }
        } else {
          setSelectedDeptReqId(String(initialSelectedRequest.id));
          setSelectedRequestId('none');
        }
        setNotes(`Fulfillment for ${initialSelectedRequest.referenceCode}`);

        const staged: StagedTransferRow[] = initialSelectedRequest.items.map((it) => {
          const invItem = matchInventoryItem(
            purchasingInventory,
            initialSelectedRequest.department,
            it.itemId,
            it.itemName
          );
          const catItem = activeDepartmentCatalog.find(
            (c) =>
              c.id === it.itemId ||
              (c.name && it.itemName && c.name.trim().toLowerCase() === it.itemName.trim().toLowerCase())
          );
          const isDeptRest = initialSelectedRequest.department === 'Restaurant';
          const stock =
            invItem?.quantity !== undefined
              ? Number(invItem.quantity)
              : Number(catItem?.quantity ?? 0);

          return {
            materialId: it.itemId || invItem?.itemId || 1,
            materialName: it.itemName,
            departmentType: initialSelectedRequest.department,
            availableStock: stock,
            requestedQuantity: it.quantity,
            transferredQuantity: Math.min(it.quantity, stock > 0 ? stock : it.quantity),
            unitId: isDeptRest ? (it.unitId || invItem?.unitId || 1) : 1,
            unitSymbol: isDeptRest ? (it.unitSymbol || invItem?.unitSymbol || 'Unit') : 'Amount',
          };
        });
        setRows(staged);
      } else {
        setSelectedDept('Restaurant');
        setTransferMode('request');
        setSelectedRequestId('none');
        setSelectedDeptReqId('none');
        setRows([]);
        setNotes('');
        if (warehouses.length > 0) {
          setSelectedWarehouseId(warehouses[0].warehouseId);
        }
      }
    }
  }, [open, initialSelectedRequest, warehouses, materialRequests, purchasingInventory, activeDepartmentCatalog]);

  // Ensure default warehouse when available
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].warehouseId);
    }
  }, [warehouses, selectedWarehouseId]);

  // When a Restaurant Material Request is selected, prefill matching warehouse and items
  useEffect(() => {
    if (selectedDept === 'Restaurant' && transferMode === 'request') {
      if (selectedRequestId === 'none') {
        setRows([]);
        return;
      }

      const req = materialRequests.find((r) => r.id === Number(selectedRequestId));
      if (req) {
        const matchingWh = warehouses.find((w) => w.restaurantId === req.restaurantId);
        if (matchingWh) {
          setSelectedWarehouseId(matchingWh.warehouseId);
        }

        const newRows: StagedTransferRow[] = req.items.map((it) => {
          const invItem = matchInventoryItem(purchasingInventory, 'Restaurant', it.materialId, it.materialName);
          const stock = invItem?.quantity !== undefined ? Number(invItem.quantity) : 0;
          return {
            materialId: it.materialId,
            materialName: it.materialName,
            departmentType: 'Restaurant',
            availableStock: stock,
            requestedQuantity: it.requestedQuantity,
            transferredQuantity: Math.min(it.requestedQuantity, stock > 0 ? stock : it.requestedQuantity),
            unitId: it.unitId,
            unitSymbol: it.unitSymbol || invItem?.unitSymbol || 'Unit',
          };
        });
        setRows(newRows);
      }
    }
  }, [selectedRequestId, selectedDept, transferMode, materialRequests, purchasingInventory, warehouses]);

  // When a Department Request (Laundry, Housekeeping, Maintenance) is selected
  useEffect(() => {
    if (selectedDept !== 'Restaurant' && transferMode === 'request') {
      if (selectedDeptReqId === 'none') {
        setRows([]);
        return;
      }

      const req = departmentRequests.find(
        (r) => r.department === selectedDept && String(r.id) === String(selectedDeptReqId)
      );

      if (req) {
        setNotes(`Fulfillment for ${req.referenceCode}`);
        const staged: StagedTransferRow[] = req.items.map((it) => {
          const invItem = matchInventoryItem(purchasingInventory, req.department, it.itemId, it.itemName);
          const catItem = activeDepartmentCatalog.find(
            (c) =>
              c.id === it.itemId ||
              (c.name && it.itemName && c.name.trim().toLowerCase() === it.itemName.trim().toLowerCase())
          );
          const stock =
            invItem?.quantity !== undefined
              ? Number(invItem.quantity)
              : Number(catItem?.quantity ?? 0);

          return {
            materialId: it.itemId || invItem?.itemId || 1,
            materialName: it.itemName,
            departmentType: req.department,
            availableStock: stock,
            requestedQuantity: it.quantity,
            transferredQuantity: Math.min(it.quantity, stock > 0 ? stock : it.quantity),
            unitId: 1,
            unitSymbol: 'Amount',
          };
        });
        setRows(staged);
      }
    }
  }, [selectedDeptReqId, selectedDept, transferMode, departmentRequests, purchasingInventory, activeDepartmentCatalog]);

  if (!open) return null;

  // Add material or department catalog item from Combobox
  const handleSelectMaterial = (item: SelectedMaterialPayload) => {
    setFormError(null);
    const targetDept = item.departmentType || selectedDept;
    const targetId = item.materialId || item.itemId || item.id || 1;
    const targetName = item.materialName || item.itemName || 'Item';

    const invMatch = matchInventoryItem(purchasingInventory, targetDept, targetId, targetName);
    const targetStock =
      invMatch?.quantity !== undefined
        ? Number(invMatch.quantity)
        : Number(item.availableStock ?? item.quantity ?? 0);

    const existingIndex = rows.findIndex(
      (r) => r.materialId === targetId && r.departmentType === targetDept
    );
    if (existingIndex >= 0) {
      setRows((prev) =>
        prev.map((r, idx) =>
          idx === existingIndex
            ? { ...r, transferredQuantity: r.transferredQuantity + 1 }
            : r
        )
      );
      return;
    }

    const isRest = targetDept === 'Restaurant';
    const newRow: StagedTransferRow = {
      materialId: targetId,
      materialName: targetName,
      departmentType: targetDept,
      availableStock: targetStock,
      transferredQuantity: 1,
      unitId: isRest ? (invMatch?.unitId || item.unitId || 1) : 1,
      unitSymbol: isRest ? (invMatch?.unitSymbol || item.unitSymbol || item.unitName || 'Unit') : 'Amount',
    };
    setRows((prev) => [newRow, ...prev]);
  };

  const handleUpdateQuantity = (materialId: number, newQty: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.materialId === materialId ? { ...r, transferredQuantity: newQty } : r
      )
    );
  };

  const handleRemoveRow = (materialId: number) => {
    setRows((prev) => prev.filter((r) => r.materialId !== materialId));
  };

  const handleResetForm = () => {
    setRows([]);
    setSelectedRequestId('none');
    setSelectedDeptReqId('none');
    setNotes('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (rows.length === 0) {
      setFormError('Please select at least one material to transfer.');
      return;
    }

    for (const r of rows) {
      if (r.transferredQuantity <= 0) {
        setFormError(
          `Transfer ${selectedDept === 'Restaurant' ? 'quantity' : 'amount'} for ${r.materialName} must be greater than zero.`
        );
        return;
      }
      if (selectedDept === 'Restaurant' && r.transferredQuantity > r.availableStock) {
        setFormError(
          `Cannot transfer ${r.transferredQuantity} ${r.unitSymbol} of ${r.materialName}. Only ${r.availableStock} ${r.unitSymbol} in central stock.`
        );
        return;
      }
    }

    try {
      if (selectedDept === 'Restaurant') {
        const payload: CreateRestaurantTransferRequest = {
          destinationWarehouseId: selectedWarehouseId,
          materialRequestId:
            transferMode === 'request' && selectedRequestId !== 'none'
              ? Number(selectedRequestId)
              : null,
          notes,
          items: rows.map((r) => ({
            materialId: r.materialId,
            requestedQuantity: r.requestedQuantity ?? r.transferredQuantity,
            requestedUnitId: r.unitId,
            transferredQuantity: r.transferredQuantity,
            transferredUnitId: r.unitId,
          })),
        };
        await onSubmitRestaurant(payload);
      } else {
        // Dispatches to Laundry, Housekeeping, or Maintenance
        const adHocPayloads: CreateAdHocTransferRequest[] = rows.map((r) => ({
          departmentType: selectedDept,
          itemId: r.materialId,
          quantity: r.transferredQuantity,
          notes,
        }));

        const fulfilledRequisition =
          transferMode === 'request' && selectedDeptReqId !== 'none'
            ? {
                department: selectedDept,
                id: Number(selectedDeptReqId),
                referenceCode:
                  departmentRequests.find(
                    (r) => r.department === selectedDept && String(r.id) === String(selectedDeptReqId)
                  )?.referenceCode || `#${selectedDept.substring(0, 3).toUpperCase()}-${selectedDeptReqId}`,
              }
            : undefined;

        await onSubmitAdHoc(adHocPayloads, fulfilledRequisition);
      }
      handleResetForm();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create transfer');
    }
  };

  // Get active pending requests for the selected department
  const currentDeptPendingRequests = departmentRequests.filter(
    (r) => r.department === selectedDept && r.status?.toLowerCase() === 'pending'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header - Cohesive Brand Blue Styling */}
        <div className="flex items-center justify-between border-b border-blue-900/20 px-6 py-4 bg-[#0B4EA2] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-2xs">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">New Inventory Transfer</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Dispatch stock from Central Storage to restaurant or department warehouses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Step 1: Destination Department Selection (4 Cards) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Destination Department:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Restaurant */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('Restaurant');
                  handleResetForm();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedDept === 'Restaurant'
                    ? 'border-[#0B4EA2] bg-blue-50/50 shadow-2xs ring-2 ring-[#0B4EA2]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-colors mb-1.5 ${
                    selectedDept === 'Restaurant'
                      ? 'bg-[#0B4EA2] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Utensils className="h-4 w-4" />
                </div>
                <p className="font-bold text-xs text-slate-900">Restaurant</p>
                <span className="text-[10px] text-slate-400 mt-0.5">Kitchens & Warehouses</span>
              </button>

              {/* Laundry */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('Laundry');
                  handleResetForm();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedDept === 'Laundry'
                    ? 'border-[#0B4EA2] bg-blue-50/50 shadow-2xs ring-2 ring-[#0B4EA2]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-colors mb-1.5 ${
                    selectedDept === 'Laundry'
                      ? 'bg-[#0B4EA2] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="font-bold text-xs text-slate-900">Laundry</p>
                <span className="text-[10px] text-slate-400 mt-0.5">Linens & Detergents</span>
              </button>

              {/* Housekeeping */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('Housekeeping');
                  handleResetForm();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedDept === 'Housekeeping'
                    ? 'border-[#0B4EA2] bg-blue-50/50 shadow-2xs ring-2 ring-[#0B4EA2]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-colors mb-1.5 ${
                    selectedDept === 'Housekeeping'
                      ? 'bg-[#0B4EA2] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Home className="h-4 w-4" />
                </div>
                <p className="font-bold text-xs text-slate-900">Housekeeping</p>
                <span className="text-[10px] text-slate-400 mt-0.5">Guest & Room Supplies</span>
              </button>

              {/* Maintenance */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('Maintenance');
                  handleResetForm();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  selectedDept === 'Maintenance'
                    ? 'border-[#0B4EA2] bg-blue-50/50 shadow-2xs ring-2 ring-[#0B4EA2]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl transition-colors mb-1.5 ${
                    selectedDept === 'Maintenance'
                      ? 'bg-[#0B4EA2] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                </div>
                <p className="font-bold text-xs text-slate-900">Maintenance</p>
                <span className="text-[10px] text-slate-400 mt-0.5">Parts & Hardware</span>
              </button>
            </div>
          </div>

          {/* Step 2: Mode Switcher (Fulfill Requisition vs Direct Dispatch) */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTransferMode('request');
                  setRows([]);
                }}
                className={`flex-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                  transferMode === 'request'
                    ? 'bg-white text-[#0B4EA2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fulfill {selectedDept} Requisition (
                {selectedDept === 'Restaurant'
                  ? materialRequests.filter((r) => r.status?.toLowerCase() === 'pending').length
                  : currentDeptPendingRequests.length}
                )
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferMode('direct');
                  setSelectedRequestId('none');
                  setSelectedDeptReqId('none');
                  setRows([]);
                }}
                className={`flex-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                  transferMode === 'direct'
                    ? 'bg-white text-[#0B4EA2] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Direct {selectedDept} Dispatch (Ad-Hoc)
              </button>
            </div>

            {/* Sub-section: Restaurant Requisition Selector */}
            {selectedDept === 'Restaurant' && transferMode === 'request' && (
              <RestaurantRequestSelector
                materialRequests={materialRequests}
                selectedRequestId={selectedRequestId}
                onSelectRequest={setSelectedRequestId}
                fulfilledRequestIds={fulfilledRequestIds}
              />
            )}

            {/* Sub-section: Laundry / Housekeeping / Maintenance Requisition Selector */}
            {selectedDept !== 'Restaurant' && transferMode === 'request' && (
              <DepartmentRequestCardSelector
                department={selectedDept}
                requests={departmentRequests}
                selectedRequestId={selectedDeptReqId}
                onSelectRequest={setSelectedDeptReqId}
              />
            )}

            {/* Destination Restaurant Warehouse dropdown */}
            {selectedDept === 'Restaurant' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Restaurant Warehouse:
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                  >
                    {warehouses.map((w) => (
                      <option key={w.warehouseId} value={w.warehouseId}>
                        {w.warehouseName} ({w.restaurantName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Material / Item Search (Visible when Direct Mode is active) */}
          {transferMode === 'direct' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Search & Select {selectedDept} Item to Dispatch:
              </label>
              <MaterialSearchCombobox
                inventory={purchasingInventory}
                departmentCatalog={activeDepartmentCatalog}
                selectedDept={selectedDept}
                selectedItemIds={rows.map((r) => r.materialId)}
                onSelectMaterial={handleSelectMaterial}
                placeholder={`Search ${selectedDept} catalog items or central storage...`}
              />
            </div>
          )}

          {/* Step 4: Staged Transfer Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Staged Transfer Items ({rows.length})
              </label>
              {rows.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>

            <TransferLineItemsTable
              rows={rows}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveRow={handleRemoveRow}
              isFulfillingRequest={transferMode === 'request'}
              isRestaurant={selectedDept === 'Restaurant'}
            />
          </div>

          {/* Step 5: Transfer Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Transfer Notes & Dispatch Instructions (Optional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via morning delivery run to 2nd floor pantry..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400">
              {rows.length > 0 ? (
                <span>
                  Ready to transfer <strong className="text-slate-700">{rows.length}</strong> items to{' '}
                  <strong className="text-[#0B4EA2]">{selectedDept}</strong>
                </span>
              ) : (
                'Select materials to enable transfer'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#093d7e] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Transferring...' : 'Confirm & Dispatch Transfer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTransferModal;
