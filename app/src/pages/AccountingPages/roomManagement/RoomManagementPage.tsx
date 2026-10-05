import { features } from '../../../config/features'
import { ComingSoonPage } from '../../systems/components/ComingSoonPage'
import { BsBuilding } from 'react-icons/bs'
import { AccountingLayout } from '../../../widgets/layout/AccountingLayout/AccountingLayout'
import { RoomManagementContent } from './RoomManagementContent'

export function RoomManagementPage() {
  if (!features.enableNewModulesUI) {
    return (
      <ComingSoonPage
        moduleName="Accounting - Room Management"
        icon={<BsBuilding />}
        accentColor="#0D9488"
      />
    )
  }

  return (
    <AccountingLayout>
      <RoomManagementContent />
    </AccountingLayout>
  )
}
