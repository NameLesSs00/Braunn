import { FilterType } from '../types';

type Props = {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  recordCount: number;
  onAddClick: () => void;
};

export function SalaryIncrementsFilters({ activeFilter, setActiveFilter, recordCount, onAddClick }: Props) {
  const filters: FilterType[] = ['All', 'Pending', 'HR Approved', 'Active'];

  return (
    <div className="p-6 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700">{recordCount} records</span>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <button 
        onClick={onAddClick}
        className="bg-[#0B4EA2] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#0a428a] transition-colors flex items-center gap-2"
      >
        <span>+</span> Add Increment
      </button>
    </div>
  );
}
