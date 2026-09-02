import { useState, useEffect, useRef } from 'react';
import { Briefcase, Trash2 } from 'lucide-react';
import { appAlert } from '../../../../shared/ui/AppAlert';
import { useSettingsContext } from '../SettingsContext';
import { AddPositionPopup } from '../popups/AddPositionPopup';
import { DeletePositionPopup } from '../popups/DeletePositionPopup';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchPositions,
  createPosition,
  updatePosition,
  deletePosition,
  clearPositionsError,
} from '../../../../features/HRMfeatures/positions/positionsSlice';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import type { PositionReadDto } from '../../../../models/HRMmodels/Position';

export function PositionsTab() {
  const dispatch = useAppDispatch();
  const { positions, status, error } = useAppSelector((state) => state.positions);
  const { departments } = useAppSelector((state) => state.departments);
  const { addTrigger } = useSettingsContext();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PositionReadDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PositionReadDto | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

  // Fetch positions on mount
  useEffect(() => {
    dispatch(fetchPositions({ PageNumber: 1, PageSize: 100 }));
    dispatch(fetchDepartments({ PageNumber: 1, PageSize: 100 }));
  }, [dispatch]);

  // Error Toast Notification
  useEffect(() => {
    if (status === 'failed' && error) {
      appAlert.fire({
        showConfirmButton: false,
        timer: 4000,
        icon: 'error',
        title: error,
      });
      dispatch(clearPositionsError());
    }
  }, [status, error, dispatch]);

  const prevTrigger = useRef(addTrigger);

  // Open "Add" popup when the header button is clicked
  useEffect(() => {
    if (addTrigger > prevTrigger.current) {
      setAddOpen(true);
    }
    prevTrigger.current = addTrigger;
  }, [addTrigger]);

  const filteredPositions = positions.filter(
    (p) => !selectedDepartmentId || p.departmentId === selectedDepartmentId
  );

  return (
    <div className="p-8">
      {/* Tab Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-slate-800">Job Positions</h2>
        
        {/* Department Filter */}
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[14px] text-slate-700 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
          value={selectedDepartmentId}
          onChange={(e) => setSelectedDepartmentId(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>
      </div>

      {/* Positions List */}
      <div className="space-y-3">
        {status === 'loading' && <p className="text-sm text-slate-500">Loading positions...</p>}
        {status === 'succeeded' && filteredPositions.length === 0 && (
          <p className="text-sm text-slate-500">No positions found.</p>
        )}
        {filteredPositions.map((position) => (
          <div
            key={position.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50">
                <Briefcase className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-800">{position.name}</h3>
                <p className="text-[13px] text-slate-500">{position.description}</p>
                {position.departmentName && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-medium text-slate-600">
                    {position.departmentName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditTarget(position)}
                className="text-[14px] font-semibold text-[#0B4EA2] hover:text-[#093c80]"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(position)}
                className="text-[14px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Position Popup */}
      <AddPositionPopup
        open={addOpen}
        departments={departments}
        initialData={selectedDepartmentId ? { name: '', description: '', departmentId: selectedDepartmentId } : undefined}
        onClose={() => setAddOpen(false)}
        mode="add"
        onSubmit={async (data) => {
          const result = await dispatch(createPosition(data));
          if (createPosition.fulfilled.match(result)) {
            appAlert.fire({
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'Position created successfully',
            });
          }
          setAddOpen(false);
        }}
      />

      {/* Edit Position Popup */}
      {editTarget && (
        <AddPositionPopup
          open={!!editTarget}
          departments={departments}
          onClose={() => setEditTarget(null)}
          mode="edit"
          initialData={{
            name: editTarget.name,
            description: editTarget.description,
            departmentId: editTarget.departmentId,
          }}
          onSubmit={async (data) => {
            const result = await dispatch(
              updatePosition({
                id: editTarget.id,
                payload: { ...data, isActive: editTarget.isActive },
              })
            );
            if (updatePosition.fulfilled.match(result)) {
              appAlert.fire({
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Position updated successfully',
              });
            }
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete Position Popup */}
      {deleteTarget && (
        <DeletePositionPopup
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          positionName={deleteTarget.name}
          onDelete={() => {
            dispatch(deletePosition(deleteTarget.id))
              .unwrap()
              .then(() => {
                appAlert.fire({
                  showConfirmButton: false,
                  timer: 3000,
                  icon: 'success',
                  title: 'Position deleted successfully',
                });
                setDeleteTarget(null);
              });
          }}
        />
      )}
    </div>
  );
}
