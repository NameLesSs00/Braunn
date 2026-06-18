import { FiDroplet, FiCheckCircle, FiPackage, FiBox, FiCoffee } from 'react-icons/fi';

export function GuestRequestsStats() {
  return (
    <div className="flex flex-col gap-8 mb-8">
      {/* Top 4 Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[120px]">
          <span className="text-[28px] font-bold text-slate-800">1</span>
          <span className="text-[14px] text-slate-500 font-medium">Pending</span>
        </div>
        <div className="bg-[#0a4bbd] rounded-2xl border border-[#0a4bbd] p-6 shadow-sm flex flex-col justify-between h-[120px] relative">
          <span className="text-[28px] font-bold text-white">1</span>
          <span className="text-[14px] text-white/90 font-medium">Assigned</span>
          <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[120px] relative">
          <span className="text-[28px] font-bold text-slate-800">1</span>
          <span className="text-[14px] text-slate-500 font-medium">Completed</span>
          <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="bg-[#0a4bbd] rounded-2xl border border-[#0a4bbd] p-6 shadow-sm flex flex-col justify-between h-[120px] relative">
          <span className="text-[28px] font-bold text-white">1</span>
          <span className="text-[14px] text-white/90 font-medium">In Progress</span>
          <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-amber-400" />
        </div>
      </div>

      {/* 5 Category Squares */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-start justify-start gap-4 h-[160px]">
          <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
            {/* @ts-ignore */}
            <FiDroplet className="w-6 h-6 text-[#0a4bbd]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Extra Towels</span>
            <span className="text-[11px] text-slate-500 mt-1">1 requests</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-start justify-start gap-4 h-[160px]">
          <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
            {/* @ts-ignore */}
            <FiCheckCircle className="w-6 h-6 text-[#0a4bbd]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Room Cleaning</span>
            <span className="text-[11px] text-slate-500 mt-1">1 requests</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-start justify-start gap-4 h-[160px]">
          <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
            {/* @ts-ignore */}
            <FiPackage className="w-6 h-6 text-[#0a4bbd]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Laundry Pickup</span>
            <span className="text-[11px] text-slate-500 mt-1">0 requests</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-start justify-start gap-4 h-[160px]">
          <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
            {/* @ts-ignore */}
            <FiBox className="w-6 h-6 text-[#0a4bbd]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Pillow Request</span>
            <span className="text-[11px] text-slate-500 mt-1">0 requests</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-start justify-start gap-4 h-[160px]">
          <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
            {/* @ts-ignore */}
            <FiCoffee className="w-6 h-6 text-[#0a4bbd]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-800">Mini Bar Refill</span>
            <span className="text-[11px] text-slate-500 mt-1">1 requests</span>
          </div>
        </div>
      </div>
    </div>
  );
}
