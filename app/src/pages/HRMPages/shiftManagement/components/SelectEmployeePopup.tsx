import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { fetchHrEmployees } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import { fetchShiftAssignments } from '../../../../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice';
import { resolveMediaUrl } from '../../../../shared/utils/resolveMediaUrl';

type Props = {
  open: boolean;
  onClose: () => void;
  onNext: (selected: HREmployeeReadDto[]) => void;
  onTransferClick?: (employee: HREmployeeReadDto) => void;
};

export function SelectEmployeePopup({ open, onClose, onNext, onTransferClick }: Props) {
  const dispatch = useAppDispatch();
  const { employees: allEmployees, status: empStatus } = useAppSelector(state => state.hrEmployees);
  const { departments } = useAppSelector(state => state.departments);
  const { items: assignments } = useAppSelector(state => state.shiftAssignments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState('');

  // Fetch employees, departments, and assignments when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchHrEmployees({ PageSize: 100, PageNumber: 1 }));
      dispatch(fetchDepartments(undefined));
      dispatch(fetchShiftAssignments(undefined));
    }
  }, [open, dispatch]);

  // Filtered employees based on department selection
  const filteredEmployees = deptFilter
    ? allEmployees.filter((e: HREmployeeReadDto) => e.departmentId === deptFilter)
    : allEmployees;

  const allSelected = filteredEmployees.length > 0 && filteredEmployees.every((e: HREmployeeReadDto) => selectedIds.includes(e.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredEmployees.find((e: HREmployeeReadDto) => e.id === id)));
    } else {
      const newIds = filteredEmployees.map((e: HREmployeeReadDto) => e.id);
      setSelectedIds(prev => [...new Set([...prev, ...newIds])]);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  const handleNext = () => {
    const selected = allEmployees.filter((e: HREmployeeReadDto) => selectedIds.includes(e.id));
    onNext(selected);
    setSelectedIds([]);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-- --';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-- --';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarContent = (emp: HREmployeeReadDto) => {
    const initial = emp.fullName?.charAt(0)?.toUpperCase() ?? '?';
    return (
      <div className="relative h-9 w-9 shrink-0">
        {/* Initial letter — always rendered as fallback underneath */}
        <div className="absolute inset-0 grid place-items-center rounded-full text-[12px] font-bold text-white bg-[#0B4EA2]">
          {initial}
        </div>
        {/* Photo overlays the initial; hides itself on load error without touching siblings */}
        {emp.imageUrl && (
          <img
            src={resolveMediaUrl(emp.imageUrl)}
            alt={emp.fullName}
            className="absolute inset-0 h-9 w-9 rounded-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="flex w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <h2 className="text-xl font-semibold text-white">Select employee</h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          {/* Date Navigator (UI only) */}
          <div className="flex items-center gap-3">
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[14px] font-semibold text-slate-800">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-[#0B4EA2] px-4 py-1.5 text-[13px] font-semibold text-[#0B4EA2] transition-colors hover:bg-blue-50">
              Today
            </button>
          </div>

          {/* Department Filter (from backend) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-8 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {empStatus === 'loading' ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-[14px]">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-[14px]">No employees found.</div>
          ) : (
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '48px' }} />
                <col style={{ width: '220px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '64px' }} />
              </colgroup>
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="w-12 px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 accent-[#0B4EA2]"
                    />
                  </th>
                  {['Employee', 'Position', 'Status', 'Shift', 'Check In', 'Check Out', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-4 text-left text-[12px] font-bold text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp: HREmployeeReadDto) => {
                  const isSelected = selectedIds.includes(emp.id);
                  const assignment = assignments.find(a => a.employeeId === emp.id);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => toggle(emp.id)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isSelected ? 'border-l-4 border-l-[#0B4EA2] bg-blue-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(emp.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-300 accent-[#0B4EA2]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {getAvatarContent(emp)}
                          <div>
                            <div className="text-[13px] font-bold text-slate-800">{emp.fullName}</div>
                            <div className="text-[11px] text-slate-400">{emp.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-600">{emp.positionName}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          assignment ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {assignment ? 'Assigned' : 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-600">
                        {assignment ? assignment.shiftName : '--'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[13px] font-semibold ${assignment ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {assignment ? `• ${formatTime(assignment.from)}` : '-- --'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[13px] font-semibold ${assignment ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {assignment ? `• ${formatTime(assignment.to)}` : '-- --'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-slate-400">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTransferClick) onTransferClick(emp);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-blue-50 hover:text-[#0B4EA2] transition-colors"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-8 py-5">
          <span className="text-[13px] text-slate-500">
            {selectedIds.length > 0 ? `${selectedIds.length} employee(s) selected` : 'Select employees to assign'}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedIds.length === 0}
            className={`h-12 w-48 rounded-xl text-[15px] font-bold transition-all ${
              selectedIds.length > 0
                ? 'bg-[#0B4EA2] text-white hover:bg-[#093d82]'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </Modal>
  );
}
