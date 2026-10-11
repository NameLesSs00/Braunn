import { useEffect, useState, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchSuppliers,
  fetchSuppliersByDepartment,
} from '../../../features/Purchasefeatures/suppliers/suppliersSlice';
import type { Supplier, PurchasingDepartment } from '../../../models/Purchasemodels/Supplier';
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout';
import { ComingSoonPage } from '../../systems/components/ComingSoonPage';
import { features } from '../../../config/features';

import { SuppliersHeader } from './components/SuppliersHeader';
import {
  SuppliersFilters,
  type DepartmentFilterOption,
  type StatusFilterOption,
} from './components/SuppliersFilters';
import { SuppliersTable } from './components/SuppliersTable';
import { AddSupplierModal } from './components/AddSupplierModal';
import { EditSupplierModal } from './components/EditSupplierModal';
import { SupplierDetailsModal } from './components/SupplierDetailsModal';
import { DeleteSupplierModal } from './components/DeleteSupplierModal';

export function SuppliersPurchasePage() {
  const dispatch = useAppDispatch();
  const {
    suppliers,
    departmentSuppliers,
    totalCount,
    totalPages,
    status,
  } = useAppSelector((state) => state.suppliers);

  // Filter & Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilterOption>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Data fetching effect
  useEffect(() => {
    if (selectedDepartment === 'ALL') {
      dispatch(
        fetchSuppliers({
          pageNumber: page,
          pageSize: rowsPerPage,
        })
      );
    } else {
      dispatch(fetchSuppliersByDepartment(selectedDepartment as PurchasingDepartment));
    }
  }, [dispatch, page, rowsPerPage, selectedDepartment, refreshKey]);

  // Working list depending on department mode
  const currentList = useMemo(() => {
    return selectedDepartment === 'ALL' ? suppliers : departmentSuppliers;
  }, [selectedDepartment, suppliers, departmentSuppliers]);

  // Apply search and status filter locally if needed
  const displaySuppliers = useMemo(() => {
    let result = currentList;

    if (debouncedSearch) {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(debouncedSearch) ||
          s.email?.toLowerCase().includes(debouncedSearch) ||
          s.phone?.toLowerCase().includes(debouncedSearch) ||
          s.taxNumber?.toLowerCase().includes(debouncedSearch) ||
          s.address?.toLowerCase().includes(debouncedSearch)
      );
    }

    if (selectedStatus !== 'ALL') {
      const activeOnly = selectedStatus === 'Active';
      result = result.filter((s) => s.isActive === activeOnly);
    }

    return result;
  }, [currentList, debouncedSearch, selectedStatus]);

  const activeCount = useMemo(() => {
    return currentList.filter((s) => s.isActive).length;
  }, [currentList]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleDepartmentChange = (dept: DepartmentFilterOption) => {
    setSelectedDepartment(dept);
    setPage(1);
  };

  const handleStatusChange = (statusOption: StatusFilterOption) => {
    setSelectedStatus(statusOption);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setPage(1);
  };

  const isFiltered =
    !!searchTerm || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL';

  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Purchase - Suppliers"
        icon={<ShoppingCart />}
        accentColor="#EA580C"
      />
    );
  }

  const effectiveTotalCount =
    selectedDepartment === 'ALL' && !debouncedSearch && selectedStatus === 'ALL'
      ? totalCount
      : displaySuppliers.length;

  const effectiveTotalPages =
    selectedDepartment === 'ALL' && !debouncedSearch && selectedStatus === 'ALL'
      ? totalPages
      : Math.max(1, Math.ceil(displaySuppliers.length / rowsPerPage));

  // When filtering locally in by-department or search mode, paginate display slice
  const paginatedSuppliers = useMemo(() => {
    if (selectedDepartment === 'ALL' && !debouncedSearch && selectedStatus === 'ALL') {
      return displaySuppliers;
    }
    const startIndex = (page - 1) * rowsPerPage;
    return displaySuppliers.slice(startIndex, startIndex + rowsPerPage);
  }, [displaySuppliers, selectedDepartment, debouncedSearch, selectedStatus, page, rowsPerPage]);

  return (
    <PurchaseLayout>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header with Title & Add button */}
        <SuppliersHeader
          totalCount={effectiveTotalCount}
          activeCount={activeCount}
          onAddClick={() => setIsAddOpen(true)}
        />

        {/* Filter Toolbar */}
        <SuppliersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Suppliers Data Table */}
        <SuppliersTable
          suppliers={paginatedSuppliers}
          totalCount={effectiveTotalCount}
          totalPages={effectiveTotalPages}
          pageNumber={page}
          pageSize={rowsPerPage}
          isLoading={status === 'loading'}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onView={(supplier) => setViewingSupplier(supplier)}
          onEdit={(supplier) => setEditingSupplier(supplier)}
          onDelete={(supplier) => setDeletingSupplier(supplier)}
          onAddClick={() => setIsAddOpen(true)}
          isFiltered={isFiltered}
        />
      </div>

      {/* Modals */}
      <AddSupplierModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleRefresh}
      />

      <EditSupplierModal
        open={!!editingSupplier}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSuccess={handleRefresh}
      />

      <SupplierDetailsModal
        open={!!viewingSupplier}
        supplier={viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        onEdit={(supplier) => setEditingSupplier(supplier)}
      />

      <DeleteSupplierModal
        open={!!deletingSupplier}
        supplier={deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onSuccess={handleRefresh}
      />
    </PurchaseLayout>
  );
}
