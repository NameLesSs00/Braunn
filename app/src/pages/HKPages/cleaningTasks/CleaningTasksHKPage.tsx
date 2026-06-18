import { useState } from 'react';
import { CleaningTasksHeader, CleaningTasksFilters } from './components/CleaningTasksFilters';
import { CleaningTasksTable } from './components/CleaningTasksTable';
import { AssignStaffModal } from './components/modals/AssignStaffModal';
import { cleaningTasksData, CleaningTask } from './mockData';

export function CleaningTasksHKPage() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);

  const handleAssignClick = (task: CleaningTask) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <CleaningTasksHeader />
      <CleaningTasksFilters />
      
      <CleaningTasksTable 
        tasks={cleaningTasksData} 
        onAssignClick={handleAssignClick} 
      />

      <AssignStaffModal 
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
