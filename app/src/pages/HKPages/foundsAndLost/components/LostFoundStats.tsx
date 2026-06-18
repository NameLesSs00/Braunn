interface LostFoundStatsProps {
  unclaimedCount: number;
  claimedCount: number;
  totalCount: number;
}

export function LostFoundStats({ unclaimedCount, claimedCount, totalCount }: LostFoundStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm flex flex-col justify-between h-[120px] relative">
        <span className="text-[28px] font-bold text-slate-800">{unclaimedCount}</span>
        <span className="text-[14px] text-slate-500 font-medium">Unclaimed</span>
        <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-amber-400" />
      </div>
      
      <div className="bg-[#0a4bbd] rounded-2xl border border-[#0a4bbd] p-6 shadow-sm flex flex-col justify-between h-[120px] relative">
        <span className="text-[28px] font-bold text-white">{claimedCount}</span>
        <span className="text-[14px] text-white/90 font-medium">Claimed</span>
        <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[120px]">
        <span className="text-[28px] font-bold text-slate-800">{totalCount}</span>
        <span className="text-[14px] text-slate-500 font-medium">Total Items</span>
      </div>
    </div>
  );
}
