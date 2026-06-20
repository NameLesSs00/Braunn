export interface GuaranteePaymentCard {
  cardCode?: string;
  cardHolderName?: string;
  cardNo?: string;
  cardType?: string;
  expire?: string;
  seriesCode?: string;
}

export interface Guarantee {
  guaranteeCode?: string;
  guaranteeType?: string;
  paymentCard?: GuaranteePaymentCard;
}

export interface GuestAddress {
  addressLine?: string;
  addressType?: string;
  city?: string;
  countryCode?: string;
  postalCode?: string;
  state?: string;
}

export interface GuestPersonName {
  firstName?: string;
  middleName?: string;
  salutation?: string;
  surName?: string;
}

export interface GuestTelephone {
  locationType?: string;
  phoneNo?: string;
  phoneTechType?: string;
}

export interface GuestDetail {
  address?: GuestAddress;
  email?: string;
  guestID?: string;
  personName?: GuestPersonName;
  profileType?: string;
  telePhone?: GuestTelephone;
}

export interface PointOfSale {
  channelCode?: string;
  channelName?: string;
}

export interface HotelReservationID {
  resIDType?: string;
  resIDValue?: string;
}

export interface ResGlobalInfo {
  hotelReservationIDs?: HotelReservationID[];
}

export interface RoomComment {
  guestViewable?: string;
  text?: string;
}

export interface GuestCount {
  ageQualifyingCode?: string;
  count?: number;
}

export interface MembershipInfo {
  accountID?: string;
  bonusCode?: string;
  programCode?: string;
}

export interface Rate {
  amountAfterTax?: number;
  amountBeforeTax?: number;
  effectiveDate?: string;
  expireDate?: string;
}

export interface RoomRate {
  invCode?: string;
  numberOfUnits?: number;
  ratePlanCode?: string;
  rates?: Rate[];
}

export interface SpecialRequest {
  requestCode?: string;
  text?: string;
}

export interface TimeSpan {
  start?: string;
  end?: string;
}

export interface TotalPrice {
  amountAfterTax?: number;
  amountBeforeTax?: number;
  taxAmount?: number;
}

export interface RoomStay {
  comments?: RoomComment[];
  guestCount?: GuestCount[];
  guestIDs?: string[];
  isGuestPerRoom?: string;
  mealCode?: string;
  mealPlanIndicator?: string;
  memberShipInfo?: MembershipInfo;
  roomRates?: RoomRate[];
  roomStayID?: string;
  specialRequests?: SpecialRequest[];
  timeSpan?: TimeSpan;
  totalPrice?: TotalPrice;
}

export interface UniqueID {
  idValue?: string;
  type?: string;
}

export interface RTError {
  type?: string;
  errorCode?: string;
}

export interface HotelReservation {
  createDateTime?: string;
  creatorID?: string;
  currency?: string;
  guarantee?: Guarantee;
  depositAmount?: number;
  guestDetails?: GuestDetail[];
  hotelCode?: string;
  pos?: PointOfSale;
  resGlobalInfo?: ResGlobalInfo;
  resStatus?: string;
  roomStays?: RoomStay[];
  timeStamp?: string;
  uniqueID?: UniqueID;
  success?: boolean;
  error?: RTError;
}

export interface RateTigerPayload {
  hotelReservation?: HotelReservation;
}

export interface SelectedService {
  additionalServiceId: string;
  quantity: number;
  serviceDate: string;
}

export interface SelectedMealPlan {
  mealPlanId: string;
  price: number;
  serviceDateStart: string;
  serviceDateEnd: string;
}

export interface CreateLocalReservationRequest {
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId: string;
    address: string;
    countryCode: string;
  };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  bookingSource: string;
  reservationType: string;
  currency: string;
  roomRequests: Array<{
    roomTypeId: string;
    quantity: number;
    adults: number;
    children: number;
    ratePlanCode: string;
    pricePerNight: number;
  }>;
  selectedServices: SelectedService[];
  selectedMealPlans: SelectedMealPlan[];
  companions: Array<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address: string;
    nationalId: string;
  }>;
  specialRequests: string;
  comments: string;
}

export type UpdateLocalReservationRequest = CreateLocalReservationRequest;

export interface LocalReservationGuest {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
}

export interface LocalReservationCompanion {
  id: string;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  relationshipToPrimary: string;
}

export interface LocalReservationAdditionalService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceDate: string;
}

export interface LocalReservationMealPlan {
  mealPlanId: string;
  mealPlanCode: string;
  mealPlanName: string;
  pricePerDay: number;
  numberOfNights: number;
  totalCost: number;
  serviceDateStart: string;
  serviceDateEnd: string;
}

export interface LocalReservationFinance {
  grandTotal: number;
  paidAmount: number;
  remainingBalance: number;
  totalAdditionalServices: number;
  totalMealPlanCost: number;
  currency: string;
  paymentStatus: string;
}

export interface LocalReservation {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckOutDate: string;
  status: string;
  channelSource: string;
  roomNumber: string;
  roomTypeName: string;
  guest: LocalReservationGuest;
  companions: LocalReservationCompanion[];
  additionalServices: LocalReservationAdditionalService[];
  mealPlans: LocalReservationMealPlan[];
  specialRequests: string;
  comments: string;
  finance: LocalReservationFinance;
}

export interface UnifiedReservationsQueryParams {
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  status?: string;
  sourceType?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface UnifiedReservationsResponse {
  items: LocalReservation[];
  totalCount: number;
}

