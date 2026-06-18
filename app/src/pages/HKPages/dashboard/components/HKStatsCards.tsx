import { FiUsers, FiClipboard, FiCheckCircle } from 'react-icons/fi';

export function HKStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Card 1: Available Staff */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-[180px]">
        <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
          {/* @ts-ignore */}
          <FiUsers className="w-6 h-6 text-[#0a4bbd]" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#1a365d] mb-1">8/12</h2>
          <p className="text-[14px] text-slate-500 font-medium">Available Staff</p>
        </div>
      </div>

      {/* Card 2: Pending Requests */}
      <div className="bg-[#0a4bbd] rounded-2xl p-8 shadow-sm flex flex-col justify-between h-[180px]">
        <div className="w-12 h-12 rounded-xl bg-[#093f9e] flex items-center justify-center">
          {/* @ts-ignore */}
          <FiClipboard className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-1">12</h2>
          <p className="text-[14px] text-blue-100 font-medium">Pending Requests</p>
        </div>
      </div>

      {/* Card 1: Available Staff */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-[180px]">
        <div className="w-12 h-12 rounded-xl bg-[#eef2fa] flex items-center justify-center">
          {/* @ts-ignore */}
          <FiUsers className="w-6 h-6 text-[#0a4bbd]" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[#1a365d] mb-1">18</h2>
          <p className="text-[14px] text-slate-500 font-medium">In Progress</p>
        </div>
      </div>

      {/* Card 3: Completed Today */}
      <div className="bg-[#0a4bbd] rounded-2xl p-8 shadow-sm flex flex-col justify-between h-[180px]">
        <div className="w-12 h-12 rounded-xl bg-[#093f9e] flex items-center justify-center">
          {/* @ts-ignore */}
          <FiCheckCircle className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-1">47</h2>
          <p className="text-[14px] text-blue-100 font-medium">Completed Today</p>
        </div>
      </div>
    </div>
  );
}
