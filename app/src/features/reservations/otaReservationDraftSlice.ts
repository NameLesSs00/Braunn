import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OtaRateEntry {
  id: number
  amountAfterTax: number
  amountBeforeTax: number
  effectiveDate: string
  expireDate: string
}

export interface OtaRoomRate {
  id: number
  invCode: string
  numberOfUnits: number
  ratePlanCode: string
  rates: OtaRateEntry[]
}

export interface OtaGuestCount {
  id: number
  ageQualifyingCode: string
  count: number
}

export interface OtaSpecialRequest {
  id: number
  requestCode: string
  text: string
}

export interface OtaComment {
  id: number
  guestViewable: string
  text: string
}

export interface OtaReservationDraft {
  // Booking Metadata
  hotelCode: string
  creatorID: string
  currency: string
  resStatus: string
  channelCode: string
  channelName: string
  resIDValue: string
  resIDType: string
  createDateTime: string

  // Guest
  salutation: string
  firstName: string
  middleName: string
  surName: string
  email: string
  phoneNo: string
  phoneTechType: string
  phoneLocationType: string
  guestID: string
  profileType: string

  // Address
  addressLine: string
  addressType: string
  city: string
  countryCode: string
  postalCode: string
  state: string

  // Room Stay
  roomStayID: string
  mealCode: string
  mealPlanIndicator: string
  isGuestPerRoom: string
  guestIDs: string
  membershipAccountID: string
  membershipBonusCode: string
  membershipProgramCode: string
  timeSpanStart: string
  timeSpanEnd: string
  totalAmountAfterTax: number
  totalAmountBeforeTax: number
  totalTaxAmount: number

  // Repeatable
  roomRates: OtaRoomRate[]
  guestCounts: OtaGuestCount[]
  specialRequests: OtaSpecialRequest[]
  comments: OtaComment[]

  // Guarantee
  guaranteeCode: string
  guaranteeType: string
  cardCode: string
  cardHolderName: string
  cardNo: string
  cardType: string
  expire: string
  seriesCode: string

  // Financial
  depositAmount: number
}

const today = new Date().toISOString().split('T')[0]

const initialState: OtaReservationDraft = {
  hotelCode: '',
  creatorID: '',
  currency: 'USD',
  resStatus: 'Reserved',
  channelCode: '',
  channelName: '',
  resIDValue: '',
  resIDType: '',
  createDateTime: today,

  salutation: '',
  firstName: '',
  middleName: '',
  surName: '',
  email: '',
  phoneNo: '',
  phoneTechType: '',
  phoneLocationType: '',
  guestID: '',
  profileType: '',

  addressLine: '',
  addressType: '',
  city: '',
  countryCode: '',
  postalCode: '',
  state: '',

  roomStayID: '',
  mealCode: '',
  mealPlanIndicator: '',
  isGuestPerRoom: '',
  guestIDs: '',
  membershipAccountID: '',
  membershipBonusCode: '',
  membershipProgramCode: '',
  timeSpanStart: today,
  timeSpanEnd: today,
  totalAmountAfterTax: 0,
  totalAmountBeforeTax: 0,
  totalTaxAmount: 0,

  roomRates: [
    {
      id: 1,
      invCode: '',
      numberOfUnits: 1,
      ratePlanCode: '',
      rates: [
        { id: 1, amountAfterTax: 0, amountBeforeTax: 0, effectiveDate: today, expireDate: today },
      ],
    },
  ],
  guestCounts: [
    { id: 1, ageQualifyingCode: '10', count: 1 },
  ],
  specialRequests: [],
  comments: [],

  guaranteeCode: '',
  guaranteeType: '',
  cardCode: '',
  cardHolderName: '',
  cardNo: '',
  cardType: '',
  expire: '',
  seriesCode: '',

  depositAmount: 0,
}

const otaReservationDraftSlice = createSlice({
  name: 'otaReservationDraft',
  initialState,
  reducers: {
    updateOtaDraft(state, action: PayloadAction<Partial<OtaReservationDraft>>) {
      return { ...state, ...action.payload }
    },
    resetOtaDraft() {
      return initialState
    },
  },
})

export const { updateOtaDraft, resetOtaDraft } = otaReservationDraftSlice.actions
export default otaReservationDraftSlice.reducer
