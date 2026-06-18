import { liveActivityData } from '../mockData';

const colorMap = {
  green: { bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-100', dot: 'bg-blue-500' },
  orange: { bg: 'bg-amber-100', dot: 'bg-amber-600' },
  yellow: { bg: 'bg-yellow-100', dot: 'bg-yellow-400' },
};

export function HKLiveActivity() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[16px] font-bold text-[#1a365d]">Live Activity</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[13px] font-medium text-emerald-500">Live</span>
        </div>
      </div>

      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-slate-100" />

        <div className="space-y-6">
          {liveActivityData.map((item) => {
            const colors = colorMap[item.statusColor];
            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colors.bg}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[15px] font-bold text-slate-800">{item.room}</span>
                    <span className="text-[12px] font-medium text-slate-400">• {item.time}</span>
                  </div>
                  <p className="text-[14px] text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
