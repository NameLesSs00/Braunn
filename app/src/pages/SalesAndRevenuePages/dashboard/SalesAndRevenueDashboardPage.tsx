import { TrendingUp } from 'lucide-react'
import { ComingSoonPage } from '../../systems/components/ComingSoonPage'
import { SalesAndRevenueDashboardContent } from './SalesAndRevenueDashboardContent'
import { features } from '../../../config/features'
import { SalesAndRevenueLayout } from '../../../widgets/layout/SalesAndRevenueLayout/SalesAndRevenueLayout'

export function SalesAndRevenueDashboardPage() {
  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Sales & Revenue"
        icon={<TrendingUp />}
        accentColor="#059669"
      />
    )
  }

  return (
    <SalesAndRevenueLayout>
      <SalesAndRevenueDashboardContent />
    </SalesAndRevenueLayout>
  )
}
