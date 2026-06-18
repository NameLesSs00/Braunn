import { FiSearch } from 'react-icons/fi';

interface LostFoundControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filter: 'All' | 'unclaimed' | 'claimed';
  setFilter: (val: 'All' | 'unclaimed' | 'claimed') => void;
}

export function LostFoundControls({ searchQuery, setSearchQuery, filter, setFilter }: LostFoundControlsProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search Bar */}
      <div className="relative w-full">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Room Number ,item"
          className="bg-white w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
        />
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-6 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
            filter === 'All' 
              ? 'bg-[#0a4bbd] text-white shadow-sm' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('unclaimed')}
          className={`px-6 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
            filter === 'unclaimed' 
              ? 'bg-[#0a4bbd] text-white shadow-sm' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unclaimed
        </button>
        <button
          onClick={() => setFilter('claimed')}
          className={`px-6 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
            filter === 'claimed' 
              ? 'bg-[#0a4bbd] text-white shadow-sm' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Claimed
        </button>
      </div>
    </div>
  );
}
