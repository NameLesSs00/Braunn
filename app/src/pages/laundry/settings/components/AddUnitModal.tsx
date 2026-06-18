import { useEffect, useRef, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

interface AddUnitModalProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function AddUnitModal({ isOpen, onConfirm, onCancel, isSaving }: AddUnitModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {/* @ts-ignore */}
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#EEF4FF] mx-auto mb-4">
          {/* @ts-ignore */}
          <FiPlus className="w-6 h-6 text-[#0a4bbd]" />
        </div>

        <h2 className="text-[18px] font-bold text-slate-800 text-center mb-1">Add New Unit</h2>
        <p className="text-[13px] text-slate-400 text-center mb-5">
          Enter a name for the new laundry inventory unit.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Unit Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kilogram, Piece, Liter…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[14px] text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/30 focus:border-[#0a4bbd] transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#0a4bbd] text-[14px] font-semibold text-white hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Adding…
                </>
              ) : (
                'Add Unit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
