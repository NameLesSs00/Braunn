import { useEffect } from 'react';
import { FiEye, FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchHrEmployees } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { resolveImageUrl } from '../../../../shared/HRMshared/utils/imageUrl';

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

export function EmployeesTable({ onView, onEdit }: { onView?: (employee: HREmployeeReadDto) => void, onEdit?: (employee: HREmployeeReadDto) => void }) {
  const dispatch = useAppDispatch();
  const { employees, totalCount, pageNumber, pageSize, status } = useAppSelector((state) => state.hrEmployees);

  useEffect(() => {
    dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchHrEmployees({ PageNumber: newPage, PageSize: pageSize }));
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startResult = (pageNumber - 1) * pageSize + 1;
  const endResult = Math.min(pageNumber * pageSize, totalCount);

  if (status === 'loading') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
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
                  No employees found.
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
      {employees.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
          <div className="text-[14px] text-slate-500">
            Showing {startResult} to {endResult} of {totalCount} results
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 border-r-0 rounded-l-lg text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <IconImage src={FiChevronLeft} alt="Previous" className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#0B4EA2] bg-[#0B4EA2] text-white text-[13px] font-medium">
              {pageNumber}
            </button>
            <button 
              onClick={() => handlePageChange(Math.min(totalPages, pageNumber + 1))}
              disabled={pageNumber === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 border-l-0 rounded-r-lg text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <IconImage src={FiChevronRight} alt="Next" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
