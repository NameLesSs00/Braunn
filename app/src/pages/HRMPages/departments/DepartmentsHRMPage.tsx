export function DepartmentsHRMPage() {
  const departments = [
    {
      id: 'front-desk',
      name: 'Front Desk',
      manager: 'John Martinez',
      headcount: 12,
      budget: '$85K',
      color: '#2563eb', // Blue
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      manager: 'Sarah Chen',
      headcount: 45,
      budget: '$220K',
      color: '#10b981', // Green
    },
    {
      id: 'food-beverage',
      name: 'Food & Beverage',
      manager: 'Michael Brown',
      headcount: 38,
      budget: '$310K',
      color: '#f59e0b', // Amber/Yellow-Orange
    },
    {
      id: 'finance',
      name: 'Finance',
      manager: 'Maria Garcia',
      headcount: 10,
      budget: '$180K',
      color: '#6366f1', // Indigo
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      manager: 'James Taylor',
      headcount: 15,
      budget: '$125K',
      color: '#8b5cf6', // Violet
    },
    {
      id: 'security',
      name: 'Security',
      manager: 'Robert Davis',
      headcount: 20,
      budget: '$140K',
      color: '#ef4444', // Red
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      manager: 'David Rodriguez',
      headcount: 35,
      budget: '$280K',
      color: '#f97316', // Orange
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Departments Management</h1>
        <p className="text-slate-500 mt-1">Manage departments, employees, and budgets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            style={{ borderTopWidth: '4px', borderTopColor: dept.color }}
          >
            <div className="p-6 flex-1 flex flex-col">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg mb-4"
                style={{ backgroundColor: dept.color }}
              >
                {dept.name.charAt(0)}
              </div>

              <h3 className="font-semibold text-slate-900 text-lg mb-1">{dept.name}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">Manager: {dept.manager}</p>

              <div className="flex gap-3">
                <div className="flex-1 bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-medium mb-1">Headcount</p>
                  <p className="font-semibold text-slate-900">{dept.headcount}</p>
                </div>
                {/* <div className="flex-1 bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-medium mb-1">Budget</p>
                  <p className="font-semibold text-slate-900">{dept.budget}</p>
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
