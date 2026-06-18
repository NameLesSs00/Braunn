import { Upload, FileText } from 'lucide-react';
import { Employee } from '../EmployeesTable';

type Props = {
  employee: Employee;
};

const documents = [
  { name: 'Employment Contract', type: 'PDF', size: '245 KB', date: '2020-01-10' },
  { name: 'National ID Copy', type: 'PDF', size: '128 KB', date: '2020-01-10' },
  { name: 'Academic Certificate', type: 'PDF', size: '389 KB', date: '2020-01-12' },
  { name: 'Performance Review Q1 2026', type: 'PDF', size: '156 KB', date: '2026-03-15' },
];

export function EmployeeDocumentsTab({}: Props) {
  return (
    <div className="space-y-6">
      {/* KPI Cards Wrapper */}
      <div className="bg-white border border-slate-200 rounded-[20px] p-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Current Salary */}
          <div className="bg-[#EEF4FF] rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-[#0B4EA2] mb-2">Current Salary</div>
            <div className="text-[26px] font-bold text-[#0B4EA2] leading-none mb-1">$95,000</div>
            <div className="text-[11px] font-medium text-[#4A7FCC]">Annual</div>
          </div>

          {/* Total Growth */}
          <div className="bg-[#F0FDF4] rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-[#16A34A] mb-2">Total Growth</div>
            <div className="text-[26px] font-bold text-[#16A34A] leading-none">+$13,000</div>
          </div>

          {/* Last Increment */}
          <div className="bg-amber-50 rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-amber-600 mb-2">Last Increment</div>
            <div className="text-[26px] font-bold text-amber-500 leading-none mb-1">+5.56%</div>
            <div className="text-[11px] font-medium text-amber-400">2026-01-01</div>
          </div>

          {/* Increment Count */}
          <div className="bg-purple-50 rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-purple-600 mb-2">Increment Count</div>
            <div className="text-[26px] font-bold text-purple-700 leading-none mb-1">3</div>
            <div className="text-[11px] font-medium text-purple-400">Total adjustments</div>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 h-14 px-6 rounded-lg bg-[#0B4EA2] text-[16px] font-semibold text-white hover:bg-[#093c80] transition-colors">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Documents List */}
      <div>
        <div className="text-[13px] font-semibold text-slate-500 mb-3">
          {documents.length} documents
        </div>
        <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors ${
                idx < documents.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* File Icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-red-50 border border-red-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-400" />
              </div>

              {/* File Info */}
              <div className="flex-1">
                <div className="text-[13px] font-bold text-slate-800">{doc.name}</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {doc.type} · {doc.size} · {doc.date}
                </div>
              </div>

              {/* Download Link */}
              <button className="flex-shrink-0 text-[13px] font-bold text-[#0B4EA2] hover:text-[#093c80] transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
