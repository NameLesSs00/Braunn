import { Outlet } from 'react-router-dom'
import { LaundryTranslationBoundary } from '../../../pages/laundry/components/LaundryTranslationBoundary'
import { LaundrySidebar } from '../LaundrySidebar/LaundrySidebar'
import { LaundryHeader } from '../LaundryHeader/LaundryHeader'

export function LaundryLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FC]">
      <LaundryTranslationBoundary>
        <div className="flex h-full">
          <div className="shrink-0">
            <LaundrySidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <LaundryHeader />
            <main className="min-w-0 flex-1 overflow-y-auto px-8 pb-10">
              <Outlet />
            </main>
          </div>
        </div>
      </LaundryTranslationBoundary>
    </div>
  )
}
