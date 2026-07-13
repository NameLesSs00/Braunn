import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { roomStatusData, marketSegmentData } from '../dummyData'

export function ReportStatuses() {
  const total = roomStatusData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Room Status Overview */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Room Status Overview</h3>
        <div className="flex items-center gap-6">
          {/* Donut Chart */}
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[24px] font-bold text-slate-800">{total}</span>
              <span className="text-[11px] text-slate-500">Total Rooms</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 flex-1">
            {roomStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[13px] text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-800">{item.value}</span>
                  <span className="text-[12px] text-slate-400 w-10 text-right">{item.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Segment Performance */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Market Segment Performance</h3>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 text-left font-medium text-slate-500">Segment</th>
              <th className="pb-2 text-right font-medium text-slate-500">Rooms</th>
              <th className="pb-2 text-right font-medium text-slate-500">% of Total</th>
              <th className="pb-2 text-right font-medium text-slate-500">ADR</th>
              <th className="pb-2 text-right font-medium text-slate-500">RevPAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {marketSegmentData.map((row) => (
              <tr key={row.segment} className="hover:bg-slate-50/50">
                <td className="py-2.5 text-slate-700">{row.segment}</td>
                <td className="py-2.5 text-right text-slate-700">{row.rooms}</td>
                <td className="py-2.5 text-right text-slate-700">{row.percent}</td>
                <td className="py-2.5 text-right text-slate-700">{row.adr.toFixed(2)}</td>
                <td className="py-2.5 text-right text-slate-700">{row.revpar.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td className="pt-2.5 font-semibold text-[#0B4EA2]">Total</td>
              <td className="pt-2.5 text-right font-semibold text-[#0B4EA2]">
                {marketSegmentData.reduce((s, r) => s + r.rooms, 0)}
              </td>
              <td className="pt-2.5 text-right font-semibold text-[#0B4EA2]">100%</td>
              <td className="pt-2.5 text-right font-semibold text-[#0B4EA2]">135.60</td>
              <td className="pt-2.5 text-right font-semibold text-[#0B4EA2]">98.35</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
