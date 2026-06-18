import { useState } from 'react';
import { ChevronRight, Clock, Plane, DollarSign, ShieldCheck, CreditCard, Calendar } from 'lucide-react';
import { Employee } from '../EmployeesTable';
import { AddBonusModal } from '../modals/AddBonusModal';
import { AddDeductionModal } from '../modals/AddDeductionModal';
import { NewLeaveRequestPopup } from '../../../leaveManagement/popups/NewLeaveRequestPopup';
import { SelectEmployeePopup } from '../../../shiftManagement/components/SelectEmployeePopup';
import { AssignEmployeePopup } from '../../../shiftManagement/components/AssignEmployeePopup';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';
import { useAppDispatch } from '../../../../../store/hooks';
import { createBonus } from '../../../../../features/HRMfeatures/bonuses/bonusesSlice';
import { createDeduction } from '../../../../../features/HRMfeatures/deductions/deductionsSlice';

type Props = {
  employee: Employee;
};

export function EmployeeOverviewTab({ employee }: Props) {
  const dispatch = useAppDispatch();
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<HREmployeeReadDto[]>([]);

  const handleNext = (employees: HREmployeeReadDto[]) => {
    setSelectedEmployees(employees);
    setIsSelectOpen(false);
    setIsAssignOpen(true);
  };

  const handleBack = () => {
    setIsAssignOpen(false);
    setIsSelectOpen(true);
  };

  const handleCloseAll = () => {
    setIsSelectOpen(false);
    setIsAssignOpen(false);
    setSelectedEmployees([]);
  };

  return (
    <div className="flex gap-6 items-start">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Salary Per Month */}
          <div className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="w-10 h-10 rounded-full bg-[#EEF4FF] text-[#0B4EA2] flex items-center justify-center mb-5">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-[32px] font-bold text-slate-900 leading-none mb-1.5">
              ${(employee.basicSalary ?? 0).toLocaleString()}
            </div>
            <div className="text-[13px] text-slate-500 font-medium">Salary Per Month</div>
          </div>

          {/* Leave Balance — dark blue card */}
          <div className="bg-[#0B4EA2] rounded-[20px] p-6 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-5">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="text-[32px] font-bold leading-none mb-1.5">
              {employee.annualLeaveEntitlement ?? 0}
            </div>
            <div className="text-[13px] text-blue-200 font-medium">Annual Leave Entitlement</div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-8">
          <h2 className="text-[16px] font-bold text-slate-900 mb-8">Personal Information</h2>
          <div className="grid grid-cols-2 gap-y-8 gap-x-20">
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Full Name</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.fullName}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Employee Code</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.employeeCode || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Email Address</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.email}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Gender</div>
              <div className="text-[14px] font-medium text-slate-900 capitalize">{employee.gender || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Nationality</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.nationality || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Date of Joining</div>
              <div className="text-[14px] font-medium text-slate-900">
                {employee.joiningDate
                  ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Department</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.departmentName || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Position</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.positionName || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Bank Account</div>
              <div className="text-[14px] font-medium text-slate-900">{employee.bankAccountNumber || '—'}</div>
            </div>
            <div>
              <div className="text-[12px] text-slate-400 mb-1.5">Role</div>
              <div className="text-[14px] font-medium text-slate-900 capitalize">{employee.role || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-[300px] flex-shrink-0 space-y-5">
        {/* Quick Actions */}
        <div className="bg-[#F8FAFC] rounded-[20px] p-6 border-none">
          <h2 className="text-[16px] font-bold text-slate-900 mb-5">Quick Actions</h2>
          <div className="space-y-4">
            {[
              { icon: <Clock className="w-[18px] h-[18px]" />, label: 'Assign shift' },
              { icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Add Bonus' },
              { icon: <DollarSign className="w-[18px] h-[18px]" />, label: 'Add Deduction' },
              { icon: <Calendar className="w-[18px] h-[18px]" />, label: 'Request Leave' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => {
                  if (label === 'Assign shift') setIsSelectOpen(true);
                  if (label === 'Add Bonus') setIsBonusModalOpen(true);
                  if (label === 'Add Deduction') setIsDeductionModalOpen(true);
                  if (label === 'Request Leave') setIsLeaveModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[12px] hover:border-[#0B4EA2] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-800 group-hover:text-[#0B4EA2] transition-colors">
                    {icon}
                  </div>
                  <span className="text-[14px] font-semibold text-slate-800 group-hover:text-[#0B4EA2] transition-colors">
                    {label}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-[#0B4EA2] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Employee Status Card */}
        <div className="bg-[#0B4EA2] rounded-[20px] p-7 text-white relative overflow-hidden" style={{ minHeight: 140 }}>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.1] pointer-events-none">
            <ShieldCheck className="w-[160px] h-[160px]" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] tracking-widest text-blue-200 font-bold mb-1.5 uppercase">Status</div>
            <div className="text-[20px] font-bold mb-1">{employee.status === 'OnLeave' ? 'On Leave' : employee.status}</div>
            <div className="text-[13px] text-blue-200 font-medium capitalize">{employee.role}</div>
          </div>
        </div>
      </div>

      <AddBonusModal
        open={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        employee={employee}
        onSubmit={(data) => {
          dispatch(createBonus(data));
          setIsBonusModalOpen(false);
        }}
      />

      <AddDeductionModal
        open={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
        employee={employee}
        onSubmit={(data) => {
          dispatch(createDeduction(data));
          setIsDeductionModalOpen(false);
        }}
      />

      <NewLeaveRequestPopup
        open={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />

      <SelectEmployeePopup
        open={isSelectOpen}
        onClose={handleCloseAll}
        onNext={handleNext}
      />

      <AssignEmployeePopup
        open={isAssignOpen}
        onClose={handleCloseAll}
        onBack={handleBack}
        selectedEmployees={selectedEmployees}
      />
    </div>
  );
}
