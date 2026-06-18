import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { GuestRequest } from '../../mockData';
import { FiMessageSquare } from 'react-icons/fi';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GuestRequest | null;
  onOpenAssignStaff: () => void;
  onComplete: (request: GuestRequest) => void;
}

export function RequestDetailsModal({ isOpen, onClose, request, onOpenAssignStaff, onComplete }: RequestDetailsModalProps) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
    }
  }, [isOpen]);

  if (!request) return null;

  // Render variables for status pill
  let statusBg = '';
  let statusText = '';
  if (request.status === 'Pending') {
    statusBg = 'bg-amber-100';
    statusText = 'text-amber-500';
  } else if (request.status === 'In progress') {
    statusBg = 'bg-blue-200';
    statusText = 'text-[#0a4bbd]';
  } else if (request.status === 'Completed') {
    statusBg = 'bg-emerald-100';
    statusText = 'text-emerald-500';
  }

  const priorityText = request.priority === 'High' ? 'text-red-500' : 
                       request.priority === 'Medium' ? 'text-[#0a4bbd]' : 'text-slate-500';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request #1 - Room ${request.roomNo}`}
      maxWidth="max-w-2xl"
    >
      <div className="p-8 space-y-8">
        
        {/* Top Details Grid */}
        <div className="grid grid-cols-2 gap-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] text-slate-500">Type</span>
            <span className="text-[16px] font-bold text-slate-800 capitalize">{request.type}</span>
          </div>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[14px] text-slate-500">Status</span>
            <span className={`inline-flex px-4 py-1 rounded-full text-[13px] font-bold ${statusBg} ${statusText}`}>
              {request.status}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[14px] text-slate-500">Priority</span>
            <span className={`text-[16px] font-bold ${priorityText}`}>{request.priority}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[14px] text-slate-500">Requested</span>
            <span className="text-[16px] font-bold text-slate-800">{request.requestedAt}</span>
          </div>
        </div>

        {/* Optional Assigned Staff when In Progress/Completed (not pending) */}
        {request.status !== 'Pending' && (
          <div className="flex flex-col gap-1 mt-[-10px]">
            <span className="text-[14px] text-slate-500">Assigned staff</span>
            <span className="text-[16px] font-bold text-slate-800">{request.assignedTo}</span>
          </div>
        )}

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

        {/* Footer Actions (Dynamic by Status) */}
        <div className="flex justify-between gap-4 pt-4">
          <button
            onClick={onClose}
            className={`py-3.5 rounded-xl border-2 border-slate-400 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors ${
              request.status === 'Completed' ? 'w-full' : 'w-1/2'
            }`}
          >
            {request.status === 'Completed' ? 'Back' : 'cancel'}
          </button>
          
          {request.status === 'Pending' && (
            <button
              onClick={() => {
                onClose();
                onOpenAssignStaff();
              }}
              className="w-1/2 py-3.5 rounded-xl bg-[#0a4bbd] text-white text-[15px] font-bold hover:bg-blue-800 transition-colors"
            >
              Assigned staff
            </button>
          )}

          {request.status === 'In progress' && (
            <button
              onClick={() => onComplete(request)}
              className="w-1/2 py-3.5 rounded-xl bg-[#0a4bbd] text-white text-[15px] font-bold hover:bg-blue-800 transition-colors"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
