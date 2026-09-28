import { ShoppingCart } from 'lucide-react'
import { ComingSoonPage } from '../../systems/components/ComingSoonPage'
import { PurchaseDashboardContent } from './PurchaseDashboardContent'
import { features } from '../../../config/features'
import { PurchaseLayout } from '../../../widgets/layout/PurchaseLayout/PurchaseLayout'

export function PurchaseDashboardPage() {
  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Purchase"
        icon={<ShoppingCart />}
        accentColor="#EA580C"
      />
    )
  }

  return (
    <PurchaseLayout>
      <PurchaseDashboardContent />
    </PurchaseLayout>
  )
}
