import { configureStore } from '@reduxjs/toolkit'
import { roomTypesReducer } from '../features/roomTypes/roomTypesSlice'
import { reservationsReducer } from '../features/reservations/reservationsSlice'
import { roomsReducer } from '../features/rooms/roomsSlice'
import { guestsReducer } from '../features/guests/guestsSlice'
import { housekeepingReducer } from '../features/housekeeping/housekeepingSlice'
import { notificationsReducer } from '../features/notifications/notificationsSlice'
import { draftReducer } from '../features/reservations/draftSlice'
import { shiftReducer } from '../features/shift/shiftSlice'
import { additionalServicesReducer } from '../features/admin/additionalServicesSlice'
import { ratePlansReducer } from '../features/ratePlans/ratePlansSlice'

import { authReducer } from '../features/auth/authSlice'

import { pmsReducer } from '../features/pms/pmsSlice'
import { financialSettingsReducer } from '../features/adminFinancialSettings/financialSettingsSlice'
import { reportsReducer } from '../features/reports/reportsSlice'
import { mealPlansReducer } from '../features/admin/mealPlansSlice'
import { optionalReservationsReducer } from '../features/reservations/optionalReservationsSlice'
import { opsReducer } from '../features/ops/opsSlice'
import { requestsReducer } from '../features/requests/requestsSlice'
import perPersonPricingReducer from '../features/perPersonPricing/perPersonPricingSlice'
import groupPricingReducer from '../features/groupPricing/groupPricingSlice'
import { localAriReducer } from '../features/localAri/localAriSlice'
import { corporateAccountsReducer } from '../features/corporateAccounts/corporateAccountsSlice'
import groupContractReducer from '../features/GroupContract/GroupContractSlice'
import { localReservationsReducer } from '../features/localReservations/localReservationsSlice'
import { hkmInventoryUnitsReducer } from '../features/HKfeatures/hkmInventoryUnits/hkmInventoryUnitsSlice'
import { hkmInventoryCategoriesReducer } from '../features/HKfeatures/hkmInventoryCategories/hkmInventoryCategoriesSlice'
import { hkmInventoryItemsReducer } from '../features/HKfeatures/hkmInventoryItems/hkmInventoryItemsSlice'
import { hkmIssuesReducer } from '../features/HKfeatures/hkmIssues/hkmIssuesSlice'
import { hkmPurchasesReducer } from '../features/HKfeatures/hkmPurchases/hkmPurchasesSlice'
import { departmentsReducer } from '../features/HRMfeatures/departments/departmentsSlice'
import { hrShiftsReducer } from '../features/HRMfeatures/shifts/hrShiftsSlice'
import shiftAssignmentsReducer from '../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice'
import { positionsReducer } from '../features/HRMfeatures/positions/positionsSlice'
import { hrEmployeesReducer } from '../features/HRMfeatures/employees/hrEmployeesSlice'
import { bonusesReducer } from '../features/HRMfeatures/bonuses/bonusesSlice'
import { deductionsReducer } from '../features/HRMfeatures/deductions/deductionsSlice'
import { lostFoundCategoriesReducer } from '../features/HKfeatures/lostFoundCategories/lostFoundCategoriesSlice'
import { lostAndFoundReducer } from '../features/HKfeatures/lostAndFound/lostAndFoundSlice'
import { hrLeavesReducer } from '../features/HRMfeatures/leaves/hrLeavesSlice'
import { hrPayrollReducer } from '../features/HRMfeatures/payroll/hrPayrollSlice'
import { hrTerminationsReducer } from '../features/HRMfeatures/terminations/hrTerminationsSlice'
import { laundryInventoryItemsReducer } from '../features/Laundryfeatures/laundryInventoryItems/laundryInventoryItemsSlice';
import { laundryInventoryCategoriesReducer } from '../features/Laundryfeatures/laundryInventoryCategories/laundryInventoryCategoriesSlice';
import { laundryInventoryUnitsReducer } from '../features/Laundryfeatures/laundryInventoryUnits/laundryInventoryUnitsSlice';
import { laundryTypesReducer } from '../features/Laundryfeatures/laundryTypes/laundryTypesSlice';
import { laundryIssuesReducer } from '../features/Laundryfeatures/laundryIssues/laundryIssuesSlice';
import { laundryPurchasesReducer } from '../features/Laundryfeatures/laundryPurchases/laundryPurchasesSlice';

export const store = configureStore({
  reducer: {
    roomTypes: roomTypesReducer,
    reservations: reservationsReducer,
    rooms: roomsReducer,
    guests: guestsReducer,
    housekeeping: housekeepingReducer,
    notifications: notificationsReducer,
    reservationDraft: draftReducer,
    shift: shiftReducer,
    additionalServices: additionalServicesReducer,
    ratePlans: ratePlansReducer,

    auth: authReducer,

    pms: pmsReducer,
    financialSettings: financialSettingsReducer,
    reports: reportsReducer,
    mealPlans: mealPlansReducer,
    optionalReservations: optionalReservationsReducer,
    ops: opsReducer,
    requests: requestsReducer,
    perPersonPricing: perPersonPricingReducer,
    groupPricing: groupPricingReducer,
    localAri: localAriReducer,
    corporateAccounts: corporateAccountsReducer,
    groupContract: groupContractReducer,
    localReservations: localReservationsReducer,
    hkmInventoryUnits: hkmInventoryUnitsReducer,
    hkmInventoryCategories: hkmInventoryCategoriesReducer,
    hkmInventoryItems: hkmInventoryItemsReducer,
    hkmIssues: hkmIssuesReducer,
    hkmPurchases: hkmPurchasesReducer,
    departments: departmentsReducer,
    hrShifts: hrShiftsReducer,
    shiftAssignments: shiftAssignmentsReducer,
    positions: positionsReducer,
    hrEmployees: hrEmployeesReducer,
    bonuses: bonusesReducer,
    deductions: deductionsReducer,
    lostFoundCategories: lostFoundCategoriesReducer,
    lostAndFound: lostAndFoundReducer,
    hrLeaves: hrLeavesReducer,
    hrPayroll: hrPayrollReducer,
    hrTerminations: hrTerminationsReducer,
    laundryInventoryItems: laundryInventoryItemsReducer,
    laundryInventoryCategories: laundryInventoryCategoriesReducer,
    laundryInventoryUnits: laundryInventoryUnitsReducer,
    laundryTypes: laundryTypesReducer,
    laundryIssues: laundryIssuesReducer,
    laundryPurchases: laundryPurchasesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
