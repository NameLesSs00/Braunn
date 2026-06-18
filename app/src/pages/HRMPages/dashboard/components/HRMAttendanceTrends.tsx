import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', attendance: 10 },
  { day: 'Tue', attendance: 25 },
  { day: 'Wed', attendance: 75 },
  { day: 'Thu', attendance: 50 },
  { day: 'Fri', attendance: 15 },
  { day: 'Sat', attendance: 100 },
  { day: 'Sun', attendance: 50 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2">
        <p className="text-[13px] font-bold text-slate-800">{label}</p>
        <p className="text-[13px] text-[#0B4EA2]">{payload[0].value}% attendance</p>
      </div>
    );
  }
  return null;
};

export function HRMAttendanceTrends() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
      <h2 className="text-[16px] font-bold text-slate-800 mb-5">
        Attendance Trends (Last 7 Days)
      </h2>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  fontSize={12}
                  fill={payload.value === 'Fri' ? '#EF4444' : '#94a3b8'}
                  fontWeight={payload.value === 'Fri' ? 700 : 400}
                >
                  {payload.value}
                </text>
              )}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
            <Bar dataKey="attendance" fill="#0B4EA2" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
