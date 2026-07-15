import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ComplaintsPage } from './pages/complaints/ComplaintsPage'
import { ReservationsPage } from './pages/reservations/ReservationsPage'
import { GroupReservationDetailsPage } from './pages/groupReservations/GroupReservationDetailsPage'
import { RoomPlanPage } from './pages/roomPlan/RoomPlanPage'
import { GuestsPage } from './pages/guests/GuestsPage'
import { HousekeepingPage } from './pages/housekeeping/HousekeepingPage'
import { ServicesRequestsPage } from './pages/servicesRequests/ServicesRequestsPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { InHouseListPage } from './pages/inHouseList/InHouseListPage'
import { RoomAllocationPage } from './pages/roomAllocation/RoomAllocationPage'
import { RoomAllocationDetailsPage } from './pages/roomAllocation/RoomAllocationDetailsPage'
import { GroupRoomAllocationPage } from './pages/roomAllocation/GroupRoomAllocationPage'
import { SalesRevenueDashboardPage } from './pages/salesRevenue/SalesRevenueDashboardPage'
import { RateCalendarPage } from './pages/salesRevenue/RateCalendarPage'
import { RoomTypesPage } from './pages/salesRevenue/RoomTypesPage'
import { PricingPage } from './pages/salesRevenue/PricingPage'
import { CorporateAccountPage } from './pages/salesRevenue/CorporateAccountPage'
import { CorporateContractDetailsPage } from './pages/salesRevenue/CorporateContractDetailsPage'
import { GroupContractsPage } from './pages/salesRevenue/GroupContractsPage'
import { ProductionReportPage } from './pages/salesRevenue/ProductionReportPage'
import { DiscountsPage } from './pages/salesRevenue/DiscountsPage'
import { CorporateCancellationPoliciesPage } from './pages/policies/CorporateCancellationPoliciesPage'
import { EarlyCheckoutPoliciesPage } from './pages/policies/EarlyCheckoutPoliciesPage'
import { RoomChangePoliciesPage } from './pages/policies/RoomChangePoliciesPage'
import { LateCheckoutPoliciesPage } from './pages/policies/LateCheckoutPoliciesPage'
import { ExtendStayPoliciesPage } from './pages/policies/ExtendStayPoliciesPage'
import { routes } from './shared/lib/routes'
import { DashboardLayout } from './widgets/layout/DashboardLayout/DashboardLayout'
import { LaundryLayout } from './widgets/layout/LaundryLayout/LaundryLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { AuthGuard } from './shared/ui/AuthGuard'
import { LaundryOverviewPage } from './pages/laundry/overview/LaundryOverviewPage'
import { RoomRequestsPage } from './pages/laundry/roomRequests/RoomRequestsPage'
import { InventoryLaundryPage } from './pages/laundry/inventory/InventoryLaundryPage'
import { SettingsLaundryPage } from './pages/laundry/settings/SettingsLaundryPage'
import { HousekeepingLayout } from './widgets/layout/HousekeepingLayout/HousekeepingLayout'
import { DashboardHKPage } from './pages/HKPages/dashboard/DashboardHKPage'
import { CleaningTasksHKPage } from './pages/HKPages/cleaningTasks/CleaningTasksHKPage'
import { GuestRequestsHKPage } from './pages/HKPages/guestRequests/GuestRequestsHKPage'
import { FoundsAndLostHKPage } from './pages/HKPages/foundsAndLost/FoundsAndLostHKPage'
import { InventoryHKPage } from './pages/HKPages/inventory/InventoryHKPage'
import { SettingsHKPage } from './pages/HKPages/settings/SettingsHKPage'
import { RoomStatusHKPage } from './pages/HKPages/roomStatus/RoomStatusHKPage'
import { HRMLayout } from './widgets/layout/HRMLayout/HRMLayout'
import { DashboardHRMPage } from './pages/HRMPages/dashboard/DashboardHRMPage'
import { EmployeesHRMPage } from './pages/HRMPages/employees/EmployeesHRMPage'
import { ShiftManagementHRMPage } from './pages/HRMPages/shiftManagement/ShiftManagementHRMPage'
import { AttendanceHRMPage } from './pages/HRMPages/attendance/AttendanceHRMPage'
import { LeaveManagementHRMPage } from './pages/HRMPages/leaveManagement/LeaveManagementHRMPage'
import { DepartmentsHRMPage } from './pages/HRMPages/departments/DepartmentsHRMPage'
import { SalaryIncrementsHRMPage } from './pages/HRMPages/salaryIncrements/SalaryIncrementsHRMPage'
import { PayrollHRMPage } from './pages/HRMPages/payroll/PayrollHRMPage'
import { SettingHRMPage } from './pages/HRMPages/setting/SettingHRMPage'
import { DepartmentsTab } from './pages/HRMPages/setting/tabs/DepartmentsTab'
import { ShiftsTab } from './pages/HRMPages/setting/tabs/ShiftsTab'
import { NotificationsTab } from './pages/HRMPages/setting/tabs/NotificationsTab'
import { PositionsTab } from './pages/HRMPages/setting/tabs/PositionsTab'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.login} element={<LoginPage />} />
        
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Navigate to={routes.dashboard} replace />} />

          <Route element={<DashboardLayout />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />
            <Route path={routes.reservations} element={<ReservationsPage />} />
            <Route path={routes.groupReservations} element={<Navigate to={`${routes.reservations}?tab=group`} replace />} />
            <Route path={routes.groupReservationDetails} element={<GroupReservationDetailsPage />} />
            <Route path={routes.roomPlan} element={<RoomPlanPage />} />
            <Route path={routes.guests} element={<GuestsPage />} />
            <Route path={routes.reports} element={<ReportsPage />} />
            <Route path={routes.complaints} element={<ComplaintsPage />} />
            <Route path={routes.housekeeping} element={<HousekeepingPage />} />
            <Route path={routes.servicesRequests} element={<ServicesRequestsPage />} />
            <Route path={routes.inHouseList} element={<InHouseListPage />} />
            <Route path={routes.roomAllocation} element={<RoomAllocationPage />} />
            <Route path={routes.roomAllocationGroup} element={<GroupRoomAllocationPage />} />
            <Route path={routes.roomAllocationDetails} element={<RoomAllocationDetailsPage />} />
            <Route path={routes.salesRevenue.dashboard} element={<SalesRevenueDashboardPage />} />
            <Route path={routes.salesRevenue.rateCalendar} element={<RateCalendarPage />} />
            <Route path={routes.salesRevenue.roomTypes} element={<RoomTypesPage />} />
            <Route path={routes.salesRevenue.pricing} element={<PricingPage />} />
            <Route path={routes.salesRevenue.corporateAccount} element={<CorporateAccountPage />} />
            <Route path={routes.salesRevenue.corporateContractDetails} element={<CorporateContractDetailsPage />} />
            <Route path={routes.salesRevenue.groupContracts} element={<GroupContractsPage />} />
            <Route path={routes.salesRevenue.productionReport} element={<ProductionReportPage />} />
            <Route path={routes.salesRevenue.discounts} element={<DiscountsPage />} />
            
            {/* Policies Module */}
            <Route path={routes.policies.corporateCancellation} element={<CorporateCancellationPoliciesPage />} />
            <Route path={routes.policies.earlyCheckout} element={<EarlyCheckoutPoliciesPage />} />
            <Route path={routes.policies.roomChange} element={<RoomChangePoliciesPage />} />
            <Route path={routes.policies.lateCheckout} element={<LateCheckoutPoliciesPage />} />
            <Route path={routes.policies.extendStay} element={<ExtendStayPoliciesPage />} />
          </Route>

          <Route element={<LaundryLayout />}>
            <Route path="/laundry" element={<Navigate to={routes.laundry.overview} replace />} />
            <Route path={routes.laundry.overview} element={<LaundryOverviewPage />} />
            <Route path={routes.laundry.roomRequests} element={<RoomRequestsPage />} />
            <Route path={routes.laundry.inventory} element={<InventoryLaundryPage />} />
            <Route path={routes.laundry.settings} element={<SettingsLaundryPage />} />
          </Route>

          <Route element={<HousekeepingLayout />}>
            <Route path="/HK" element={<Navigate to={routes.hk.dashboard} replace />} />
            <Route path={routes.hk.dashboard} element={<DashboardHKPage />} />
            <Route path={routes.hk.roomStatus} element={<RoomStatusHKPage />} />
            <Route path={routes.hk.cleaningTasks} element={<CleaningTasksHKPage />} />
            <Route path={routes.hk.guestRequests} element={<GuestRequestsHKPage />} />
            <Route path={routes.hk.foundsAndLost} element={<FoundsAndLostHKPage />} />
            <Route path={routes.hk.inventory} element={<InventoryHKPage />} />
            <Route path={routes.hk.settings} element={<SettingsHKPage />} />
          </Route>

          <Route element={<HRMLayout />}>
            <Route path="/HRM" element={<Navigate to={routes.hrm.dashboard} replace />} />
            <Route path={routes.hrm.dashboard} element={<DashboardHRMPage />} />
            <Route path={routes.hrm.employees} element={<EmployeesHRMPage />} />
            <Route path={routes.hrm.shiftManagement} element={<ShiftManagementHRMPage />} />
            <Route path={routes.hrm.attendance} element={<AttendanceHRMPage />} />
            <Route path={routes.hrm.leaveManagement} element={<LeaveManagementHRMPage />} />
            <Route path={routes.hrm.departments} element={<DepartmentsHRMPage />} />
            <Route path={routes.hrm.salaryIncrements} element={<SalaryIncrementsHRMPage />} />
            <Route path={routes.hrm.payroll} element={<PayrollHRMPage />} />
            <Route path={routes.hrm.setting.root} element={<SettingHRMPage />}>
              <Route index element={<Navigate to={routes.hrm.setting.departments} replace />} />
              <Route path={routes.hrm.setting.departments} element={<DepartmentsTab />} />
              <Route path={routes.hrm.setting.shifts} element={<ShiftsTab />} />
              <Route path={routes.hrm.setting.notifications} element={<NotificationsTab />} />
              <Route path={routes.hrm.setting.positions} element={<PositionsTab />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
