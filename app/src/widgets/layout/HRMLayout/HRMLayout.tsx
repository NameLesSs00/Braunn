import { Outlet } from 'react-router-dom'
import { HRMSidebar } from '../HRMSidebar/HRMSidebar'
import { HRMHeader } from '../HRMHeader/HRMHeader'

export function HRMLayout() {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] overflow-hidden">
      <div className="flex-shrink-0 bg-white">
        <HRMSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-shrink-0">
          <HRMHeader />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
