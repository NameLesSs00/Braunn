import { FiPrinter } from 'react-icons/fi';

export type InventoryTab =
  | 'Stock Overview'
  | 'Withdraw Items'
  | 'Transactions'
  | 'Low Stock'
  | 'Purchase Requests';

export const INVENTORY_TABS: InventoryTab[] = [
  'Stock Overview',
  'Withdraw Items',
  'Transactions',
  'Low Stock',
  'Purchase Requests',
];

interface InventoryTabsProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
}

export function InventoryTabs({ activeTab, onTabChange }: InventoryTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm flex-grow max-w-4xl">
        {INVENTORY_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-4 text-[14px] font-semibold text-center transition-colors relative whitespace-nowrap px-6 ${
                isActive
                  ? 'text-[#0a4bbd]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0a4bbd] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-shrink-0">
        <button className="flex items-center justify-center gap-3 px-12 py-4 text-[16px] font-bold text-[#1a365d] bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors w-full sm:w-auto h-full">
          <FiPrinter className="w-5 h-5 text-[#0a4bbd]" strokeWidth={2.5} />
          Print
        </button>
      </div>
    </div>
  );
}
