export type ComplaintCategory = 'Room' | 'Noise' | 'Cleanliness' | 'Service';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Open' | 'InProgress' | 'Resolved';

export interface FrontOfficeComplaintReadDto {
  id: string;
  complaintNumber: string;
  guestId: string;
  guestName: string;
  reservationId: string;
  reservationRoomId: string;
  bookingReference: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  subject: string;
  description: string;
  reportedByUserId?: string;
  reportedByName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  resolvedAtUtc?: string | null;
  resolutionNotes?: string | null;
}

export interface FrontOfficeComplaintCreateDto {
  guestId: string;
  complaintCategory: ComplaintCategory;
  complaintPriority: ComplaintPriority;
  status?: ComplaintStatus;
  subject: string;
  description: string;
  reportedByName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
}

export interface FrontOfficeComplaintUpdateStatusDto {
  status: ComplaintStatus;
  resolutionNotes?: string;
  assignedToUserId?: string;
  assignedToName?: string;
}
