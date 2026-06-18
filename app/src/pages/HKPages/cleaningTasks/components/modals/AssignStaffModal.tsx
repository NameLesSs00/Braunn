import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CleaningTask, StaffMember, staffMembersData } from '../../mockData';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CleaningTask | null;
}

export function AssignStaffModal({ isOpen, onClose, task }: AssignStaffModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [notes, setNotes] = useState('');

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedStaff(null);
      setNotes('');
    }
  }, [isOpen]);

  if (!task) return null;

  const handleNext = () => {
    if (selectedStaff) setStep(2);
  };

  const handleAssign = () => {
    // Implement assignment logic here in the future
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? `Assign Staff to Room ${task.roomNo}` : `Room ${task.roomNo} Details`}
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
              onClick={handleNext}
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
        <div className="p-8">
          <div className="grid grid-cols-2 gap-y-8 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Floor</span>
              <span className="text-[16px] font-bold text-slate-800">{task.floor.replace(' Floor', '')}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Status</span>
              <div>
                <span className={`inline-flex px-4 py-1 rounded-full text-[12px] font-bold ${
                  task.status === 'dirty' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Priority</span>
              <div>
                <span className={`inline-flex px-4 py-1 rounded-full text-[12px] font-bold ${
                  task.priority === 'High' ? 'bg-red-100 text-red-500' : 
                  task.priority === 'Medium' ? 'bg-blue-100 text-blue-500' : 'bg-slate-100 text-slate-600'
                }`}>
                  {task.priority === 'High' ? 'urgent' : task.priority.toLowerCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-slate-500">Assigned To</span>
              <span className="text-[16px] font-bold text-[#0a4bbd]">{selectedStaff?.name}</span>
            </div>
            
            {/* Duplicated Assigned Staff exactly matching design */}
            <div className="flex flex-col gap-1 col-span-2 mt-[-10px]">
              <span className="text-[14px] text-slate-500">Assigned staff</span>
              <span className="text-[16px] font-bold text-slate-800">{selectedStaff?.name}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-slate-800">Cleaning Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add cleaning notes or special instructions..."
              rows={4}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>
          
          <div className="flex justify-between gap-4 pt-8">
            <button
              onClick={() => setStep(1)}
              className="w-1/2 py-3.5 rounded-xl border-2 border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAssign}
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
