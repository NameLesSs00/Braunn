export interface DailyCheckinsArrival {
  reservationId: string;
  guestName: string;
  roomType: string;
  roomNumber: string | null;
  currentStatus: string;
}

export interface DailyCheckinsSummary {
  totalExpectedArrivals: number;
  totalSuccessfulCheckIns: number;
}

export interface DailyCheckinsData {
  summary: DailyCheckinsSummary;
  arrivals: DailyCheckinsArrival[];
  occupancyRate: number;
}

export interface DailyCheckinsResponse {
  isSuccess: boolean;
  message: string;
  data: DailyCheckinsData;
  errors: string[];
}

export interface FinancialSummaryData {
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalRoomRevenue: number;
  totalAdditionalServices: number;
  totalDiscountsGiven: number;
  grossRevenue: number;
  netRevenue: number;
  totalPaymentsCollected: number;
  totalOutstandingBalances: number;
}
