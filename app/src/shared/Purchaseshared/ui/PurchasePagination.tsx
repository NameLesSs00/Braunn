import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PurchasePaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  disabled?: boolean;
}

const navBtn =
  'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#0B4EA2] hover:text-[#0B4EA2] hover:bg-[#EEF4FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:hover:bg-white';

function buildPages(page: number, totalPages: number): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];
  let start = Math.max(2, page - 1);
  let end = Math.min(totalPages - 1, page + 1);

  if (page <= 3) end = 5;
  if (page >= totalPages - 2) start = totalPages - 4;

  if (start > 2) pages.push('ellipsis-left');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis-right');
  pages.push(totalPages);
  return pages;
}

export function PurchasePagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  label = 'suppliers',
  disabled = false,
}: PurchasePaginationProps) {
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-[#0B4EA2] focus:outline-none disabled:opacity-40"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: navigation buttons + jump */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={isFirst || disabled}
          aria-label="First page"
          className={navBtn}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={isFirst || disabled}
          aria-label="Previous page"
          className={navBtn}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {buildPages(page, safeTotalPages).map((item, idx) => {
            if (typeof item !== 'number') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="grid h-9 w-6 place-items-center text-[13px] text-slate-400"
                >
                  …
                </span>
              );
            }

            const active = item === page;
            return (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                disabled={disabled}
                className={`grid h-9 min-w-9 px-2 place-items-center rounded-lg text-[13px] font-semibold transition-all ${
                  active
                    ? 'bg-[#0B4EA2] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-[#0B4EA2] hover:text-[#0B4EA2] hover:bg-[#EEF4FF]'
                } disabled:opacity-40`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={isLast || disabled}
          aria-label="Next page"
          className={navBtn}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => goTo(safeTotalPages)}
          disabled={isLast || disabled}
          aria-label="Last page"
          className={navBtn}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>

        {/* Quick jump to page */}
        {safeTotalPages > 5 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJump();
            }}
            className="ml-2 flex items-center gap-1.5 pl-2 border-l border-slate-200"
          >
            <span className="text-[12px] text-slate-400">Go to:</span>
            <input
              type="number"
              min={1}
              max={safeTotalPages}
              value={jumpValue}
              disabled={disabled}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder={String(page)}
              className="h-8 w-12 rounded-lg border border-slate-200 px-1.5 text-center text-[12px] font-medium text-slate-700 transition-colors focus:border-[#0B4EA2] focus:outline-none disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </form>
        )}
      </div>
    </div>
  );
}
