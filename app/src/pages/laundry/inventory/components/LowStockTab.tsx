import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { LowStockItem } from '../mockData';
import { ReorderRequestModal } from './modals/ReorderRequestModal';

interface LowStockCardProps {
  item: LowStockItem;
  onRequestClick: () => void;
}

function LowStockCard({ item, onRequestClick }: LowStockCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[16px] font-bold text-slate-800">{item.name}</span>
        <span className="inline-flex items-center px-3 py-0.5 text-[12px] font-semibold rounded-full bg-[#ffe4e6] text-[#ef4444]">
          Low
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-slate-500">Current:</span>
          <span className="font-bold text-[#ef4444]">{item.current} {item.unit}</span>
        </div>
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-slate-500">Minimum:</span>
          <span className="font-bold text-slate-800">{item.minimum} {item.unit}</span>
        </div>
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-slate-500">Needed:</span>
          <span className="font-bold text-[#eab308]">{item.needed} {item.unit}</span>
        </div>
      </div>

      {/* CTA */}
      <button 
        onClick={onRequestClick}
        className="w-full py-3 mt-auto text-[14px] font-bold text-white bg-[#ef4444] hover:bg-red-600 rounded-xl transition-colors"
      >
        Create Purchase Request
      </button>
    </div>
  );
}

interface LowStockTabProps {
  items: LowStockItem[];
}

export function LowStockTab({ items }: LowStockTabProps) {
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-[#fbcaca] bg-[#fff5f5]">
        {/* Alert Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#fbcaca]">
          {/* @ts-ignore */}
          <FiAlertTriangle className="w-5 h-5 text-[#ef4444]" strokeWidth={2.5} />
          <h2 className="text-[16px] font-bold text-[#ef4444]">Low Stock Alerts</h2>
        </div>

        {/* Cards Grid */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-[14px]">
              No low stock items — everything looks good!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <LowStockCard 
                  key={item.id} 
                  item={item} 
                  onRequestClick={() => setIsReorderOpen(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReorderRequestModal isOpen={isReorderOpen} onClose={() => setIsReorderOpen(false)} />
    </>
  );
}
