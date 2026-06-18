import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ReservationDraft = {
  bookingSource: string
  otaSource: string

  reservationStatus: '' | 'all_status' | 'confirmed' | 'optional_on_hold' | 'commit' | 'modify' | 'cancelled'
  optionExpiryDate: string

  isGroupReservation: boolean

  firstName: string
  middleName: string
  surName: string
  salutation: string
  dateOfBirth: string

  language: string

  email: string
  phone: string

  nationality: string
  idNumber: string
  creatorID: string

  addressLine: string
  addressType: string
  city: string
  postalCode: string
  state: string
  countryCode: string

  notes: string

  checkInDate: string
  checkOutDate: string
  nights: string

  adultCount: number
  childCount: number
  infantCount: number

  rooms: { id: number; roomType: string; roomView: string; roomCount: number; roomNumbers: string[] }[]

  discountType: 'none' | 'percentage' | 'fixed' | 'custom' | string
  discountPercentage: string
  discountFixed: string
  discountComment: string
  discountId?: string
  customDiscountName?: string
  customDiscountValue?: string
  customDiscountType?: 'FixedAmount' | 'Percentage'

  rateCode: string
  ratePlan: string
  mealPlan: string


  extras: { id: number; item: string; qty: number; price?: number; customName?: string }[]

  specialRequests: string

  depositAmountReceived: string
  paymentMethod: string
  paidAmount: string
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
}

const initialState: ReservationDraft = {
  bookingSource: '',
  otaSource: '',

  reservationStatus: '',
  optionExpiryDate: '',

  isGroupReservation: false,

  firstName: '',
  middleName: '',
  surName: '',
  salutation: '',
  dateOfBirth: '',

  language: '',

  email: '',
  phone: '',

  nationality: '',
  idNumber: '',
  creatorID: '',

  addressLine: '',
  addressType: 'Home',
  city: '',
  postalCode: '',
  state: '',
  countryCode: '',

  notes: '',

  checkInDate: '',
  checkOutDate: '',
  nights: '',

  adultCount: 1,
  childCount: 0,
  infantCount: 0,

  rooms: [{ id: 0, roomType: '', roomView: '', roomCount: 1, roomNumbers: [] }],

  discountType: 'none',
  discountPercentage: '',
  discountFixed: '',
  discountComment: '',
  discountId: '',
  customDiscountName: '',
  customDiscountValue: '',
  customDiscountType: 'Percentage',

  rateCode: '',
  ratePlan: '',
  mealPlan: '',


  extras: [],

  specialRequests: '',

  depositAmountReceived: '',
  paymentMethod: '',
  paidAmount: '',
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
