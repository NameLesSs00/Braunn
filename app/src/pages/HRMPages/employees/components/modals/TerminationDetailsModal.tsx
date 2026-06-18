import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { CreditCard } from 'lucide-react';
import { Employee } from '../EmployeesTable';
import { resolveImageUrl } from '../../../../../shared/HRMshared/utils/imageUrl';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks';
import { fetchHrTerminations } from '../../../../../features/HRMfeatures/terminations/hrTerminationsSlice';

type Props = {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
};

export function TerminationDetailsModal({ open, onClose, employee }: Props) {
  const dispatch = useAppDispatch();
  const { terminations } = useAppSelector((state) => state.hrTerminations);
  
  const termination = terminations.find((t) => t.employeeId === employee?.id);

  useEffect(() => {
    if (open && employee?.id) {
      dispatch(fetchHrTerminations({ EmployeeId: employee.id, PageSize: 1 }));
    }
  }, [open, employee?.id, dispatch]);

  if (!employee) return null;

  const termType = termination?.reason?.includes(' - ') ? termination.reason.split(' - ')[0] : 'Termination';
  const termReason = termination?.reason?.includes(' - ') ? termination.reason.split(' - ').slice(1).join(' - ') : (termination?.reason || '—');
  const requestDate = termination?.createdAt ? new Date(termination.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const approvalDate = termination?.terminationDate ? new Date(termination.terminationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const joinDateStr = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const lastWorkingDateStr = termination?.terminationDate ? new Date(termination.terminationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  let durationStr = '—';
  if (employee.joiningDate && termination?.terminationDate) {
    const join = new Date(employee.joiningDate);
    const term = new Date(termination.terminationDate);
    let months = (term.getFullYear() - join.getFullYear()) * 12;
    months -= join.getMonth();
    months += term.getMonth();
    if (months > 0) {
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      durationStr = `${years > 0 ? years + ' Years ' : ''}${remMonths} Months`;
    } else {
      durationStr = 'Less than a month';
    }
  }

  const basicSalary = employee.basicSalary || 0;
  const totalSettlement = basicSalary;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[1000px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Termination Details</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-6">
              {/* Avatar */}
              {!resolveImageUrl(employee?.imageUrl) ? (
                <div className="w-[64px] h-[64px] rounded-full bg-[#3B82F6] flex items-center justify-center text-[24px] font-bold text-white flex-shrink-0">
                  {employee?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
              ) : (
                <img 
                  src={resolveImageUrl(employee?.imageUrl)!} 
                  alt={employee?.fullName} 
                  className="w-[64px] h-[64px] rounded-full object-cover flex-shrink-0"
                />
              )}
              
              <div className="pt-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{employee.fullName}</h3>
                <div className="flex gap-3 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600">
                    <CreditCard className="w-3.5 h-3.5" />
                    {employee.employeeCode}
                  </div>
                  <span className="px-3 py-1 bg-[#FEF2F2] text-red-600 text-xs font-semibold rounded-md border border-red-100">
                    Terminated
                  </span>
                </div>
                
                <div className="flex gap-10">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Department</div>
                    <div className="text-sm font-medium text-slate-700">{employee.departmentName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1">Position</div>
                    <div className="text-sm font-medium text-slate-700">{employee.positionName}</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0B4EA2] text-white text-sm font-medium rounded-lg hover:bg-[#0a428a] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Termination Summary */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <line x1="15" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900">Termination Summary</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Termination Type</span>
                  <span className="text-slate-800 font-medium">{termType}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Reason</span>
                  <span className="text-slate-800 font-medium">{termReason}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Request Date</span>
                  <span className="text-slate-800 font-medium">{requestDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Approval Date</span>
                  <span className="text-slate-800 font-medium">{approvalDate}</span>
                </div>
              </div>
            </div>

            {/* Final Settlement */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-white flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900">Final Settlement</h4>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Basic Salary</span>
                  <span className="text-slate-800 font-medium">${basicSalary.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                <span className="text-slate-900 font-bold">Total Settlement</span>
                <span className="text-2xl text-green-600 font-bold">${totalSettlement.toFixed(2)}</span>
              </div>
            </div>

            {/* Service Information */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900">Service Information</h4>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Joining Date</span>
                  <span className="text-slate-800 font-medium">{joinDateStr}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Last Working Date</span>
                  <span className="text-slate-800 font-medium">{lastWorkingDateStr}</span>
                </div>
                <div className="flex justify-between items-start text-sm pb-6 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Total Service<br />Duration</span>
                  <span className="text-slate-800 font-medium">{durationStr}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Annual Leave Entitlement</span>
                  <span className="text-slate-800 font-medium">{employee.annualLeaveEntitlement || 0} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
