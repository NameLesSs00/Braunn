import { FiBox, FiAlertCircle } from 'react-icons/fi';
import { useAppSelector } from '../../../../store/hooks';

export function LaundryInventoryStats() {
  const { items, status } = useAppSelector((state) => state.laundryInventoryItems);

  const totalItems = items.length;
  const lowStockCount = items.filter(
    (item) => item.status === 'Low' || (item.minimumStock !== undefined && item.quantity < item.minimumStock)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Items */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
          {/* @ts-ignore */}
          <FiBox className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-slate-500">Total Items in Stock</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">
              {status === 'loading' ? '...' : totalItems}
            </h3>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50">
          {/* @ts-ignore */}
          <FiAlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-slate-500">Low Stock Alerts</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-800">
              {status === 'loading' ? '...' : lowStockCount}
            </h3>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[12px] font-semibold">
                Needs Attention
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
