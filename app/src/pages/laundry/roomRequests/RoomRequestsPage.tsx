import { useState, useMemo } from 'react'
import { RequestsSearchFilters } from '../components/RequestsSearchFilters'
import { RequestsStatusCards } from '../components/RequestsStatusCards'
import { RequestsTable, type LaundryRequest } from '../components/RequestsTable'
import { parse, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'

const mockRequests: LaundryRequest[] = [
  { requestNo: 'LR-00015', roomNo: '201', guestName: 'Alice Johnson', serviceItems: 'Shirt Ironing (2)', requestDate: '12/23/2025', requestTime: '10:00 AM', expectedDelivery: '12/23/2025', expectedTime: '02:00 PM', status: 'Pending' },
  { requestNo: 'LR-00014', roomNo: '305', guestName: 'Bob Smith', serviceItems: 'Laundry Wash (1)', requestDate: '12/23/2025', requestTime: '09:30 AM', expectedDelivery: '12/23/2025', expectedTime: '04:00 PM', status: 'Pending' },
  { requestNo: 'LR-00013', roomNo: '410', guestName: 'Charlie Brown', serviceItems: 'Pants Ironing (3)', requestDate: '12/22/2025', requestTime: '08:00 PM', expectedDelivery: '12/23/2025', expectedTime: '09:00 AM', status: 'In Progress' },
  { requestNo: 'LR-00012', roomNo: '103', guestName: 'Ahmed Mohamed', serviceItems: 'Shirt Ironing (1), Pants Ironing (1)', requestDate: '12/22/2025', requestTime: '09:15 AM', expectedDelivery: '12/22/2025', expectedTime: '06:00 PM', status: 'Pending' },
  { requestNo: 'LR-00011', roomNo: '105', guestName: 'Sarah Ali', serviceItems: 'Laundry Wash (3)', requestDate: '12/22/2025', requestTime: '09:15 AM', expectedDelivery: '12/22/2025', expectedTime: '06:00 PM', status: 'In Progress' },
  { requestNo: 'LR-00010', roomNo: '102', guestName: 'John Smith', serviceItems: 'Shirt Ironing (2)', requestDate: '12/21/2025', requestTime: '08:45 PM', expectedDelivery: '12/22/2025', expectedTime: '11:00 AM', status: 'Ready for Delivery' },
  { requestNo: 'LR-00009', roomNo: '101', guestName: 'Emily Davis', serviceItems: 'Laundry Wash (5), Pants Ironing (1)', requestDate: '12/21/2025', requestTime: '07:30 PM', expectedDelivery: '12/22/2025', expectedTime: '04:00 PM', status: 'Completed' },
  { requestNo: 'LR-00008', roomNo: '104', guestName: 'Michael Brown', serviceItems: 'Towel Laundry (4)', requestDate: '12/21/2025', requestTime: '06:20 PM', expectedDelivery: '12/22/2025', expectedTime: '10:00 AM', status: 'Completed' },
  { requestNo: 'LR-00007', roomNo: '202', guestName: 'Laura Wilson', serviceItems: 'Shirt Ironing (4)', requestDate: '12/20/2025', requestTime: '05:00 PM', expectedDelivery: '12/21/2025', expectedTime: '10:00 AM', status: 'Completed' },
  { requestNo: 'LR-00006', roomNo: '501', guestName: 'James Taylor', serviceItems: 'Laundry Wash (2)', requestDate: '12/20/2025', requestTime: '04:15 PM', expectedDelivery: '12/21/2025', expectedTime: '12:00 PM', status: 'Ready for Delivery' },
  { requestNo: 'LR-00005', roomNo: '308', guestName: 'Olivia Martinez', serviceItems: 'Pants Ironing (2)', requestDate: '12/20/2025', requestTime: '02:30 PM', expectedDelivery: '12/21/2025', expectedTime: '09:00 AM', status: 'Completed' },
  { requestNo: 'LR-00004', roomNo: '405', guestName: 'William Anderson', serviceItems: 'Towel Laundry (2)', requestDate: '12/19/2025', requestTime: '11:00 AM', expectedDelivery: '12/20/2025', expectedTime: '03:00 PM', status: 'Completed' },
  { requestNo: 'LR-00003', roomNo: '110', guestName: 'Sophia Thomas', serviceItems: 'Laundry Wash (4)', requestDate: '12/19/2025', requestTime: '09:45 AM', expectedDelivery: '12/20/2025', expectedTime: '11:00 AM', status: 'Completed' },
  { requestNo: 'LR-00002', roomNo: '205', guestName: 'Daniel Jackson', serviceItems: 'Shirt Ironing (1)', requestDate: '12/18/2025', requestTime: '06:30 PM', expectedDelivery: '12/19/2025', expectedTime: '09:00 AM', status: 'Completed' },
  { requestNo: 'LR-00001', roomNo: '312', guestName: 'Isabella White', serviceItems: 'Pants Ironing (1)', requestDate: '12/18/2025', requestTime: '04:00 PM', expectedDelivery: '12/19/2025', expectedTime: '10:00 AM', status: 'Completed' },
]

const PAGE_SIZE = 5

export function RoomRequestsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All status')
  const [serviceType, setServiceType] = useState('All Type')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  const [page, setPage] = useState(1)

  const filteredRequests = useMemo(() => {
    return mockRequests.filter(req => {
      // Search
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch = 
          req.requestNo.toLowerCase().includes(q) ||
          req.roomNo.toLowerCase().includes(q) ||
          req.guestName.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      // Status
      if (status !== 'All status' && req.status !== status) {
        return false
      }

      // Service Type (simple inclusion check)
      if (serviceType !== 'All Type' && !req.serviceItems.includes(serviceType)) {
        return false
      }

      // Date From
      if (dateFrom) {
        const reqDate = parse(req.requestDate, 'MM/dd/yyyy', new Date())
        const fromDate = startOfDay(new Date(dateFrom))
        if (isBefore(reqDate, fromDate)) return false
      }

      // Date To
      if (dateTo) {
        const reqDate = parse(req.requestDate, 'MM/dd/yyyy', new Date())
        const toDate = endOfDay(new Date(dateTo))
        if (isAfter(reqDate, toDate)) return false
      }

      return true
    })
  }, [search, status, serviceType, dateFrom, dateTo])

  // Reset to page 1 when filters change
  useMemo(() => {
    setPage(1)
  }, [search, status, serviceType, dateFrom, dateTo])

  const totalCount = filteredRequests.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const paginatedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#0B4EA2]">Guest Requests</h2>
        <p className="mt-1 text-[13px] text-slate-400">Manage and track guest laundry service requests</p>
      </div>

      {/* Search & Filters */}
      <RequestsSearchFilters
        search={search} onSearchChange={setSearch}
        status={status} onStatusChange={setStatus}
        serviceType={serviceType} onServiceTypeChange={setServiceType}
        dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo}
      />

      {/* Status Cards */}
      <RequestsStatusCards />

      {/* Table */}
      <RequestsTable
        requests={paginatedRequests}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
