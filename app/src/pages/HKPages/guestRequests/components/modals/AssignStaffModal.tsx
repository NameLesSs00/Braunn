import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { GuestRequest, StaffMember, staffMembersData } from '../../mockData';
import { FiMessageSquare } from 'react-icons/fi';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GuestRequest | null;
  onAssign: (request: GuestRequest, staffName: string) => void;
}

export function AssignStaffModal({ isOpen, onClose, request, onAssign }: AssignStaffModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedStaff(null);
      setComment('');
    }
  }, [isOpen]);

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request #1 - Room ${request.roomNo}`}
      maxWidth="max-w-2xl"
    >
      {step === 1 ? (
        <div className="p-8">
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
            {staffMembersData.map((staff) => {
              const isSelected = selectedStaff?.id === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#EEF4FF] border-2 border-[#0a4bbd]' 
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0a4bbd] flex items-center justify-center text-white font-bold text-[15px]">
                      {staff.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-bold text-slate-800">{staff.name}</span>
                      <span className="text-[13px] text-slate-500">{staff.roomsAssigned} rooms assigned</span>
                    </div>
                  </div>
                  
                  {/* Status Pill */}
                  {staff.status === 'active' ? (
                    <span className="px-3 py-1 rounded-full border border-emerald-200 text-emerald-500 text-[12px] font-bold bg-emerald-50/50">
                      active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full border border-amber-200 text-amber-500 text-[12px] font-bold bg-amber-50/50">
                      break
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between gap-4 pt-8">
            <button
              onClick={onClose}
              className="w-1/2 py-3.5 rounded-xl border-2 border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              cancel
            </button>
            <button
              onClick={() => {
                if (selectedStaff) setStep(2);
              }}
              disabled={!selectedStaff}
              className={`w-1/2 py-3.5 rounded-xl text-[15px] font-bold transition-colors ${
                selectedStaff 
                  ? 'bg-[#0a4bbd] text-white hover:bg-blue-800' 
                  : 'bg-slate-300 text-white cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Top Details Grid */}
          <div className="grid grid-cols-2 gap-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Type</span>
              <span className="text-[16px] font-bold text-slate-800 capitalize">{request.type}</span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[14px] text-slate-500">Status</span>
              <span className="inline-flex px-4 py-1 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-500">
                Completed
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Priority</span>
              <span className={`text-[16px] font-bold ${
                request.priority === 'High' ? 'text-red-500' : 
                request.priority === 'Medium' ? 'text-[#0a4bbd]' : 'text-slate-500'
              }`}>
                {request.priority}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Requested</span>
              <span className="text-[16px] font-bold text-slate-800">{request.requestedAt}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-[-10px]">
            <span className="text-[14px] text-slate-500">Assigned staff</span>
            <span className="text-[16px] font-bold text-slate-800">{selectedStaff?.name}</span>
          </div>

          {/* Description Box */}
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-slate-500">Description</span>
            <div className="w-full p-4 rounded-xl bg-slate-100 text-[15px] text-slate-800 font-medium">
              {request.description}
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex flex-col gap-6">
            <span className="text-[15px] font-bold text-slate-800">Comments & Updates</span>
            
            <div className="text-center py-4">
              <span className="text-[14px] text-slate-500">No comments yet</span>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
              />
              <button className="flex items-center gap-2 px-6 py-3 bg-[#0a4bbd] hover:bg-blue-800 transition-colors rounded-xl text-white font-bold text-[14px]">
                {/* @ts-ignore */}
                <FiMessageSquare className="w-4 h-4" />
                <span>Post</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between gap-4 pt-4">
            <button
              onClick={() => setStep(1)}
              className="w-1/2 py-3.5 rounded-xl border-2 border-slate-400 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (selectedStaff) {
                  onAssign(request, selectedStaff.name);
                }
              }}
              className="w-1/2 py-3.5 rounded-xl bg-[#0a4bbd] text-white text-[15px] font-bold hover:bg-blue-800 transition-colors"
            >
              Assign to Staff
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
