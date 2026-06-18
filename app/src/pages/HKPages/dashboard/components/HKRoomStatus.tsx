import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { roomStatusData } from '../mockData';

export function HKRoomStatus() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
      <h2 className="text-[16px] font-bold text-[#1a365d] mb-6">Room Status</h2>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomStatusData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {roomStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="w-full mt-4 space-y-3">
          {roomStatusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[14px] text-slate-500 font-medium">{item.name}</span>
              </div>
              <span className="text-[15px] font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
