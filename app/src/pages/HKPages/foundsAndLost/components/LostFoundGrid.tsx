import { FiSmartphone, FiWatch, FiBriefcase, FiFileText, FiLink } from 'react-icons/fi';
import type { LostAndFoundReadDto } from '../../../../models/HKmodels/LostAndFound';

interface LostFoundGridProps {
  items: LostAndFoundReadDto[];
  onItemClick: (item: LostAndFoundReadDto) => void;
}

export function LostFoundGrid({ items, onItemClick }: LostFoundGridProps) {
  // Helper to map category to an icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      // @ts-ignore
      case 'Electronics': return <FiSmartphone className="w-5 h-5 text-slate-700" />;
      // @ts-ignore
      case 'Jewelry': return <FiWatch className="w-5 h-5 text-slate-700" />;
      // @ts-ignore
      case 'Clothing': return <FiBriefcase className="w-5 h-5 text-slate-700" />;
      // @ts-ignore
      case 'Documents': return <FiFileText className="w-5 h-5 text-slate-700" />;
      // @ts-ignore
      case 'Accessories': return <FiLink className="w-5 h-5 text-slate-700" />;
      // @ts-ignore
      default: return <FiSmartphone className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div 
          key={item.id}
          onClick={() => onItemClick(item)}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-6"
        >
          {/* Top row: Icon and Status */}
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              {getCategoryIcon(item.categoryName)}
            </div>
            {!item.isClaimed ? (
              <span className="px-3 py-1 rounded-full border border-amber-200 text-amber-500 text-[12px] font-bold bg-amber-50">
                unclaimed
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full border border-emerald-200 text-emerald-500 text-[12px] font-bold bg-emerald-50">
                claimed
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold text-slate-800 line-clamp-2 min-h-[44px]">
            {item.itemName}
          </h3>

          {/* Details */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className="font-medium">Room:</span>
              <span>{item.roomNo}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              {/* Using a simple clock icon representation or just text */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span>{item.guestName || item.employeeName || 'Unknown'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
