import { useState } from 'react';
import { ArrowLeft, Edit3, AlertTriangle, Mail, Calendar, ChevronDown } from 'lucide-react';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { resolveImageUrl } from '../../../../shared/HRMshared/utils/imageUrl';
import { EmployeeOverviewTab } from './tabs/EmployeeOverviewTab';
import { EmployeeAttendanceTab } from './tabs/EmployeeAttendanceTab';
import { EmployeePayrollTab } from './tabs/EmployeePayrollTab';
import { EmployeeSalaryHistoryTab } from './tabs/EmployeeSalaryHistoryTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { InitiateTerminationModal } from './modals/InitiateTerminationModal';
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks';
import { createHrTermination } from '../../../../features/HRMfeatures/terminations/hrTerminationsSlice';
import { fetchHrEmployees } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';

type Props = {
  employee: HREmployeeReadDto;
  onBack: () => void;
  onEdit: () => void;
};

type TabType = 'Overview' | 'Attendance' | 'Payroll' | 'Salary history' | 'Documents';

export function EmployeeDetailsView({ employee, onBack, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  
  const dispatch = useAppDispatch();
  const { status: terminateStatus } = useAppSelector(s => s.hrTerminations);

  const tabs: TabType[] = ['Overview', 'Attendance', 'Payroll', 'Salary history', 'Documents'];

  const isOverview = activeTab === 'Overview';
  const showMonthExport = activeTab === 'Attendance' || activeTab === 'Payroll' || activeTab === 'Salary history' || activeTab === 'Documents';

  const initials = (employee.fullName ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const resolvedImg = resolveImageUrl(employee.imageUrl);
  const joiningDateFormatted = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="w-full pb-10">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[15px] font-semibold text-[#0B4EA2] hover:text-[#093c80] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Employees
      </button>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-[20px] p-8 mb-6">
        <div className="flex items-start justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-6 flex-1">
            {/* Avatar */}
            {!resolvedImg ? (
              <div
                className={`flex-shrink-0 flex items-center justify-center font-bold text-white rounded-full bg-[#3B82F6] ${
                  isOverview
                    ? 'w-[96px] h-[96px] text-[36px]'
                    : 'w-[52px] h-[52px] text-[20px]'
                }`}
              >
                {initials}
              </div>
            ) : (
              <img
                src={resolvedImg}
                alt={employee.fullName}
                className={`rounded-full object-cover flex-shrink-0 ${
                  isOverview ? 'w-[96px] h-[96px]' : 'w-[52px] h-[52px]'
                }`}
              />
            )}

            {/* Info */}
            <div className="flex-1 w-full">
              <h1
                className={`font-bold text-slate-900 leading-none ${
                  isOverview ? 'text-[32px] mb-2' : 'text-[22px] mb-1'
                }`}
              >
                {employee.fullName}
              </h1>

              {isOverview ? (
                <>
                  <div className="text-[16px] text-slate-500 font-medium mb-1">{employee.positionName}</div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-4">
                    {employee.departmentName}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${
                        employee.status === 'Active'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : employee.status === 'Terminated'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {employee.status === 'Active' && (
                        <span className="w-[6px] h-[6px] rounded-full bg-[#16A34A]" />
                      )}
                      {employee.status === 'OnLeave' ? 'On Leave' : employee.status}
                    </span>
                    <span className="text-[13px] font-medium text-slate-500">ID: {employee.employeeCode}</span>
                  </div>

                  {/* Contact Info Row */}
                  <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-5 border-t border-slate-100">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-[20px] h-[20px] flex-shrink-0" />
                        <span className="text-[14px] font-medium">Email</span>
                      </div>
                      <div className="text-[18px] font-semibold text-slate-900 truncate">
                        {employee.email}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-[20px] h-[20px] flex-shrink-0" />
                        <span className="text-[14px] font-medium">Joining Date</span>
                      </div>
                      <div className="text-[18px] font-semibold text-slate-900">
                        {joiningDateFormatted}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[14px] text-slate-500 font-medium">
                  {employee.positionName}
                  {activeTab === 'Payroll' && (
                    <span className="text-slate-400"> • {employee.departmentName}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isOverview ? (
              <>
                <button 
                  onClick={onEdit}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                  Edit
                </button>
                <button 
                  onClick={() => setIsTerminateModalOpen(true)}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg border border-red-100 bg-[#FEF2F2] text-[13px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Terminate
                </button>
              </>
            ) : showMonthExport ? (
              <>
                <div className="relative">
                  <select className="h-10 pl-4 pr-9 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 outline-none hover:bg-slate-50 transition-colors appearance-none cursor-pointer">
                    <option>October 2023</option>
                    <option>September 2023</option>
                    <option>August 2023</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0B4EA2] text-[13px] font-semibold text-white hover:bg-[#093c80] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs and Tab Content Section */}
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 px-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[14px] font-bold transition-colors relative px-1 ${
                activeTab === tab ? 'text-[#0B4EA2]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#0B4EA2]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
        {activeTab === 'Overview' && <EmployeeOverviewTab employee={employee} />}
        {activeTab === 'Attendance' && <EmployeeAttendanceTab employee={employee} />}
        {activeTab === 'Payroll' && <EmployeePayrollTab employee={employee} />}
        {activeTab === 'Salary history' && <EmployeeSalaryHistoryTab employee={employee} />}
        {activeTab === 'Documents' && <EmployeeDocumentsTab employee={employee} />}
        </div>
      </div>

      <InitiateTerminationModal
        open={isTerminateModalOpen}
        onClose={() => setIsTerminateModalOpen(false)}
        employee={employee as any}
        onSubmit={async (data) => {
          const res = await dispatch(createHrTermination({
            employeeId: employee.id,
            terminationDate: new Date(data.date).toISOString(),
            reason: `${data.type} - ${data.reason}`,
          }));
          if (createHrTermination.fulfilled.match(res)) {
            setIsTerminateModalOpen(false);
            onBack();
            dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 10 }));
          }
        }}
      />
    </div>
  );
}
