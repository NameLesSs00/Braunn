import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { routes } from '../../../shared/lib/routes'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import { NewReservationModal } from '../../reservations/NewReservationModal/NewReservationModal'
import { NewReservationModalProvider } from './NewReservationModalContext'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { addNotification, removeNotification } from '../../../features/notifications/notificationsSlice'
import { ShiftStartModal } from '../../../features/shiftStart'
import { SelectReservationTypeModal } from '../../reservations/SelectReservationTypeModal/SelectReservationTypeModal'
import { useEffect } from 'react'

const titleByPath: Record<string, string> = {
  [routes.dashboard]: 'Dashboard',
  [routes.reservations]: 'Reservations',
  [routes.roomPlan]: 'Room Plan',
  [routes.guests]: 'Guests',
  [routes.reports]: 'Reports',
  [routes.complaints]: 'Complaints',
  [routes.housekeeping]: 'Housekeeping',
  [routes.servicesRequests]: 'Services & Requests',
  [routes.inHouseList]: 'In House list',
  [routes.roomAllocation]: 'Room Allocation',
  [routes.salesRevenue.dashboard]: 'Sales & Revenue',
  [routes.salesRevenue.rateCalendar]: 'Sales & Revenue',
  [routes.salesRevenue.roomTypes]: 'Sales & Revenue',
  [routes.salesRevenue.pricing]: 'Sales & Revenue',
  [routes.salesRevenue.corporateAccount]: 'Sales & Revenue',
  [routes.salesRevenue.groupContracts]: 'Sales & Revenue',
  [routes.salesRevenue.productionReport]: 'Sales & Revenue',
}

export function DashboardLayout() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const title = titleByPath[location.pathname] ?? 'Dashboard'
  const [selectReservationTypeOpen, setSelectReservationTypeOpen] = useState(false)
  const [newReservationOpen, setNewReservationOpen] = useState(false)
  const [shiftStartOpen, setShiftStartOpen] = useState(false)

  const isShiftActive = useAppSelector((state) => state.shift.isShiftActive)
  const notifications = useAppSelector((state) => state.notifications.items)

  useEffect(() => {
    // If shift is not active and no shift_start notification exists, add one
    if (!isShiftActive) {
      const hasShiftNotification = notifications.some((n) => n.type === 'shift_start')
      if (!hasShiftNotification) {
        dispatch(
          addNotification({
            type: 'shift_start',
          }),
        )
      }
    } else {
      // If shift is active, remove any existing shift_start notification
      const shiftNotification = notifications.find((n) => n.type === 'shift_start')
      if (shiftNotification) {
        dispatch(removeNotification(shiftNotification.id))
      }
    }
  }, [isShiftActive, notifications, dispatch, removeNotification])

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FC]">
      <NewReservationModalProvider value={{ openNewReservation: () => setNewReservationOpen(true) }}>
        <div className="flex h-full">
          <div className="shrink-0">
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {!isShiftActive && (
              <div 
                className="flex cursor-pointer items-center justify-center gap-3 bg-amber-400 px-8 py-2.5 text-center transition-colors hover:bg-amber-500"
                onClick={() => setShiftStartOpen(true)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-4 w-4 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-amber-950">
                  You must start your shift now to access all features. 
                  <span className="ml-2 underline decoration-amber-900/30 underline-offset-2">Start Shift Now →</span>
                </p>
              </div>
            )}
            <Header title={title} onAddReservationClick={() => setSelectReservationTypeOpen(true)} />
            <main className="min-w-0 flex-1 overflow-y-auto px-8 pb-10">
              <Outlet />
            </main>
          </div>
        </div>
      </NewReservationModalProvider>

      <SelectReservationTypeModal
        open={selectReservationTypeOpen}
        onClose={() => setSelectReservationTypeOpen(false)}
        onSelectIndividual={() => {
          setSelectReservationTypeOpen(false)
          setNewReservationOpen(true)
        }}
      />
      <NewReservationModal open={newReservationOpen} onClose={() => setNewReservationOpen(false)} />
      <ShiftStartModal open={shiftStartOpen} onClose={() => setShiftStartOpen(false)} />
    </div>
  )
}
