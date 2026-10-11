import { FiEye, FiEdit2 } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';
import { useAppSelector } from '../../../../store/hooks';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { resolveImageUrl } from '../../../../shared/HRMshared/utils/imageUrl';
import { HRMPagination } from '../../../../shared/HRMshared/ui/HRMPagination';

// Re-export so child tabs that import { Employee } from '../EmployeesTable' still work
export type { HREmployeeReadDto as Employee };

type EmployeeStatus = 'Active' | 'OnLeave' | 'Terminated' | string;

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const normalizedStatus = status === 'Active' ? 'Active' : status === 'Terminated' ? 'Terminated' : 'OnLeave';
  const styles = {
    'Active': 'bg-[#EEF4FF] text-[#0B4EA2]',
    'OnLeave': 'bg-slate-200 text-slate-700',
    'Terminated': 'bg-red-100 text-red-600',
  };

  const displayText = status === 'OnLeave' ? 'On Leave' : status;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${styles[normalizedStatus]}`}>
      {displayText}
    </span>
  );
}

type EmployeesTableProps = {
  onView?: (employee: HREmployeeReadDto) => void;
  onEdit?: (employee: HREmployeeReadDto) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function EmployeesTable({ onView, onEdit, onPageChange, onPageSizeChange }: EmployeesTableProps) {
  const { employees, totalCount, totalPages, pageNumber, pageSize, status, error } = useAppSelector((state) => state.hrEmployees);

  const isLoading = status === 'loading';

  // Full spinner only on the very first load; afterwards keep rows visible while fetching
  if (isLoading && employees.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Thin top loading bar while changing pages / filters */}
      {isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-[3px] overflow-hidden bg-[#0B4EA2]/10">
          <div className="h-full w-1/3 animate-[hrm-loading-bar_1s_ease-in-out_infinite] bg-[#0B4EA2]" />
          <style>{`@keyframes hrm-loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
        </div>
      )}
      <div className={`overflow-x-auto transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Employee Name</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Employee ID</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Position</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  {status === 'failed' && error ? error : 'No employees found.'}
                </td>
              </tr>
            ) : (
              employees.map((employee, idx) => {
                const initial = employee.fullName ? employee.fullName.charAt(0).toUpperCase() : '?';
                const resolvedImg = resolveImageUrl(employee.imageUrl);

                return (
                  <tr key={`${employee.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!resolvedImg ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0 bg-blue-100 text-blue-700`}>
                            {initial}
                          </div>
                        ) : (
                          <img src={resolvedImg} alt={employee.fullName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">{employee.fullName}</div>
                          <div className="text-[12px] text-slate-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">{employee.employeeCode}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">{employee.departmentName}</td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">{employee.positionName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={employee.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onView && onView(employee)}
                          className={`transition-colors ${
                            employee.status === 'Terminated'
                              ? 'text-red-400 hover:text-red-600'
                              : 'text-slate-400 hover:text-[#0B4EA2]'
                          }`}
                          title="View Details"
                        >
                          <IconImage src={FiEye} alt="View" className="w-[18px] h-[18px]" />
                        </button>
                        {employee.status !== 'Terminated' && (
                          <button 
                            onClick={() => onEdit && onEdit(employee)}
                            className="text-slate-400 hover:text-[#0B4EA2] transition-colors" 
                            title="Edit Employee"
                          >
                            <IconImage src={FiEdit2} alt="Edit" className="w-[18px] h-[18px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <HRMPagination
          page={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          label="employees"
          disabled={isLoading}
        />
      )}
    </div>
  );
}
