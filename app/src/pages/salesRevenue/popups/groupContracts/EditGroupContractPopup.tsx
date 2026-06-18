import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { editGroupContract, fetchGroupContractById } from '../../../../features/GroupContract/GroupContractSlice'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { UpdateGroupContractRequest } from '../../../../shared/apis/GroupContract'

interface EditGroupContractPopupProps {
  contractId: string;
  onClose: () => void;
}

export function EditGroupContractPopup({ contractId, onClose }: EditGroupContractPopupProps) {
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    groupName: "",
    contactPerson: "",
    arrivalDate: "",
    departureDate: "",
    blockedRooms: 0,
    discountAmount: 0,
    depositRequired: 0,
    status: "Pending",
    roomTypeId: ""
  });

  const { selected, status } = useAppSelector(state => state.groupContract);
  const { items: roomTypes } = useAppSelector(state => state.roomTypes);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    const cleanStr = dateString.includes(' ') && !dateString.includes('T') ? dateString.replace(' ', 'T') : dateString;
    const d = new Date(cleanStr)
    if (isNaN(d.getTime())) return ''
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  useEffect(() => {
    dispatch(fetchGroupContractById(contractId));
    dispatch(fetchRoomTypes());
  }, [dispatch, contractId]);

  useEffect(() => {
    if (selected && selected.id === contractId) {
      setFormData({
        groupName: selected.groupName,
        contactPerson: selected.contactPerson,
        arrivalDate: formatDateForInput(selected.arrivalDate),
        departureDate: formatDateForInput(selected.departureDate),
        blockedRooms: selected.blockedRooms,
        discountAmount: selected.discountAmount,
        depositRequired: selected.depositRequired,
        status: selected.status,
        roomTypeId: selected.roomTypeId
      });
    }
  }, [selected, contractId]);

  // Loading state check
  const isLoadingData = !selected || selected.id !== contractId;

  // Fields that cannot be modified on active contracts
  const isLocked = selected?.status?.toLowerCase() !== 'pending';

  const lockedClass = "w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-lg px-4 py-2.5 cursor-not-allowed opacity-70";
  const activeClass = "w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    // Validation checks
    if (!formData.groupName.trim()) {
      setErrorMsg("Group Name is required.");
      return;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMsg("Contact Person is required.");
      return;
    }
    if (!formData.roomTypeId) {
      setErrorMsg("Room Type is required.");
      return;
    }
    if (!formData.blockedRooms || Number(formData.blockedRooms) <= 0) {
      setErrorMsg("Blocked Rooms must be a positive number greater than 0.");
      return;
    }
    if (Number(formData.discountAmount) < 0) {
      setErrorMsg("Discount Amount cannot be negative.");
      return;
    }
    if (Number(formData.depositRequired) < 0) {
      setErrorMsg("Deposit Required cannot be negative.");
      return;
    }
    if (!formData.arrivalDate) {
      setErrorMsg("Arrival Date is required.");
      return;
    }
    if (!formData.departureDate) {
      setErrorMsg("Departure Date is required.");
      return;
    }
    if (new Date(formData.departureDate) <= new Date(formData.arrivalDate)) {
      setErrorMsg("Departure Date must be after Arrival Date.");
      return;
    }

    console.log("Updating group contract:", formData);
    const payload: UpdateGroupContractRequest = {
      groupName: formData.groupName.trim(),
      contactPerson: formData.contactPerson.trim(),
      arrivalDate: new Date(formData.arrivalDate).toISOString(),
      departureDate: new Date(formData.departureDate).toISOString(),
      blockedRooms: Number(formData.blockedRooms) || 0,
      discountAmount: Number(formData.discountAmount) || 0,
      depositRequired: Number(formData.depositRequired) || 0,
      status: formData.status,
      roomTypeId: formData.roomTypeId
    };

    try {
      await dispatch(editGroupContract({ id: contractId, payload })).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update group contract:", error);
      setErrorMsg(typeof error === 'string' ? error : "An error occurred");
    }
  };

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 fade-in">
        <div className="bg-white w-full max-w-[800px] h-[400px] flex flex-col justify-center items-center rounded-xl shadow-2xl relative scale-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004bb4]"></div>
          <span className="mt-4 text-slate-500 font-medium text-sm">Loading contract details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 fade-in">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[800px] max-h-full flex flex-col rounded-xl overflow-hidden shadow-2xl scale-in relative">
        
        {/* Header */}
        <div className="bg-[#004bb4] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <h2 className="text-xl font-medium">Edit Group Contract</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {isLocked && (
            <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg border border-amber-200 text-sm font-medium flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>This contract is <strong>{formData.status}</strong>. Blocked Rooms, Dates, and Room Type cannot be changed. Only contact details, discount, and deposit can be edited.</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Group Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Group Name</label>
              <input 
                type="text" 
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                placeholder="Enter group name" 
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Contact Person</label>
              <input 
                type="text" 
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Name" 
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
              />
            </div>

            {/* Arrival Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Arrival Date {isLocked && <span className="text-xs font-normal text-slate-400 ml-1">(locked)</span>}
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  disabled={isLocked}
                  className={isLocked ? lockedClass + " cursor-not-allowed" : activeClass + " cursor-pointer"}
                />
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Departure Date {isLocked && <span className="text-xs font-normal text-slate-400 ml-1">(locked)</span>}
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  disabled={isLocked}
                  className={isLocked ? lockedClass + " cursor-not-allowed" : activeClass + " cursor-pointer"}
                />
              </div>
            </div>

            {/* Blocked Rooms */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Blocked Rooms {isLocked && <span className="text-xs font-normal text-slate-400 ml-1">(locked)</span>}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="blockedRooms"
                  value={formData.blockedRooms}
                  onChange={handleChange}
                  disabled={isLocked}
                  placeholder="Number of rooms" 
                  className={isLocked ? lockedClass + " [appearance:textfield]" : "w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                />
                {!isLocked && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                    <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Discount Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input 
                  type="number" 
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  placeholder="" 
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-8 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                  <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Room Type {isLocked && <span className="text-xs font-normal text-slate-400 ml-1">(locked)</span>}
              </label>
              <div className="relative">
                <select
                  name="roomTypeId"
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomTypeId: e.target.value }))}
                  disabled={isLocked}
                  className={isLocked 
                    ? "w-full appearance-none bg-slate-50 border border-slate-200 text-slate-400 rounded-lg px-4 pr-10 py-2.5 cursor-not-allowed opacity-70"
                    : "w-full appearance-none bg-white border border-slate-200 text-slate-700 rounded-lg px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow cursor-pointer"
                  }
                >
                  {roomTypes.length === 0 && (
                    <option value="">Loading room types...</option>
                  )}
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Deposit Required */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Deposit Required</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input 
                  type="number" 
                  name="depositRequired"
                  value={formData.depositRequired}
                  onChange={handleChange}
                  placeholder="" 
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 bg-white flex items-center justify-end gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Updating...' : 'Update Contract'}
          </button>
        </div>

      </div>
      
      <style>{`
        .scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95); 
          }
          to { 
            opacity: 1;
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  )
}
