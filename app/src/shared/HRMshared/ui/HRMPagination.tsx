import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type Props = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string; // e.g. "employees"
  disabled?: boolean;
};

const navBtn =
  'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#0B4EA2] hover:text-[#0B4EA2] hover:bg-[#EEF4FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:hover:bg-white';

function buildPages(page: number, totalPages: number): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];
  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);

  // Keep a constant number of buttons near the edges so the bar doesn't jump around
  if (page <= 3) end = 5;
  if (page >= totalPages - 2) start = totalPages - 4;

  if (start > 2) pages.push('ellipsis-left');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis-right');
  pages.push(totalPages);
  return pages;
}

export function HRMPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  label = 'results',
  disabled = false,
}: Props) {
  const safeTotalPages = Math.max(1, totalPages);
  const [jumpValue, setJumpValue] = useState('');

  useEffect(() => {
    setJumpValue('');
  }, [page]);

  const goTo = (p: number) => {
    const target = Math.min(safeTotalPages, Math.max(1, p));
    if (target !== page && !disabled) onPageChange(target);
  };

  const handleJump = () => {
    const n = parseInt(jumpValue, 10);
    if (!Number.isNaN(n)) goTo(n);
    setJumpValue('');
  };

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const fmt = (n: number) => n.toLocaleString();

  const isFirst = page <= 1;
  const isLast = page >= safeTotalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: summary + page size */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-[13px] text-slate-500">
          Showing <span className="font-semibold text-slate-800">{fmt(start)}</span>
          {' – '}
          <span className="font-semibold text-slate-800">{fmt(end)}</span> of{' '}
          <span className="font-semibold text-slate-800">{fmt(totalCount)}</span> {label}
        </span>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-[13px] text-slate-500">
            Rows per page
            <div className="relative">
              <select
                id="hrm-pagination-page-size"
                value={pageSize}
                disabled={disabled}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[13px] font-semibold text-slate-700 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 disabled:opacity-50 cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">▼</span>
            </div>
          </label>
        )}
      </div>

      {/* Right: navigation */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" id="hrm-pagination-first" title="First page" className={navBtn} disabled={isFirst || disabled} onClick={() => goTo(1)}>
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button type="button" id="hrm-pagination-prev" title="Previous page" className={navBtn} disabled={isFirst || disabled} onClick={() => goTo(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPages(page, safeTotalPages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="grid h-9 w-7 place-items-center text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => goTo(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-9 min-w-[36px] rounded-lg px-2.5 text-[13px] font-semibold transition-all disabled:cursor-not-allowed ${
                p === page
                  ? 'bg-[#0B4EA2] text-white shadow-sm shadow-[#0B4EA2]/30'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0B4EA2] hover:text-[#0B4EA2] hover:bg-[#EEF4FF]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button type="button" id="hrm-pagination-next" title="Next page" className={navBtn} disabled={isLast || disabled} onClick={() => goTo(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" id="hrm-pagination-last" title="Last page" className={navBtn} disabled={isLast || disabled} onClick={() => goTo(safeTotalPages)}>
          <ChevronsRight className="h-4 w-4" />
        </button>

        {safeTotalPages > 7 && (
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3 text-[13px] text-slate-500">
            Go to
            <input
              id="hrm-pagination-jump"
              type="number"
              min={1}
              max={safeTotalPages}
              value={jumpValue}
              disabled={disabled}
              placeholder={String(page)}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJump();
              }}
              onBlur={() => jumpValue && handleJump()}
              className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-[13px] font-semibold text-slate-700 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
