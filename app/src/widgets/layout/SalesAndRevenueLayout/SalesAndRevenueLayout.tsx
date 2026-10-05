import { ReactNode } from 'react'
import { SalesAndRevenueSidebar } from './SalesAndRevenueSidebar'
import { GenericModuleHeader } from '../components/GenericModuleHeader'

export function SalesAndRevenueLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] overflow-hidden">
      <div className="flex-shrink-0 bg-white">
        <SalesAndRevenueSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-shrink-0">
          <GenericModuleHeader title="Sales & Revenue" />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
