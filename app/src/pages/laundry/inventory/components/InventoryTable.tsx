import { useState } from 'react';
import { InventoryItem } from '../mockData';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';

interface StatusBadgeProps {
  status: InventoryItem['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let borderColor = '';

  switch (status) {
    case 'In Stock':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-500';
      break;
    case 'Low Stock':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-500';
      break;
    case 'Out of Stock':
      bgColor = 'bg-red-100';
      textColor = 'text-red-500';
      break;
  }

  return (
    <span className={`inline-flex items-center justify-center px-4 py-1 text-[12px] font-medium rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

interface InventoryTableProps {
  data: InventoryItem[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200">
              {['ITE CODE', 'ITEM NAME', 'CATEGORY', 'UNIT', 'CURRENT STOCK', 'MINIMUM LEVEL', 'STATUS', 'LAST UPDATED', 'ACTIONS'].map((col) => (
                <th
                  key={col}
                  className={`px-6 py-4 text-[12px] font-bold text-slate-700 ${col === 'ACTIONS' ? 'text-center' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((item) => {
              const isStockLow = item.status === 'Low Stock' || item.status === 'Out of Stock';
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[14px] font-bold text-slate-700">{item.code}</td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-500">{item.name}</td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-500">{item.category}</td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-500">{item.unit}</td>
                  <td className={`px-6 py-5 text-[14px] font-bold text-center ${isStockLow ? 'text-red-600' : 'text-slate-700'}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-500 text-center">{item.minLevel}</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-5 text-[14px] font-medium text-slate-500">{item.lastUpdated}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="px-5 py-2 text-[12px] font-semibold text-white bg-[#0a4bbd] rounded-xl hover:bg-blue-800 transition-colors">
                        Withdraw
                      </button>
                      <button
                        className={`px-5 py-2 text-[12px] font-semibold text-white rounded-xl transition-colors ${
                          isStockLow ? 'bg-[#d32f2f] hover:bg-red-700' : 'bg-[#d1d5db] cursor-not-allowed'
                        }`}
                        disabled={!isStockLow}
                      >
                        order
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
        <span className="text-[13px] text-slate-500">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} items
        </span>

        <div className="flex items-center -space-x-px mt-4 sm:mt-0">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-slate-300 rounded-l-md bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>
          
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3.5 py-1.5 border text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'border-[#0a4bbd] bg-blue-50 text-[#0a4bbd] z-10'
                  : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <span className="px-3.5 py-1.5 border border-slate-300 bg-white text-slate-500 text-sm font-medium">
            ...
          </span>
          
          <button
            onClick={() => handlePageChange(8)}
            className={`px-3.5 py-1.5 border text-sm font-medium transition-colors ${
              currentPage === 8
                ? 'border-[#0a4bbd] bg-blue-50 text-[#0a4bbd] z-10'
                : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            8
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-slate-300 rounded-r-md bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
