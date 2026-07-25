export type MaintenancePriority = 'High' | 'Medium' | 'Low'
export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Pending'

export type MaintenanceRequest = {
  id: string
  requestNo: string
  location: string
  source: string
  roomNo: string
  itemName: string
  notes: string
  priorityLevel: MaintenancePriority
  status: MaintenanceStatus
  // Keeping these for other UI components that might need them
  title: string
  room: string
  category: string
  requester: string
  employee: string
  submittedAt: string
  description: string
  dueDate: string
}

export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'MR-1024',
    requestNo: 'MR-1024',
    location: '1st Floor',
    source: 'HK',
    roomNo: '102',
    itemName: 'Dell OptiPlex 7010',
    notes: 'Need technician check compressor and filter.',
    priorityLevel: 'High',
    status: 'Open',
    title: 'Air Conditioner not cooling',
    room: '102',
    category: 'HVAC',
    requester: 'Alya Rahman',
    employee: 'Not Assigned',
    submittedAt: '2026-07-18 08:45',
    description: 'Guest reported room temperature stays above 27°C and the air conditioner blows warm air.',
    dueDate: '2026-07-18',
  },
  {
    id: 'MR-1023',
    requestNo: 'MR-1023',
    location: '2nd Floor',
    source: 'Front Desk',
    roomNo: '205',
    itemName: 'Bathroom Faucet',
    notes: 'Replacement washer to be prepared.',
    priorityLevel: 'Medium',
    status: 'Assigned',
    title: 'Guest bathroom faucet leak',
    room: '205',
    category: 'Plumbing',
    requester: 'Reception',
    employee: 'Rana Ali',
    submittedAt: '2026-07-18 09:10',
    description: 'Faucet in bathroom is leaking continuously and needs immediate repair.',
    dueDate: '2026-07-18',
  },
  {
    id: 'MR-1022',
    requestNo: 'MR-1022',
    location: '3rd Floor',
    source: 'HK',
    roomNo: '318',
    itemName: 'LED Panel',
    notes: 'Awaiting spare LED panel for replacement.',
    priorityLevel: 'Low',
    status: 'In Progress',
    title: 'Bedroom light fixture flickering',
    room: '318',
    category: 'Electrical',
    requester: 'Housekeeping',
    employee: 'Omar Salim',
    submittedAt: '2026-07-18 10:20',
    description: 'The bedside lamp flickers intermittently. Could be a loose connection in the fixture.',
    dueDate: '2026-07-18',
  },
  {
    id: 'MR-1021',
    requestNo: 'MR-1021',
    location: '4th Floor',
    source: 'Security',
    roomNo: '410',
    itemName: 'Door Lock',
    notes: 'Door hardware realigned and tested.',
    priorityLevel: 'Medium',
    status: 'Resolved',
    title: 'Door lock alignment issue',
    room: '410',
    category: 'Security',
    requester: 'Front Desk',
    employee: 'Tariq Nasser',
    submittedAt: '2026-07-17 16:15',
    description: 'Door lock is not aligning correctly and requires adjustment.',
    dueDate: '2026-07-17',
  },
  {
    id: 'MR-1020',
    requestNo: 'MR-1020',
    location: '2nd Floor',
    source: 'Guest',
    roomNo: '221',
    itemName: 'TV Remote',
    notes: 'Replace remote control battery.',
    priorityLevel: 'Low',
    status: 'Pending',
    title: 'TV remote not responding',
    room: '221',
    category: 'Electronics',
    requester: 'Guest',
    employee: 'Sara Yusuf',
    submittedAt: '2026-07-17 13:25',
    description: 'TV remote is unresponsive and provided a blank screen after battery replacement.',
    dueDate: '2026-07-18',
  },
]

export const maintenanceEmployees = [
  'Rana Ali',
  'Omar Salim',
  'Tariq Nasser',
  'Sara Yusuf',
  'Lina Hadi',
  'Waleed Karim',
]
