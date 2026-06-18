export interface GroupContract {
  id: string;              
  groupName: string;
  contactPerson: string;
  arrivalDate: string;     // Date-time string ("YYYY-MM-DD HH:mm:ss")
  departureDate: string;   // Date-time string ("YYYY-MM-DD HH:mm:ss")
  blockedRooms: number;
  pickupRooms: number;
  discountAmount: number;
  depositRequired: number;
  status: string; // You can lock this down to specific literal strings if you know them all
  roomTypeId: string;      
  createdAt: string;       // Date-time string ("YYYY-MM-DD HH:mm:ss")
}

// Use this to type your React Query or Axios response arrays:
export type GroupContractsResponse = GroupContract[];