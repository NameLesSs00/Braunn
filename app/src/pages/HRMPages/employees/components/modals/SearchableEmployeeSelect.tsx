import { useState, useRef, useEffect } from 'react';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';
import { Search, ChevronDown, Check } from 'lucide-react';

type Props = {
  employees: HREmployeeReadDto[];
  value: string;
  onChange: (id: string) => void;
};

export function SearchableEmployeeSelect({ employees, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEmp = employees.find(e => e.id === value);
  
  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) || 
    (emp.departmentName && emp.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 cursor-pointer hover:border-[#0B4EA2] transition-colors"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch('');
        }}
      >
        <span className={selectedEmp ? 'text-slate-800' : 'text-slate-400'}>
          {selectedEmp ? `${selectedEmp.fullName} - ${selectedEmp.departmentName || 'No Dept'}` : 'Search and select an employee...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[250px]">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Type to search..."
              className="w-full text-[13px] outline-none text-slate-800 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto p-1">
            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-slate-400">
                No employees found matching "{search}"
              </div>
            ) : (
              filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] cursor-pointer transition-colors ${
                    value === emp.id ? 'bg-[#0B4EA2]/5 text-[#0B4EA2] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  onClick={() => {
                    onChange(emp.id);
                    setIsOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{emp.fullName}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">{emp.departmentName || 'No Dept'}</div>
                  </div>
                  {value === emp.id && <Check className="w-4 h-4" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
