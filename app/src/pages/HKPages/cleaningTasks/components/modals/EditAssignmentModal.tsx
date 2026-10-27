import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import { useAppDispatch } from '../../../../../store/hooks';
import { updateHkmReceptionAssignment } from '../../../../../features/HKfeatures/hkmReceptionAssignments/hkmReceptionAssignmentsSlice';
import { hrEmployeesApi } from '../../../../../shared/HRMshared/api/hrEmployeesApi';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';
import type { HkmReceptionAssignmentReadDto } from '../../../../../models/HKmodels/HkmReceptionAssignment';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: HkmReceptionAssignmentReadDto | null;
  roomNumber?: string;
  onSuccess?: () => void;
}

export function EditAssignmentModal({
  isOpen,
  onClose,
  assignment,
  roomNumber,
  onSuccess,
}: EditAssignmentModalProps) {
  const dispatch = useAppDispatch();

  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeesResult, setEmployeesResult] = useState<HREmployeeReadDto[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<HREmployeeReadDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && assignment) {
      setNote(assignment.note || '');
      setSearchQuery('');
      setEmployeesResult([]);
      setSelectedEmployee(null);
      setSearchError('');
    }
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  const handleSearchEmployee = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setEmployeesResult([]);

    try {
      const response = (await hrEmployeesApi.fetchEmployees({
        SearchTerm: searchQuery.trim(),
        PageSize: 50,
      })) as any;
      if (response && response.items && response.items.length > 0) {
        setEmployeesResult(response.items);
      } else {
        setSearchError('No employees found matching query');
      }
    } catch (e: any) {
      setSearchError(e.message || 'Error searching employee');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const targetEmployeeId = selectedEmployee ? selectedEmployee.id : assignment.employeeId;
      await dispatch(
        updateHkmReceptionAssignment({
          id: assignment.id,
          payload: {
            roomId: assignment.roomId,
            employeeId: targetEmployeeId,
            note: note.trim(),
          },
        })
      ).unwrap();

      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error('Failed to update assignment:', e);
      alert(e.message || 'Failed to update assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Edit Cleaning Assignment #{assignment.id}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Room {roomNumber || assignment.roomId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Reassign Employee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Reassign Staff Member (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search staff by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchEmployee()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              />
              <button
                type="button"
                onClick={handleSearchEmployee}
                disabled={isSearching}
                className="px-3.5 py-2 bg-[#0B4EA2] text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearching ? '...' : <FiSearch className="h-4 w-4" />}
              </button>
            </div>

            {searchError && <p className="text-xs text-red-500 mt-1">{searchError}</p>}

            {/* Selected staff preview */}
            {selectedEmployee ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 mt-2">
                <div className="flex items-center gap-2">
                  <FiUser className="h-4 w-4 text-[#0B4EA2]" />
                  <span className="text-xs font-bold text-slate-800">
                    {selectedEmployee.fullName || selectedEmployee.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-[11px] text-red-600 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Current staff ID: {assignment.employeeId} (Search above to change)
              </p>
            )}

            {/* Search results list */}
            {employeesResult.length > 0 && !selectedEmployee && (
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs mt-2">
                {employeesResult.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setEmployeesResult([]);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">
                      {emp.fullName || emp.id}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Cleaning Note / Instructions</label>
            <textarea
              rows={3}
              placeholder="e.g. Needs deep sanitization, replace linen..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B4EA2] hover:bg-blue-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
