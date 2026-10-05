import { useLocation } from 'react-router-dom'
import { SalesAndRevenueLayout } from '../../../widgets/layout/SalesAndRevenueLayout/SalesAndRevenueLayout'
import { routes } from '../../../shared/lib/routes'

// All existing page components — no need to move them
import { SalesRevenueDashboardPage } from '../../salesRevenue/SalesRevenueDashboardPage'
import { RateCalendarPage } from '../../salesRevenue/RateCalendarPage'
import { RoomTypesPage } from '../../salesRevenue/RoomTypesPage'
import { PricingPage } from '../../salesRevenue/PricingPage'
import { CorporateAccountPage } from '../../salesRevenue/CorporateAccountPage'
import { GroupContractsPage } from '../../salesRevenue/GroupContractsPage'
import { ProductionReportPage } from '../../salesRevenue/ProductionReportPage'
import { DiscountsPage } from '../../salesRevenue/DiscountsPage'

function ActivePage() {
  const { pathname } = useLocation()

  if (pathname === routes.salesAndRevenue.rateCalendar) return <RateCalendarPage />
  if (pathname === routes.salesAndRevenue.roomTypes) return <RoomTypesPage />
  if (pathname === routes.salesAndRevenue.pricing) return <PricingPage />
  if (pathname === routes.salesAndRevenue.discounts) return <DiscountsPage />
  if (pathname === routes.salesAndRevenue.corporateAccount) return <CorporateAccountPage />
  if (pathname === routes.salesAndRevenue.groupContracts) return <GroupContractsPage />
  if (pathname === routes.salesAndRevenue.productionReport) return <ProductionReportPage />

  return <SalesRevenueDashboardPage />
}

export function SalesAndRevenueDashboardPage() {
  return (
    <SalesAndRevenueLayout>
      <ActivePage />
    </SalesAndRevenueLayout>
  )
}
