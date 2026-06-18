import { CleaningTask } from '../mockData';

interface CleaningTasksTableProps {
  tasks: CleaningTask[];
  onAssignClick: (task: CleaningTask) => void;
}

export function CleaningTasksTable({ tasks, onAssignClick }: CleaningTasksTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200">
              {['Room No', 'Departure Date', 'Floor', 'Priority', 'Room Type', 'Assigned to', 'Status', 'Actions'].map((col) => (
                <th key={col} className={`px-6 py-4 text-[13px] font-bold text-slate-700 ${col === 'Actions' ? 'text-center' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              // Status Styling
              let statusBg = '';
              let statusText = '';
              if (task.status === 'clean') {
                statusBg = 'bg-emerald-100';
                statusText = 'text-emerald-500';
              } else if (task.status === 'dirty') {
                statusBg = 'bg-red-100';
                statusText = 'text-red-500';
              } else if (task.status === 'in progress') {
                statusBg = 'bg-amber-100';
                statusText = 'text-amber-500';
              }

              // Priority Styling
              let priorityText = '';
              if (task.priority === 'High') priorityText = 'text-red-500';
              else if (task.priority === 'Medium') priorityText = 'text-[#0a4bbd]';
              else if (task.priority === 'Low') priorityText = 'text-slate-500';

              return (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[14px] font-bold text-slate-800">{task.roomNo}</td>
                  <td className="px-6 py-5 text-[14px] text-slate-500">{task.departureDate}</td>
                  <td className="px-6 py-5 text-[14px] text-slate-500">{task.floor}</td>
                  <td className={`px-6 py-5 text-[14px] font-medium ${priorityText}`}>
                    {task.priority}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-slate-500">{task.roomType}</td>
                  <td className="px-6 py-5 text-[14px] text-slate-500">{task.assignedTo}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-1 rounded-full text-[12px] font-bold ${statusBg} ${statusText}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {task.status === 'dirty' ? (
                      <button 
                        onClick={() => onAssignClick(task)}
                        className="px-6 py-2 text-[13px] font-bold text-white bg-[#0a4bbd] rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Assign
                      </button>
                    ) : task.status === 'in progress' ? (
                      <button className="px-6 py-2 text-[13px] font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                        Complete
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
