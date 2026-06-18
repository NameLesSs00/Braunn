import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';

export function Pagination() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-white border border-t-0 border-slate-200 rounded-b-xl">
      <div className="text-sm text-slate-500 mb-4 sm:mb-0">
        Showing 1 to 6 of 48 items
      </div>
      <div className="flex items-center -space-x-px">
        <button className="px-3 py-2 border border-slate-300 rounded-l-md bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
          <FiChevronsLeft className="w-4 h-4" />
        </button>
        <button className="px-3.5 py-1.5 border border-[#0a4bbd] bg-[#0a4bbd] text-white text-sm font-medium">
          1
        </button>
        <button className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 text-sm font-medium">
          2
        </button>
        <button className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 text-sm font-medium">
          3
        </button>
        <span className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 text-sm font-medium">
          ...
        </span>
        <button className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 text-sm font-medium">
          8
        </button>
        <button className="px-3 py-2 border border-slate-300 rounded-r-md bg-white text-slate-500 hover:bg-slate-50">
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
