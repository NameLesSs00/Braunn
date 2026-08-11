import { Outlet } from 'react-router-dom'
import { MaintenanceTranslationBoundary } from '../../../pages/maintenance/components/MaintenanceTranslationBoundary'
import { MaintenanceSidebar } from '../MaintenanceSidebar/MaintenanceSidebar'

export function MaintenanceLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FC]">
      <MaintenanceTranslationBoundary>
        <div className="flex h-full">
          <div className="shrink-0">
            <MaintenanceSidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <main className="min-w-0 flex-1 overflow-y-auto px-8 pb-10">
              <Outlet />
            </main>
          </div>
        </div>
      </MaintenanceTranslationBoundary>
    </div>
  )
}
