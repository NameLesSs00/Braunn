import { FiEye, FiClock } from 'react-icons/fi';
import { SalaryRecord } from '../types';

type Props = {
  records: SalaryRecord[];
  onView: (record: SalaryRecord) => void;
  onHistory: (record: SalaryRecord) => void;
  onApprove: (record: SalaryRecord) => void;
};

export function SalaryIncrementsTable({ records, onView, onHistory, onApprove }: Props) {
  const getStatusStyle = (status: SalaryRecord['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'HR Approved':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No records found for the selected filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs font-bold tracking-wider uppercase">
            <th className="px-6 py-4 border-b border-slate-100">Employee</th>
            <th className="px-6 py-4 border-b border-slate-100">Department</th>
            <th className="px-6 py-4 border-b border-slate-100">Previous Salary</th>
            <th className="px-6 py-4 border-b border-slate-100">New Salary</th>
            <th className="px-6 py-4 border-b border-slate-100">Increment</th>
            <th className="px-6 py-4 border-b border-slate-100">%</th>
            <th className="px-6 py-4 border-b border-slate-100">Effective Date</th>
            <th className="px-6 py-4 border-b border-slate-100">Status</th>
            <th className="px-6 py-4 border-b border-slate-100 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {record.employee.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{record.employee}</p>
                    <p className="text-xs text-slate-500">{record.role}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{record.department}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{record.prevSalary}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900">{record.newSalary}</td>
              <td className="px-6 py-4 text-sm font-semibold text-green-600">{record.incrementAmount}</td>
              <td className="px-6 py-4 text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                  {record.incrementPercent}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{record.effectiveDate}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(record.status)}`}>
                  {record.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onView(record)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="View Details"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => onHistory(record)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="View History"
                  >
                    <FiClock size={18} />
                  </button>
                  
                  {(record.status === 'Pending' || record.status === 'HR Approved') && (
                    <button
                      onClick={() => onApprove(record)}
                      className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
