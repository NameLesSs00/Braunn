import React from 'react';
import { FiBox, FiAlertTriangle, FiClock, FiShoppingCart } from 'react-icons/fi';

interface StatCardProps {
  label: string;
  count: string | number;
  sub?: string;
  icon: React.ReactNode;
}

function StatCard({ label, count, sub, icon }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-slate-800">{count}</span>
        <div className="flex flex-col">
          <span className="text-[14px] text-slate-500">{label}</span>
          {sub && <span className="text-[13px] text-slate-400">{sub}</span>}
        </div>
      </div>
      <div className="flex-shrink-0">
        {icon}
      </div>
    </div>
  );
}

export function InventoryStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Items"
        count={32}
        icon={<FiBox className="h-8 w-8 text-[#0a4bbd]" strokeWidth={1.5} />}
      />
      <StatCard
        label="Low Stock"
        count={3}
        sub="Alerts"
        icon={<FiAlertTriangle className="h-8 w-8 text-red-500" strokeWidth={1.5} />}
      />
      <StatCard
        label="in stock"
        count={0}
        icon={<FiClock className="h-8 w-8 text-amber-500" strokeWidth={1.5} />}
      />
      <StatCard
        label="Pending Reorders"
        count={5}
        icon={<FiShoppingCart className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />}
      />
    </div>
  );
}
