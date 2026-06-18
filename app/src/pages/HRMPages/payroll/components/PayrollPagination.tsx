import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startRecord: number;
  endRecord: number;
  totalRecords: number;
  label: string; // e.g. "records" or "employees"
};

export function PayrollPagination({ page, totalPages, onPageChange, startRecord, endRecord, totalRecords, label }: Props) {
  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-7 py-4">
      <span className="text-[13px] text-slate-500 uppercase tracking-wide font-bold">
        Showing {startRecord} to {endRecord} of {totalRecords} {label}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-[#0B4EA2] hover:text-[#0B4EA2] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`grid h-8 w-8 place-items-center rounded-lg text-[13px] font-semibold transition-colors ${
                page === p
                  ? 'bg-[#0B4EA2] text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-[#0B4EA2] hover:text-[#0B4EA2]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-[#0B4EA2] hover:text-[#0B4EA2] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
