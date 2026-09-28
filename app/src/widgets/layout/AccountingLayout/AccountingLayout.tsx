import { ReactNode } from 'react'
import { AccountingSidebar } from './AccountingSidebar'

export function AccountingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] overflow-hidden">
      <div className="flex-shrink-0 bg-white">
        <AccountingSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-8">
          <h1 className="text-xl font-semibold text-slate-800">Accounting</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
