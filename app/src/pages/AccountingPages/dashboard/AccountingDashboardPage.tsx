import { Calculator } from 'lucide-react'
import { ComingSoonPage } from '../../systems/components/ComingSoonPage'
import { AccountingDashboardContent } from './AccountingDashboardContent'
import { features } from '../../../config/features'
import { AccountingLayout } from '../../../widgets/layout/AccountingLayout/AccountingLayout'

export function AccountingDashboardPage() {
  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Accounting"
        icon={<Calculator />}
        accentColor="#0D9488"
      />
    )
  }

  return (
    <AccountingLayout>
      <AccountingDashboardContent />
    </AccountingLayout>
  )
}
