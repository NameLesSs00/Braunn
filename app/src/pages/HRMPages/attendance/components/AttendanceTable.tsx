import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

interface AttendanceRow {
  id: string;
  initials: string;
  name: string;
  empId: string;
  department: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: 'On Time' | 'Late' | 'On Leave' | 'Present';
  avatarBg: string;
  avatarText: string;
  isCheckInLate?: boolean;
}

const tableData: AttendanceRow[] = [
  {
    id: '1',
    initials: 'JD',
    name: 'John Doe',
    empId: 'EMP-001',
    department: 'Sales',
    checkIn: '08:55 AM',
    checkOut: '05:05 PM',
    hours: '8h 10m',
    status: 'On Time',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
  },
  {
    id: '2',
    initials: 'AS',
    name: 'Alice Smith',
    empId: 'EMP-042',
    department: 'Receptionist',
    checkIn: '09:15 AM',
    checkOut: '--:--',
    hours: '--',
    status: 'Late',
    avatarBg: 'bg-rose-100',
    avatarText: 'text-rose-700',
  },
  {
    id: '3',
    initials: 'RJ',
    name: 'Robert Johnson',
    empId: 'EMP-018',
    department: 'Marketing',
    checkIn: '--:--',
    checkOut: '--:--',
    hours: '--',
    status: 'On Leave',
    avatarBg: 'bg-slate-800',
    avatarText: 'text-white',
  },
  {
    id: '4',
    initials: 'EW',
    name: 'Emily White',
    empId: 'EMP-099',
    department: 'Housekeeping',
    checkIn: '08:45 AM',
    checkOut: '05:30 PM',
    hours: '8h 45m',
    status: 'On Time',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
  },
  {
    id: '5',
    initials: 'SM',
    name: 'Sophia Martinez',
    empId: 'EMP-045',
    department: 'Housekeeping',
    checkIn: '08:00',
    checkOut: '16:00',
    hours: '8h',
    status: 'Present',
    avatarBg: 'bg-slate-200',
    avatarText: 'text-slate-700',
    isCheckInLate: true,
  },
  {
    id: '6',
    initials: 'DC',
    name: 'David Chen',
    empId: 'EMP-067',
    department: 'Receptionist',
    checkIn: '09:00',
    checkOut: '17:00',
    hours: '8h',
    status: 'Present',
    avatarBg: 'bg-slate-200',
    avatarText: 'text-slate-700',
    isCheckInLate: true,
  },
];

function StatusBadge({ status }: { status: AttendanceRow['status'] }) {
  const styles = {
    'On Time': 'bg-blue-100 text-blue-700',
    'Late': 'bg-orange-100 text-orange-700',
    'On Leave': 'bg-slate-200 text-slate-700',
    'Present': 'bg-rose-100 text-rose-700', // As per design
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export function AttendanceTable() {
  return (
    <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Employee</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Department</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Check-In</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Check-Out</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Hours</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Status</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0 ${row.avatarBg} ${row.avatarText}`}>
                      {row.initials}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{row.name}</div>
                      <div className="text-[12px] text-slate-500">{row.empId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{row.department}</td>
                <td className={`px-6 py-4 text-[14px] ${row.isCheckInLate ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                  {row.checkIn}
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{row.checkOut}</td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{row.hours}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <button className="text-[13px] font-medium text-[#0B4EA2] hover:underline">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
        <div className="text-[13px] text-slate-500">
          Showing 1 to 5 of 142 entries
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <IconImage src={FiChevronLeft} alt="Previous" className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0B4EA2] text-white text-[13px] font-medium">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[13px] font-medium transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[13px] font-medium transition-colors">
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 text-[13px] font-medium transition-colors">
            29
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <IconImage src={FiChevronRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
