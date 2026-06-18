import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { addGroupContract } from '../../../../features/GroupContract/GroupContractSlice'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { CreateGroupContractRequest } from '../../../../shared/apis/GroupContract'

interface CreateGroupContractPopupProps {
  onClose: () => void;
}

export function CreateGroupContractPopup({ onClose }: CreateGroupContractPopupProps) {
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { items: roomTypes } = useAppSelector(state => state.roomTypes);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    groupName: "",
    contactPerson: "",
    arrivalDate: today,
    departureDate: tomorrow,
    blockedRooms: 0,
    discountAmount: 0,
    depositRequired: 0,
    status: "Pending",
    roomTypeId: ""
  });

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  useEffect(() => {
    if (roomTypes.length > 0 && !formData.roomTypeId) {
      setFormData(prev => ({ ...prev, roomTypeId: roomTypes[0].id }));
    }
  }, [roomTypes]);

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

    console.log("Submitting group contract:", formData);
    const payload: CreateGroupContractRequest = {
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
      await dispatch(addGroupContract(payload)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to create group contract:", error);
      setErrorMsg(typeof error === 'string' ? error : "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 fade-in">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[800px] max-h-full flex flex-col rounded-xl overflow-hidden shadow-2xl scale-in relative">
        
        {/* Header */}
        <div className="bg-[#004bb4] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <h2 className="text-xl font-medium">Create Group Contract</h2>
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
              <label className="block text-sm font-semibold text-slate-600 mb-2">Arrival Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Departure Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Blocked Rooms */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Blocked Rooms</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="blockedRooms"
                  value={formData.blockedRooms}
                  onChange={handleChange}
                  placeholder="Number of rooms" 
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                  <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                  <ChevronDown className="w-3 h-3" />
                </div>
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
              <label className="block text-sm font-semibold text-slate-600 mb-2">Room Type</label>
              <div className="relative">
                <select
                  name="roomTypeId"
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomTypeId: e.target.value }))}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 rounded-lg px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow cursor-pointer"
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
            className="px-6 py-2.5 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm"
          >
            Create Contract
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
