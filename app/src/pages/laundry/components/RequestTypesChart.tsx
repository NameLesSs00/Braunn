import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Guest Laundry', value: 45, color: '#3B82F6' },
  { name: 'Room Linen', value: 38, color: '#8B5CF6' },
  { name: 'VIP Priority', value: 28, color: '#F59E0B' },
  { name: 'Emergency', value: 16, color: '#EF4444' },
]

export function RequestTypesChart() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <div>
        <h2 className="text-base font-semibold text-[#0B4EA2]">Request Types</h2>
        <p className="mt-0.5 text-[13px] text-slate-400">Distribution by category</p>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {data.map((entry) => (
          <div key={entry.name} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[12px] text-slate-500">{entry.name}</span>
            </div>
            <div className="ml-5 text-[15px] font-bold text-slate-700">{entry.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
