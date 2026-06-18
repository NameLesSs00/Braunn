import { ChevronDown } from 'lucide-react';

export function PayrollCostTrendChart() {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-slate-900">Payroll Cost Trend</h2>
        <div className="relative">
          <select className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-8 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        <svg viewBox="0 0 800 300" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B4EA2" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B4EA2" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="50" y1="50" x2="750" y2="50" stroke="#f1f5f9" strokeWidth="2" />
          <line x1="50" y1="150" x2="750" y2="150" stroke="#f1f5f9" strokeWidth="2" />
          <line x1="50" y1="250" x2="750" y2="250" stroke="#f1f5f9" strokeWidth="2" />

          {/* Y Axis Labels */}
          <text x="40" y="55" fontSize="12" fill="#94a3b8" textAnchor="end" fontWeight="600">500K</text>
          <text x="40" y="155" fontSize="12" fill="#94a3b8" textAnchor="end" fontWeight="600">400K</text>
          <text x="40" y="255" fontSize="12" fill="#94a3b8" textAnchor="end" fontWeight="600">300K</text>

          {/* X Axis Labels */}
          <text x="100" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">Dec 2025</text>
          <text x="220" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">Jan 2026</text>
          <text x="340" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">Feb 2026</text>
          <text x="460" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">Mar 2026</text>
          <text x="580" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">Apr 2026</text>
          <text x="700" y="280" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">May 2026</text>

          {/* Fill Area */}
          <path
            d="M 100 240 C 160 240, 160 180, 220 180 C 280 180, 280 130, 340 130 C 400 130, 400 160, 460 160 C 520 160, 520 210, 580 210 C 640 210, 640 80, 700 80 L 700 250 L 100 250 Z"
            fill="url(#trendGradient)"
          />

          {/* Trend Line */}
          <path
            d="M 100 240 C 160 240, 160 180, 220 180 C 280 180, 280 130, 340 130 C 400 130, 400 160, 460 160 C 520 160, 520 210, 580 210 C 640 210, 640 80, 700 80"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points */}
          <circle cx="100" cy="240" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="220" cy="180" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="340" cy="130" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="460" cy="160" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="580" cy="210" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="700" cy="80" r="4" fill="white" stroke="#3b82f6" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
}
