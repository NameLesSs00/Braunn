import { useState } from 'react';
import { GuestRequestsHeader } from './components/GuestRequestsHeader';
import { GuestRequestsStats } from './components/GuestRequestsStats';
import { ActiveRequestsTable } from './components/ActiveRequestsTable';
import { RequestDetailsModal } from './components/modals/RequestDetailsModal';
import { AssignStaffModal } from './components/modals/AssignStaffModal';
import { guestRequestsData, GuestRequest } from './mockData';

export function GuestRequestsHKPage() {
  const [requests, setRequests] = useState<GuestRequest[]>(guestRequestsData);
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Table row click
  const handleRowClick = (request: GuestRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  // Assign button click (bypasses details)
  const handleAssignClick = (e: React.MouseEvent, request: GuestRequest) => {
    e.stopPropagation(); // Prevent row click
    setSelectedRequest(request);
    setIsAssignOpen(true);
  };

  // Complete button click (from table)
  const handleCompleteClick = (e: React.MouseEvent, request: GuestRequest) => {
    e.stopPropagation();
    setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'Completed' } : r));
  };

  // Complete button click (from modal)
  const handleModalComplete = (request: GuestRequest) => {
    setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'Completed' } : r));
    setIsDetailsOpen(false);
  };

  // Assign staff
  const handleAssignStaff = (request: GuestRequest, staffName: string) => {
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { ...r, status: 'In progress', assignedTo: staffName } 
        : r
    ));
    setIsAssignOpen(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8 pb-12">
      <GuestRequestsHeader />
      <GuestRequestsStats />
      
      <ActiveRequestsTable 
        requests={requests}
        onRowClick={handleRowClick}
        onAssignClick={handleAssignClick}
        onCompleteClick={handleCompleteClick}
      />

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        onOpenAssignStaff={() => {
          setIsDetailsOpen(false);
          setIsAssignOpen(true);
        }}
        onComplete={handleModalComplete}
      />

      <AssignStaffModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        request={selectedRequest}
        onAssign={handleAssignStaff}
      />
    </div>
  );
}
