interface LeaveBalanceRow {
  id: string;
  initials: string;
  name: string;
  empId: string;
  department: string;
  availableBalance: string;
  used: string;
  total: string;
  avatarBg: string;
}

const tableData: LeaveBalanceRow[] = [
  {
    id: '1',
    initials: 'AH',
    name: 'Ahmed Hassan',
    empId: 'E001',
    department: 'Engineering',
    availableBalance: '15 days',
    used: '15 days',
    total: '30 days',
    avatarBg: 'bg-emerald-800',
  },
  {
    id: '2',
    initials: 'FZ',
    name: 'Fatima Al-Zahrani',
    empId: 'E002',
    department: 'HR',
    availableBalance: '20 days',
    used: '10 days',
    total: '30 days',
    avatarBg: 'bg-yellow-700',
  },
  {
    id: '3',
    initials: 'MA',
    name: 'Mohammed Ali',
    empId: 'E003',
    department: 'Sales',
    availableBalance: '12 days',
    used: '18 days',
    total: '30 days',
    avatarBg: 'bg-indigo-900',
  },
  {
    id: '4',
    initials: 'SA',
    name: 'Sarah Abdullah',
    empId: 'E004',
    department: 'Engineering',
    availableBalance: '18 days',
    used: '12 days',
    total: '30 days',
    avatarBg: 'bg-slate-800',
  },
  {
    id: '5',
    initials: 'KI',
    name: 'Khalid Ibrahim',
    empId: 'E005',
    department: 'Finance',
    availableBalance: '8 days',
    used: '22 days',
    total: '30 days',
    avatarBg: 'bg-teal-900',
  },
  {
    id: '6',
    initials: 'KI',
    name: 'Khalid Ibrahim',
    empId: 'E005',
    department: 'Finance',
    availableBalance: '8 days',
    used: '22 days',
    total: '30 days',
    avatarBg: 'bg-teal-900',
  },
];

export function LeaveBalanceTable() {
  return (
    <div className="shadow-sm rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="py-5 px-6 border-b border-slate-200">
        <h2 className="text-[16px] font-bold text-[#1a365d]">Leave Balance</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Available Balance</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Used</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0 text-white ${row.avatarBg}`}>
                      {row.initials}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{row.name}</div>
                      <div className="text-[12px] text-slate-400">{row.empId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{row.department}</td>
                <td className="px-6 py-4 text-[14px] font-bold text-emerald-600">{row.availableBalance}</td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{row.used}</td>
                <td className="px-6 py-4 text-[14px] font-bold text-slate-900">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
