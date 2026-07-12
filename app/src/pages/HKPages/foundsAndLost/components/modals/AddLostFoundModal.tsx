import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { createLostAndFoundItem } from '../../../../../features/HKfeatures/lostAndFound/lostAndFoundSlice';
import { fetchLostFoundCategories } from '../../../../../features/HKfeatures/lostFoundCategories/lostFoundCategoriesSlice';
import { Modal } from './Modal';
import { FiBox, FiSearch } from 'react-icons/fi';
import { fetchHrEmployees } from '../../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { searchGuests } from '../../../../../shared/apis/guestsApi';
import { getRooms } from '../../../../../shared/apis/roomsApi';
import type { Guest } from '../../../../../models/Guest';
import type { Room } from '../../../../../models/Room';

interface AddLostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLostFoundModal({ isOpen, onClose }: AddLostFoundModalProps) {
  const dispatch = useAppDispatch();
  const { categories, status: catStatus } = useAppSelector(state => state.lostFoundCategories);
  const { employees } = useAppSelector(state => state.hrEmployees);

  const [type, setType] = useState<'Found' | 'Lost'>('Found');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  
  // Input states
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [notes, setNotes] = useState('');
  
  // Person state
  const [employeeId, setEmployeeId] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [guestsResult, setGuestsResult] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isSearchingGuest, setIsSearchingGuest] = useState(false);
  const [guestSearchError, setGuestSearchError] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (catStatus === 'idle') {
        dispatch(fetchLostFoundCategories());
      }
      dispatch(fetchHrEmployees({ PageSize: 100, PageNumber: 1 }));
      getRooms().then(data => setRooms(data || [])).catch(e => console.error(e));
    }
  }, [isOpen, catStatus, dispatch]);

  const handleSearchGuest = async () => {
    if (!searchQuery) return;
    setIsSearchingGuest(true);
    setGuestSearchError('');
    setGuestsResult([]);
    setSelectedGuest(null);
    try {
      const g = await searchGuests(searchQuery);
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

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!itemName || !categoryId || !location) return; // basic validation
    
    setIsSubmitting(true);
    
    const payload = {
      type,
      notes,
      itemName,
      description,
      categoryId: Number(categoryId),
      location,
      guestId: type === 'Lost' ? (selectedGuest?.id || null) : null,
      employeeId: type === 'Found' ? (employeeId || null) : null,
      roomNo,
    };

    await dispatch(createLostAndFoundItem(payload));
    setIsSubmitting(false);
    
    // Reset form
    setItemName('');
    setDescription('');
    setLocation('');
    setRoomNo('');
    setNotes('');
    setEmployeeId('');
    setSearchQuery('');
    setGuestsResult([]);
    setSelectedGuest(null);
    setGuestSearchError('');
    setCategoryId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Lost/Found Item"
      subtitle="Register a new item in the system"
      maxWidth="max-w-4xl"
    >
      <div className="p-8 flex flex-col gap-8">
        
        {/* Item Status */}
        <div className="flex flex-col gap-3">
          <label className="text-[14px] font-bold text-slate-700">Item Status <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-6">
            <div 
              onClick={() => setType('Found')}
              className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                type === 'Found' ? 'border-[#0a4bbd] bg-[#f4f7fa]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {/* @ts-ignore */}
                <FiBox className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[15px] font-bold ${type === 'Found' ? 'text-[#0a4bbd]' : 'text-slate-800'}`}>Found Item</span>
                <span className="text-[13px] text-slate-500">Item was found by staff</span>
              </div>
            </div>

            <div 
              onClick={() => setType('Lost')}
              className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                type === 'Lost' ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type === 'Lost' ? 'bg-red-100' : 'bg-slate-100'}`}>
                {/* @ts-ignore */}
                <FiBox className={`w-5 h-5 ${type === 'Lost' ? 'text-red-500' : 'text-slate-600'}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[15px] font-bold ${type === 'Lost' ? 'text-red-500' : 'text-slate-800'}`}>Lost Item</span>
                <span className={`text-[13px] ${type === 'Lost' ? 'text-red-400' : 'text-slate-500'}`}>Reported by guest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Name */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-700">Item Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={itemName} onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., iPhone 13, Gold Ring"
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px]"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] bg-white"
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-700">Description</label>
            <textarea 
              placeholder="Provide detailed description (color, brand, unique features)..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-700">Location Last Seen <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lobby, Restaurant, Pool Area"
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px]"
            />
          </div>
          
          {rooms.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-slate-700">Room Number</label>
              <select 
                value={roomNo} onChange={(e) => setRoomNo(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] bg-white"
              >
                <option value="">Select Room</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.roomNumber}>{r.roomNumber}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {type === 'Lost' ? (
              <>
                <label className="text-[14px] font-semibold text-slate-700">Search Guest (Reporting)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, ID, or phone..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={handleSearchGuest}
                    disabled={isSearchingGuest || !searchQuery}
                    className="px-4 py-3 rounded-xl bg-[#0a4bbd] hover:bg-blue-800 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
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
                  <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {guestsResult.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => setSelectedGuest(g)}
                        className="p-3 bg-white hover:border-[#0a4bbd] border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-sm"
                      >
                        <div className="text-[14px] font-bold text-slate-800">{g.fullName || `${g.firstName} ${g.lastName}`}</div>
                        <div className="text-[13px] text-slate-500">{g.phone} • {g.email}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGuest && (
                  <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded-xl mt-2">
                    <div>
                      <div className="text-[14px] font-bold text-emerald-800">{selectedGuest.fullName || `${selectedGuest.firstName} ${selectedGuest.lastName}`}</div>
                      <div className="text-[13px] text-emerald-600">{selectedGuest.phone} • {selectedGuest.email}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setSelectedGuest(null); setGuestsResult([]); setSearchQuery(''); }}
                      className="text-[12px] font-bold text-emerald-700 hover:text-emerald-900 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <label className="text-[14px] font-semibold text-slate-700">Employee (Found By)</label>
                <select 
                  value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] bg-white"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-700">Additional Notes</label>
            <input 
              type="text" 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information"
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-6 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-1/3 py-4 rounded-xl border-2 border-slate-300 text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            disabled={isSubmitting || !itemName || !categoryId || !location}
            className="w-2/3 py-4 rounded-xl bg-[#0a4bbd] hover:bg-blue-800 transition-colors text-white text-[15px] font-bold disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </button>
        </div>

      </div>
    </Modal>
  );
}
