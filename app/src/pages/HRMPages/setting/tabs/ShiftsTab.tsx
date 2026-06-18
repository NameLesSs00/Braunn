import { useState, useEffect, useRef } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettingsContext } from '../SettingsContext';
import { AddShiftPopup } from '../popups/AddShiftPopup';
import { DeleteShiftPopup } from '../popups/DeleteShiftPopup';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchHrShifts, createHrShift, updateHrShift, deleteHrShift, clearHrShiftsError } from '../../../../features/HRMfeatures/shifts/hrShiftsSlice';
import type { ShiftReadDto } from '../../../../models/HRMmodels/Shift';

export function ShiftsTab() {
  const dispatch = useAppDispatch();
  const { shifts, status, error } = useAppSelector((state) => state.hrShifts);
  const { addTrigger } = useSettingsContext();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftReadDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShiftReadDto | null>(null);

  // Fetch shifts on mount
  useEffect(() => {
    dispatch(fetchHrShifts());
  }, [dispatch]);

  // Error Toast Notification
  useEffect(() => {
    if (status === 'failed' && error) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        icon: 'error',
        title: error,
      });
      dispatch(clearHrShiftsError());
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

  return (
    <div className="p-8">
      {/* Tab Header */}
      <h2 className="mb-6 text-[16px] font-bold text-slate-800">Shift Templates</h2>

      {/* Shifts List */}
      <div className="space-y-3">
        {status === 'loading' && <p className="text-sm text-slate-500">Loading shifts...</p>}
        {status === 'succeeded' && shifts.length === 0 && <p className="text-sm text-slate-500">No shifts found.</p>}
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-800">{shift.name}</h3>
                <p className="text-[13px] text-slate-500">{shift.startTime} - {shift.endTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditTarget(shift)}
                className="text-[14px] font-semibold text-[#0B4EA2] hover:text-[#093c80]"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(shift)}
                className="text-[14px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Shift Popup */}
      <AddShiftPopup
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="add"
        onSubmit={async (data) => {
          await dispatch(createHrShift(data));
          setAddOpen(false);
        }}
      />

      {/* Edit Shift Popup */}
      {editTarget && (
        <AddShiftPopup
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          mode="edit"
          initialData={{
            name: editTarget.name,
            startTime: editTarget.startTime,
            endTime: editTarget.endTime,
          }}
          onSubmit={async (data) => {
            await dispatch(updateHrShift({ id: editTarget.id, payload: data }));
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete Shift Popup */}
      {deleteTarget && (
        <DeleteShiftPopup
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          shiftName={deleteTarget.name}
          onDelete={() => {
            dispatch(deleteHrShift(deleteTarget.id)).unwrap().then(() => {
              Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Shift deleted successfully',
              });
              setDeleteTarget(null);
            });
          }}
        />
      )}
    </div>
  );
}
