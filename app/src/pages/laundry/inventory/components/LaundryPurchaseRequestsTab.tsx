import { useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchLaundryPurchases, setPurchasesPage } from '../../../../features/Laundryfeatures/laundryPurchases/laundryPurchasesSlice';

export function LaundryPurchaseRequestsTab() {
  const dispatch = useAppDispatch();
  const { items, totalCount, status, params } = useAppSelector((state) => state.laundryPurchases);

  useEffect(() => {
    dispatch(fetchLaundryPurchases(params));
  }, [dispatch, params]);

  const handlePageChange = (page: number) => {
    dispatch(setPurchasesPage(page));
  };

  const currentPage = params.PageNumber || 1;
  const itemsPerPage = params.PageSize || 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const isLoading = status === 'loading';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200">
              {['Request ID', 'Date', 'Supplier', 'Items Ordered', 'Created By'].map((col) => (
                <th key={col} className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-slate-500">
                  Loading purchase requests...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-slate-500">
                  No purchase requests found.
                </td>
              </tr>
            ) : (
              items.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[14px] font-semibold text-[#0a4bbd]">
                    REQ-{request.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-slate-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-800">
                    {request.supplierName}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {request.purchaseItems.map((pi) => (
                        <span key={pi.id || pi.itemId} className="text-[13px] text-slate-600 bg-slate-100 px-2 py-1 rounded w-max">
                          {pi.itemName || `Item #${pi.itemId}`} <span className="font-semibold ml-1">x{pi.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-slate-600">
                    {request.createdBy || 'System'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-[13px] text-slate-500">
            Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} requests
          </span>
          <div className="flex items-center -space-x-px mt-4 sm:mt-0">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 rounded-l-md bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {pages.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`px-3.5 py-1.5 border text-sm font-medium transition-colors ${
                    currentPage === p
                      ? 'border-[#0a4bbd] bg-blue-50 text-[#0a4bbd] z-10'
                      : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-300 rounded-r-md bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              {/* @ts-ignore */}
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
