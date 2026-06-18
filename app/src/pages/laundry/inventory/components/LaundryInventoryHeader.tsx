import { FiBox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { routes } from '../../../../shared/lib/routes';

export function LaundryInventoryHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EEF4FF]">
            {/* @ts-ignore */}
            <FiBox className="w-5 h-5 text-[#0a4bbd]" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 leading-tight">Inventory Management</h1>
            <p className="text-[13px] text-slate-400">Manage and track laundry inventory items</p>
          </div>
        </div>
      </div>

      <nav aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
          <li>
            <Link
              to={routes.laundry.overview}
              className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors"
            >
              Laundry
            </Link>
          </li>
          <li><span className="text-slate-300">/</span></li>
          <li className="font-semibold text-[#0B4EA2]">Inventory Management</li>
        </ol>
      </nav>
    </div>
  );
}
