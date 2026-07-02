import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ReservationDraft = {
  bookingSource: string
  reservationStatus: '' | 'all_status' | 'confirmed' | 'optional_on_hold' | 'commit' | 'modify' | 'cancelled' | 'Reserved' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Completed' | 'Cancelled' | 'Tentative' | 'Definite'
  
  firstName: string
  surName: string
  
  language: string
  email: string
  phone: string
  
  nationality: string
  idNumber: string
  creatorID: string
  
  addressLine: string
  countryCode: string
  
  notes: string
  
  checkInDate: string
  checkOutDate: string
  nights: string
  
  adultCount: number
  childCount: number
  childAges: number[]
  
  rooms: { id: number; roomTypeId: string; roomType: string; roomCount: number; roomNumber?: string; roomView?: string }[]
  
  rateCode: string
  ratePlan: string
  mealPlans: { id: number; mealPlanId: string; serviceDateStart: string; serviceDateEnd: string; price?: number }[]
  
  extras: { id: number; item: string; qty: number; price?: number; customName?: string; serviceDate?: string }[]
  
  specialRequests: string
  
  depositAmountReceived: string
  paymentMethod: string
  paidAmount: string
  paymentReference: string
  paymentDate: string
  coupon: string
  
  otherPayments: { id: number; paymentMethod: string; paidAmount: string }[]
  
  isVip: boolean
  currency: string
  guaranteeCode: string
  guaranteeType: string
  cardCode: string
  cardHolderName: string
  cardNo: string
  cardType: string
  cardExpire: string
  cardSeriesCode: string
  
  companions: { id: number, firstName: string, lastName: string, phoneNumber: string, email: string, address: string, nationalId: string }[]
}

const initialState: ReservationDraft = {
  bookingSource: '',
  reservationStatus: 'Reserved',
  
  firstName: '',
  surName: '',
  
  language: '',
  email: '',
  phone: '',
  
  nationality: '',
  idNumber: '',
  creatorID: '',
  
  addressLine: '',
  countryCode: '',
  
  notes: '',
  
  checkInDate: '',
  checkOutDate: '',
  nights: '',
  
  adultCount: 1,
  childCount: 0,
  childAges: [],
  
  rooms: [{ id: 0, roomTypeId: '', roomType: '', roomCount: 1, roomNumber: '', roomView: '' }],
  
  rateCode: '',
  ratePlan: '',
  mealPlans: [],
  
  extras: [],
  
  specialRequests: '',
  
  depositAmountReceived: '',
  paymentMethod: '',
  paidAmount: '',
  paymentReference: '',
  paymentDate: '',
  coupon: '',
  
  otherPayments: [],
  
  isVip: false,
  currency: 'USD',
  guaranteeCode: '',
  guaranteeType: '',
  cardCode: '',
  cardHolderName: '',
  cardNo: '',
  cardType: '',
  cardExpire: '',
  cardSeriesCode: '',
  
  companions: []
}

const draftSlice = createSlice({
  name: 'reservationDraft',
  initialState,
  reducers: {
    updateDraft: (state, action: PayloadAction<Partial<ReservationDraft>>) => {
      return { ...state, ...action.payload }
    },
    resetDraft: () => initialState,
    setDraft: (_, action: PayloadAction<ReservationDraft>) => action.payload,
  },
})

export const { updateDraft, resetDraft, setDraft } = draftSlice.actions
export const draftReducer = draftSlice.reducer
