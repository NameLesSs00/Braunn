import { useEffect, useState } from 'react';
import { EmployeesHeader } from './components/EmployeesHeader';
import { EmployeesFilters, type EmployeesFiltersValue } from './components/EmployeesFilters';
import { EmployeesTable } from './components/EmployeesTable';
import { AddEmployeeForm } from './components/AddEmployeeForm';
import { EditEmployeeForm } from './components/EditEmployeeForm';
import { EmployeeDetailsView } from './components/EmployeeDetailsView';
import { TerminationDetailsModal } from './components/modals/TerminationDetailsModal';
import type { HREmployeeReadDto } from '../../../models/HRMmodels/HREmployee';
import { useAppDispatch } from '../../../store/hooks';
import { fetchHrEmployees } from '../../../features/HRMfeatures/employees/hrEmployeesSlice';

const INITIAL_FILTERS: EmployeesFiltersValue = {
  status: '',
  departmentId: '',
  positionId: '',
  searchTerm: '',
};

export function EmployeesHRMPage() {
  const dispatch = useAppDispatch();

  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<HREmployeeReadDto | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);

  // Single source of truth for list query (filters + pagination)
  const [filters, setFilters] = useState<EmployeesFiltersValue>(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce the search box; reset to page 1 together with the new term
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [filters.searchTerm]);

  useEffect(() => {
    dispatch(
      fetchHrEmployees({
        PageNumber: page,
        PageSize: pageSize,
        ...(filters.status ? { Status: filters.status } : {}),
        ...(filters.departmentId ? { DepartmentId: filters.departmentId } : {}),
        ...(filters.positionId ? { PositionId: filters.positionId } : {}),
        ...(debouncedSearch ? { SearchTerm: debouncedSearch } : {}),
      })
    );
  }, [dispatch, page, pageSize, filters.status, filters.departmentId, filters.positionId, debouncedSearch, refreshKey]);

  const handleFiltersChange = (next: EmployeesFiltersValue) => {
    // Dropdown changes reset to the first page immediately (search is handled by the debounce)
    if (
      filters.status !== next.status ||
      filters.departmentId !== next.departmentId ||
      filters.positionId !== next.positionId
    ) {
      setPage(1);
    }
    setFilters(next);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Refresh the list after returning from add/edit so changes are visible
  const closeAdd = () => {
    setIsAdding(false);
    setRefreshKey((k) => k + 1);
  };
  const closeEdit = () => {
    setEditingEmployee(null);
    setRefreshKey((k) => k + 1);
  };

  if (isAdding) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <AddEmployeeForm onCancel={closeAdd} />
      </div>
    );
  }

  if (editingEmployee) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <EditEmployeeForm employee={editingEmployee} onCancel={closeEdit} />
      </div>
    );
  }

  if (viewingEmployee && viewingEmployee.status !== 'Terminated') {
    return (
      <div className="max-w-[1600px] mx-auto">
        <EmployeeDetailsView 
          employee={viewingEmployee} 
          onBack={() => setViewingEmployee(null)} 
          onEdit={() => setEditingEmployee(viewingEmployee)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <EmployeesHeader onAdd={() => setIsAdding(true)} />
      <EmployeesFilters value={filters} onChange={handleFiltersChange} />
      <EmployeesTable 
        onView={(emp) => setViewingEmployee(emp)} 
        onEdit={(emp) => setEditingEmployee(emp)}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <TerminationDetailsModal
        open={viewingEmployee?.status === 'Terminated'}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee?.status === 'Terminated' ? viewingEmployee : null}
      />
    </div>
  );
}
