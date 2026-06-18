import { FiSearch } from 'react-icons/fi';
import { GuestRequest } from '../mockData';

interface ActiveRequestsTableProps {
  requests: GuestRequest[];
  onRowClick: (request: GuestRequest) => void;
  onAssignClick: (e: React.MouseEvent, request: GuestRequest) => void;
  onCompleteClick: (e: React.MouseEvent, request: GuestRequest) => void;
}

export function ActiveRequestsTable({ requests, onRowClick, onAssignClick, onCompleteClick }: ActiveRequestsTableProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-[#1a365d] mt-2">Active Requests</h2>
      
      {/* Search Bar */}
      <div className="relative w-full">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Room Number"
          className="bg-white w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
        />
      </div>

      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#f1f5f9] border-b border-slate-200">
                {['Room No', 'Type', 'Floor', 'Priority', 'Description', 'Requested', 'Assigned to', 'Status', 'Actions'].map((col) => (
                  <th key={col} className={`px-6 py-4 text-[13px] font-bold text-slate-700 ${col === 'Actions' ? 'text-center' : ''}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => {
                // Status Styling
                let statusBg = '';
                let statusText = '';
                if (req.status === 'Pending') {
                  statusBg = 'bg-amber-100';
                  statusText = 'text-amber-500';
                } else if (req.status === 'In progress') {
                  statusBg = 'bg-blue-50';
                  statusText = 'text-[#0a4bbd]';
                } else if (req.status === 'Completed') {
                  statusBg = 'bg-emerald-100';
                  statusText = 'text-emerald-500';
                }

                // Priority Styling
                const priorityText = req.priority === 'High' ? 'text-red-500' : 
                                     req.priority === 'Medium' ? 'text-[#0a4bbd]' : 'text-slate-500';

                return (
                  <tr 
                    key={req.id} 
                    onClick={() => onRowClick(req)}
                    className="hover:bg-slate-100 even:bg-[#f0f4f9] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5 text-[14px] font-bold text-slate-800">{req.roomNo}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">{req.type}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">{req.floor}</td>
                    <td className={`px-6 py-5 text-[14px] font-medium ${priorityText}`}>
                      {req.priority}
                    </td>
                    <td className="px-6 py-5 text-[14px] text-slate-500 max-w-[200px] truncate">{req.description}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">{req.requestedAt}</td>
                    <td className="px-6 py-5 text-[14px] text-slate-500">{req.assignedTo}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-4 py-1 rounded-full text-[12px] font-bold ${statusBg} ${statusText}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {req.status === 'Pending' ? (
                        <button 
                          onClick={(e) => onAssignClick(e, req)}
                          className="px-6 py-2 text-[13px] font-bold text-white bg-[#0a4bbd] rounded-lg hover:bg-blue-800 transition-colors"
                        >
                          Assign
                        </button>
                      ) : req.status === 'In progress' ? (
                        <button 
                          onClick={(e) => onCompleteClick(e, req)}
                          className="px-6 py-2 text-[13px] font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Complete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
