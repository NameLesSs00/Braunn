import { useState } from 'react';
import { X, Check, ArrowRight, Copy } from 'lucide-react';

interface CopyWeekRatesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const weeks = [
  { id: 1, name: 'Week 1', dateRange: 'Dec 1-7' },
  { id: 2, name: 'Week 2', dateRange: 'Dec 8-14' },
  { id: 3, name: 'Week 3', dateRange: 'Dec 15-21' },
  { id: 4, name: 'Week 4', dateRange: 'Dec 22-28' },
  { id: 5, name: 'Week 5', dateRange: 'Dec 29-31' },
];

export function CopyWeekRatesPopup({ isOpen, onClose }: CopyWeekRatesPopupProps) {
  const [sourceWeek, setSourceWeek] = useState<number | null>(1);
  const [targetWeeks, setTargetWeeks] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleTargetWeekToggle = (id: number) => {
    setTargetWeeks(prev => 
      prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
    );
  };

  const isSubmitEnabled = sourceWeek !== null && targetWeeks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#004bb4] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Copy Week Rates</h2>
            <p className="text-blue-100 text-sm mt-1">Copy rates from one week to multiple weeks across all room types</p>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Step 1: Select Source Week */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#004bb4] text-white flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-bold text-slate-800">Select Source Week</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-11">
              {weeks.map(week => {
                const isSelected = sourceWeek === week.id;
                return (
                  <div
                    key={week.id}
                    onClick={() => {
                      setSourceWeek(week.id);
                      if (targetWeeks.includes(week.id)) {
                        setTargetWeeks(prev => prev.filter(id => id !== week.id));
                      }
                    }}
                    className={`rounded-xl p-4 relative cursor-pointer border-2 transition-all ${
                      isSelected 
                        ? 'border-[#004bb4] bg-blue-50/50' 
                        : 'border-slate-200 border bg-white hover:border-blue-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-[#004bb4]" />
                      </div>
                    )}
                    <div className="text-sm text-slate-400 font-medium mb-1">Week {week.id}</div>
                    <div className="font-bold text-slate-800 mb-1">{week.name}</div>
                    <div className="text-sm text-slate-500">{week.dateRange}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Separator / Arrow */}
          <div className="flex justify-center pl-11">
            <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-full text-slate-600 font-semibold border border-slate-100 shadow-sm">
              Copy rates to <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 2: Select Target Week(s) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#004bb4] text-white flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-bold text-slate-800">Select Target Week(s)</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-11">
              {weeks.filter(w => w.id !== sourceWeek).map(week => {
                const isSelected = targetWeeks.includes(week.id);
                return (
                  <div
                    key={week.id}
                    onClick={() => handleTargetWeekToggle(week.id)}
                    className={`rounded-xl p-4 relative cursor-pointer border-2 transition-all ${
                      isSelected 
                        ? 'border-green-600 bg-green-50/50' 
                        : 'border-slate-200 border bg-white hover:border-green-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    <div className="text-sm text-slate-400 font-medium mb-1">Week {week.id}</div>
                    <div className="font-bold text-slate-800 mb-1">{week.name}</div>
                    <div className="text-sm text-slate-500">{week.dateRange}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex items-center justify-end gap-3 pt-6">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!isSubmitEnabled}
            className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              isSubmitEnabled 
                ? 'bg-[#004bb4] text-white hover:bg-blue-800 cursor-pointer shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Copy className="w-4 h-4" />
            Copy Rates
          </button>
        </div>
      </div>
    </div>
  );
}
