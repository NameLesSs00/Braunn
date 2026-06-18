import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../../store/hooks';
import { updateLocalARISingleDayRate } from '../../../../features/localAri/localAriSlice';
import Swal from 'sweetalert2';

interface EditRatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  singleDayData?: {
    roomTypeId: string;
    roomTypeName: string;
    date: string;
    ratePlanCode: string;
    currentBaseRate?: number;
  };
  onSaveSuccess?: () => void;
}

export function EditRatePopup({ isOpen, onClose, singleDayData, onSaveSuccess }: EditRatePopupProps) {
  const dispatch = useAppDispatch();
  const [newBaseRate, setNewBaseRate] = useState<number>(0);
  const [baseRate, setBaseRate] = useState('180€');
  const [corporateRate, setCorporateRate] = useState('150€');
  const [discount, setDiscount] = useState('0');
  const [minStay, setMinStay] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (singleDayData) {
        setNewBaseRate(singleDayData.currentBaseRate ?? 0);
      }
      setErrorMsg(null);
    }
  }, [isOpen, singleDayData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (singleDayData) {
      setIsSaving(true);
      setErrorMsg(null);
      try {
        const resultAction = await dispatch(updateLocalARISingleDayRate({
          roomTypeId: singleDayData.roomTypeId,
          ratePlanCode: singleDayData.ratePlanCode,
          date: singleDayData.date,
          newBaseRate: Number(newBaseRate)
        }));

        if (updateLocalARISingleDayRate.fulfilled.match(resultAction)) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Rate updated successfully.',
            timer: 2000,
            showConfirmButton: false,
            scrollbarPadding: false
          });
          if (onSaveSuccess) onSaveSuccess();
          onClose();
        } else {
          setErrorMsg(resultAction.payload as string ?? 'Failed to update rate');
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'An error occurred while saving.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Bulk Edit Dummy onClose
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-10">
            <h2 className="text-xl font-bold text-slate-800 mb-8">
              {singleDayData ? 'Edit Single Day Rate' : 'Edit Rate'}
            </h2>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-6">
              {singleDayData ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
                    <input 
                      type="text"
                      value={singleDayData.roomTypeName}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input 
                      type="text"
                      value={singleDayData.date}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Rate Plan Code</label>
                    <input 
                      type="text"
                      value={singleDayData.ratePlanCode}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Base Rate</label>
                    <input 
                      type="number"
                      value={newBaseRate}
                      onChange={(e) => setNewBaseRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] text-slate-800 transition-all font-medium"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Base Rate</label>
                    <input 
                      type="text"
                      value={baseRate}
                      onChange={(e) => setBaseRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] text-slate-800 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Corporate Rate</label>
                    <input 
                      type="text"
                      value={corporateRate}
                      onChange={(e) => setCorporateRate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] text-slate-800 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount %</label>
                    <input 
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] text-slate-800 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum Stay (Nights)</label>
                    <input 
                      type="number"
                      value={minStay}
                      onChange={(e) => setMinStay(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] text-slate-800 transition-all font-medium"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-end gap-4">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-[#004bb4] text-white font-bold hover:bg-blue-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </>
  );
}

