import { useState } from 'react';
import { QuickWithdrawModal } from './modals/QuickWithdrawModal';

export function InventoryHeader() {
  const [isQuickWithdrawOpen, setIsQuickWithdrawOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a365d]">Inventory Management</h1>
          <p className="mt-1 text-[14px] text-slate-400">Track stock levels and manage supplies</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsQuickWithdrawOpen(true)}
            className="px-6 py-2.5 text-[15px] font-semibold text-white bg-[#0a4bbd] border-2 border-[#0a4bbd] rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
          >
            Quick Withdraw
          </button>
        </div>
      </div>

      <QuickWithdrawModal isOpen={isQuickWithdrawOpen} onClose={() => setIsQuickWithdrawOpen(false)} />
    </>
  );
}
