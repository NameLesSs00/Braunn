import React from 'react'
import { recentReservations } from '../dummyData'
import {
  MdGridOn,
  MdPictureAsPdf,
  MdPrint,
} from 'react-icons/md'

export function ReportExportOptions() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Recent Reservations */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-slate-800">Recent Reservations (Today)</h3>
          <button className="text-[12px] font-semibold text-[#0B4EA2] hover:underline">View All</button>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 text-left font-medium text-slate-500">Guest Name</th>
              <th className="pb-2 text-left font-medium text-slate-500">Room</th>
              <th className="pb-2 text-left font-medium text-slate-500">Check In</th>
              <th className="pb-2 text-left font-medium text-slate-500">Nights</th>
              <th className="pb-2 text-left font-medium text-slate-500">Channel</th>
              <th className="pb-2 text-left font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentReservations.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="py-2 text-slate-700">{r.guest}</td>
                <td className="py-2 text-slate-700">{r.room}</td>
                <td className="py-2 text-slate-500">{r.checkIn}</td>
                <td className="py-2 text-slate-700">{r.nights}</td>
                <td className="py-2 text-slate-500">{r.channel}</td>
                <td className="py-2">
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Reports */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="text-[14px] font-semibold text-slate-800 mb-1">Export Reports</h3>
        <p className="text-[12px] text-slate-500 mb-6">Download your report data in different formats.</p>
        <div className="flex items-center gap-6 justify-center">
          {/* Excel */}
          <button
            onClick={() => alert('Exporting to Excel... (Dummy Action)')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-green-400 group-hover:bg-green-50">
              <MdGridOn size={32} className="text-green-600" />
            </div>
            <span className="text-[12px] font-medium text-slate-600 group-hover:text-green-600">Export Excel</span>
          </button>

          {/* PDF */}
          <button
            onClick={() => alert('Exporting to PDF... (Dummy Action)')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-red-400 group-hover:bg-red-50">
              <MdPictureAsPdf size={32} className="text-red-500" />
            </div>
            <span className="text-[12px] font-medium text-slate-600 group-hover:text-red-500">Export PDF</span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-[#0B4EA2] group-hover:bg-blue-50">
              <MdPrint size={32} className="text-[#0B4EA2]" />
            </div>
            <span className="text-[12px] font-medium text-slate-600 group-hover:text-[#0B4EA2]">Print Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
