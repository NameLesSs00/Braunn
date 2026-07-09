export interface DashboardRoomTypeCount {
  roomTypeId: string
  roomTypeName: string | null
  count: number
}

export interface DashboardRoomCount {
  total: number
  byRoomType: DashboardRoomTypeCount[] | null
}

export interface DashboardRevenueByPaymentMethod {
  paymentMethod: string | null
  amount: number
}

export interface DailyDashboardResponse {
  date: string
  availableRooms: DashboardRoomCount
  occupiedRooms: DashboardRoomCount
  expectedCheckIns: number
  actualCheckIns: number
  expectedCheckOuts: number
  actualCheckOuts: number
  revenueByPaymentMethod: DashboardRevenueByPaymentMethod[] | null
  refundsTotal: number
}
