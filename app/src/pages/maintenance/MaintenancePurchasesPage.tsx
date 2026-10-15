import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'
import { MaintenancePurchasesView } from './purchases/MaintenancePurchasesView'

export function MaintenancePurchasesPage() {
  return (
    <>
      <MaintenanceHeader NameMaintenance="Maintenance Purchases" />
      <div className="py-6 space-y-6">
        <MaintenancePurchasesView />
      </div>
    </>
  )
}

export default MaintenancePurchasesPage
