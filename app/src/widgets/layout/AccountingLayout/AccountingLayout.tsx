import { ReactNode } from 'react'
import { AccountingSidebar } from './AccountingSidebar'
import { GenericModuleHeader } from '../components/GenericModuleHeader'

export function AccountingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] overflow-hidden">
      <div className="flex-shrink-0 bg-white">
        <AccountingSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-shrink-0">
          <GenericModuleHeader title="Accounting" />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
