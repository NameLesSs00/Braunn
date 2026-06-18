import { useState } from 'react';
import { useAppDispatch } from '../../../../../store/hooks';
import { claimFoundItem, claimLostItem } from '../../../../../features/HKfeatures/lostAndFound/lostAndFoundSlice';
import { Modal } from './Modal';
import type { LostAndFoundReadDto } from '../../../../../models/HKmodels/LostAndFound';
import { FiClock, FiBox, FiCheck, FiSearch } from 'react-icons/fi';
import { useAppSelector } from '../../../../../store/hooks';
import { fetchHrEmployees } from '../../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { getGuestByPhoneNumber } from '../../../../../shared/apis/guestsApi';
import type { Guest } from '../../../../../models/Guest';
import { useEffect } from 'react';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LostAndFoundReadDto | null;
}

export function ItemDetailsModal({ isOpen, onClose, item }: ItemDetailsModalProps) {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector(state => state.hrEmployees);
  const [claimId, setClaimId] = useState('');
  
  // Guest search state for Found items
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestsResult, setGuestsResult] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isSearchingGuest, setIsSearchingGuest] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClaimInput, setShowClaimInput] = useState(false);

  useEffect(() => {
    if (isOpen && showClaimInput && item?.type === 'Lost') {
      dispatch(fetchHrEmployees({ PageSize: 100, PageNumber: 1 }));
    }
  }, [isOpen, showClaimInput, item, dispatch]);

  const handleSearchGuest = async () => {
    if (!phoneNumber) return;
    setIsSearchingGuest(true);
    setGuestSearchError('');
    setGuestsResult([]);
    setSelectedGuest(null);
    setClaimId('');
    try {
      const g = await getGuestByPhoneNumber(phoneNumber);
      if (g && Array.isArray(g) && g.length > 0) {
        setGuestsResult(g);
      } else {
        setGuestSearchError('No guests found');
      }
    } catch (e: any) {
      setGuestSearchError(e.message || 'Error searching guest');
    } finally {
      setIsSearchingGuest(false);
    }
  };

  if (!item) return null;

  const handleClaim = async () => {
    if (!claimId.trim()) return;
    setIsSubmitting(true);
    if (item.type === 'Lost') {
      await dispatch(claimLostItem({ id: item.id, employeeId: claimId }));
    } else {
      await dispatch(claimFoundItem({ id: item.id, guestId: claimId }));
    }
    setIsSubmitting(false);
    setShowClaimInput(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lost/Found Item Details"
      subtitle={`Item #${item.id}`}
      maxWidth="max-w-3xl"
    >
      <div className="p-8 flex flex-col gap-8">
        
        {/* Badges */}
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[14px] font-bold ${
            item.type === 'Lost' ? 'border-red-200 text-red-500 bg-red-50' : 'border-blue-200 text-[#0a4bbd] bg-blue-50/50'
          }`}>
            {/* @ts-ignore */}
            <FiClock className="w-4 h-4" />
            <span className="capitalize">{item.type}</span>
          </div>
          <div className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 bg-white text-[14px] font-bold">
            {item.categoryName}
          </div>
          {item.isClaimed && (
            <div className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-500 bg-emerald-50 text-[14px] font-bold flex items-center gap-1">
              {/* @ts-ignore */}
              <FiCheck className="w-4 h-4" /> Claimed
            </div>
          )}
        </div>

        {/* Item Information Card */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            {/* @ts-ignore */}
            <FiBox className="w-5 h-5 text-[#0a4bbd]" />
            <span className="font-bold text-[15px] text-slate-800">Item Information</span>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Item Name:</span>
                <span className="font-bold text-slate-800">{item.itemName}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Date Logged:</span>
                <span className="font-bold text-slate-800">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-800">{item.location}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Room:</span>
                <span className="font-bold text-slate-800">Room {item.roomNo}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Associated Guest:</span>
                <span className="font-bold text-slate-800">{item.guestName || 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-500">Associated Employee:</span>
                <span className="font-bold text-slate-800">{item.employeeName || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-[15px] text-slate-800">Description & Notes</h3>
          <p className="text-[14px] text-slate-700 whitespace-pre-wrap">
            {item.description || item.notes || 'No description provided.'}
          </p>
        </div>

        {/* Claim Action */}
        {!item.isClaimed && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[15px] text-emerald-800">Process Claim</h3>
                <p className="text-[13px] text-emerald-600">Mark this item as returned/claimed.</p>
              </div>
              {!showClaimInput && (
                <button 
                  onClick={() => setShowClaimInput(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
                >
                  Claim Item
                </button>
              )}
            </div>
            
            {showClaimInput && (
              <div className="flex flex-col gap-3 mt-2 border-t border-emerald-100 pt-4">
                {item.type === 'Lost' ? (
                  <>
                    <label className="text-[13px] font-bold text-emerald-800">Employee (who claimed it)</label>
                    <div className="flex gap-3">
                      <select 
                        value={claimId} onChange={(e) => setClaimId(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-500 bg-white"
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleClaim}
                        disabled={isSubmitting || !claimId}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Confirm'}
                      </button>
                      <button 
                        onClick={() => setShowClaimInput(false)}
                        className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="text-[13px] font-bold text-emerald-800">Guest Phone Number (who claimed it)</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g., +12025550123"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleSearchGuest}
                          disabled={isSearchingGuest || !phoneNumber}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {/* @ts-ignore */}
                          <FiSearch className="w-4 h-4" />
                          {isSearchingGuest ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      {guestSearchError && (
                        <span className="text-[13px] text-red-500">{guestSearchError}</span>
                      )}

                      {guestsResult.length > 0 && !selectedGuest && (
                        <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto border border-emerald-100 rounded-xl p-2 bg-emerald-50/30">
                          {guestsResult.map(g => (
                            <div 
                              key={g.id} 
                              onClick={() => { setSelectedGuest(g); setClaimId(g.id); }}
                              className="p-3 bg-white hover:border-emerald-400 border border-emerald-100 rounded-lg cursor-pointer transition-colors shadow-sm"
                            >
                              <div className="text-[14px] font-bold text-slate-800">{g.fullName || `${g.firstName} ${g.lastName}`}</div>
                              <div className="text-[13px] text-slate-500">{g.phone} • {g.email}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedGuest && (
                        <div className="flex gap-3 items-center mt-2 p-3 bg-white border border-emerald-200 rounded-xl">
                          <div className="flex-1">
                            <div className="text-[14px] font-bold text-emerald-800">{selectedGuest.fullName || `${selectedGuest.firstName} ${selectedGuest.lastName}`}</div>
                            <div className="text-[13px] text-emerald-600">{selectedGuest.phone} • {selectedGuest.email}</div>
                          </div>
                          <button 
                            onClick={handleClaim}
                            disabled={isSubmitting || !claimId}
                            className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Processing...' : 'Confirm Claim'}
                          </button>
                          <button 
                            onClick={() => {
                              setShowClaimInput(false);
                              setSelectedGuest(null);
                              setGuestsResult([]);
                              setPhoneNumber('');
                              setClaimId('');
                            }}
                            className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <button 
          onClick={onClose}
          className="w-full py-4 rounded-xl border-2 border-slate-300 text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-colors mt-2"
        >
          Close
        </button>

      </div>
    </Modal>
  );
}
