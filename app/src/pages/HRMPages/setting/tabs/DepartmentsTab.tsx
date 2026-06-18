import { useState, useEffect, useRef } from 'react';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useSettingsContext } from '../SettingsContext';
import { AddDepartmentPopup } from '../popups/AddDepartmentPopup';
import { DeleteDepartmentPopup } from '../popups/DeleteDepartmentPopup';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { DepartmentReadDto } from '../../../../models/HRMmodels/Department';

export function DepartmentsTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { addTrigger, setActiveAction } = useSettingsContext();

  const { departments, totalCount, status, error } = useSelector(
    (state: RootState) => state.departments
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DepartmentReadDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentReadDto | null>(null);

  const prevTrigger = useRef(addTrigger);

  // Load departments on mount
  useEffect(() => {
    dispatch(fetchDepartments(undefined));
  }, [dispatch]);

  // Open "Add" popup when the header button is clicked
  useEffect(() => {
    if (addTrigger > prevTrigger.current) {
      openAdd();
    }
    prevTrigger.current = addTrigger;
  }, [addTrigger]);

  // ── helpers that also update the breadcrumb ──────────────────────────────

  const openAdd = () => {
    setActiveAction('Add Department');
    setAddOpen(true);
  };

  const closeAdd = () => {
    setActiveAction(null);
    setAddOpen(false);
  };

  const openEdit = (dept: DepartmentReadDto) => {
    setActiveAction('Edit Department');
    setEditTarget(dept);
  };

  const closeEdit = () => {
    setActiveAction(null);
    setEditTarget(null);
  };

  const openDelete = (dept: DepartmentReadDto) => {
    setActiveAction('Delete Department');
    setDeleteTarget(dept);
  };

  const closeDelete = () => {
    setActiveAction(null);
    setDeleteTarget(null);
  };

  // ────────────────────────────────────────────────────────────────────────

  const isLoading = status === 'loading';

  return (
    <div className="p-8">
      {/* Tab Header */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-[16px] font-bold text-slate-800">Manage Departments</h2>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[13px] font-semibold text-[#0B4EA2]">
          {totalCount}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && departments.length === 0 && (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && departments.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <Building2 className="h-10 w-10" />
          <p className="text-[14px]">No departments found.</p>
        </div>
      )}

      {/* Departments List */}
      <div className="space-y-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-slate-800">{dept.name}</h3>
                  {!dept.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-slate-500">
                  {dept.countemployee} {dept.countemployee === 1 ? 'employee' : 'employees'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 pr-4">
              <button
                onClick={() => openEdit(dept)}
                className="text-[14px] font-semibold text-[#0B4EA2] hover:text-[#093c80]"
              >
                Edit
              </button>
              <button
                onClick={() => openDelete(dept)}
                className="text-[14px] font-semibold text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Popup */}
      <AddDepartmentPopup
        open={addOpen}
        onClose={closeAdd}
        mode="add"
      />

      {/* Edit Department Popup */}
      {editTarget && (
        <AddDepartmentPopup
          open={!!editTarget}
          onClose={closeEdit}
          mode="edit"
          initialData={editTarget}
        />
      )}

      {/* Delete Department Popup */}
      {deleteTarget && (
        <DeleteDepartmentPopup
          open={!!deleteTarget}
          onClose={closeDelete}
          departmentId={deleteTarget.id}
          departmentName={deleteTarget.name}
        />
      )}
    </div>
  );
}
