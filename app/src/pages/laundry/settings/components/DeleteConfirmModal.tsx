import { FiAlertCircle } from 'react-icons/fi';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
          {/* @ts-ignore */}
          <FiAlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-[18px] font-bold text-slate-800 mb-1">Delete "{itemName}"?</h2>
        <p className="text-[13px] text-slate-400 mb-6">
          This action cannot be undone. The record will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-red-500 text-[14px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
