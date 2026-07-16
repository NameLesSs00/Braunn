import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

import { routes } from '../../../shared/lib/routes'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import { NewReservationModal } from '../../reservations/NewReservationModal/NewReservationModal'
import { NewReservationModalProvider, type OpenNewReservationOptions } from './NewReservationModalContext'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { addNotification, hydrateGroupReservationDraftNotifications, hydrateReservationDraftNotifications, removeNotification } from '../../../features/notifications/notificationsSlice'
import { resetDraft } from '../../../features/reservations/draftSlice'
import { ShiftStartModal } from '../../../features/shiftStart'
import { selectIsShiftActive, fetchBusinessDate, fetchCurrentShift } from '../../../features/shift/shiftSlice'
import { SelectReservationTypeModal } from '../../reservations/SelectReservationTypeModal/SelectReservationTypeModal'
import { OtaReservationModal } from '../../reservations/OtaReservationModal/OtaReservationModal'
import { GroupReservationModal } from '../../reservations/GroupReservationModal/GroupReservationModal'
import { CorporateReservationModal } from '../../reservations/CorporateReservationModal/CorporateReservationModal'
import { useEffect } from 'react'
import { getSavedReservationDrafts, type SavedReservationStep, type SavedReservationStep4Page } from '../../../features/reservations/reservationDraftStorage'
import {
  getSavedGroupReservationDraft,
  getSavedGroupReservationDrafts,
} from '../../../features/reservations/groupReservationDraftStorage'
import type { GroupReservationDraftValue, GroupWizardStep } from '../../../models/GroupReservation'

const titleByPath: Record<string, string> = {
  [routes.dashboard]: 'Dashboard',
  [routes.reservations]: 'Reservations',
  [routes.groupReservations]: 'Group Reservations',
  [routes.roomPlan]: 'Room Plan',
  [routes.guests]: 'Guests',
  [routes.reports]: 'Reports',
  [routes.complaints]: 'Complaints',
  [routes.housekeeping]: 'Housekeeping',
  [routes.servicesRequests]: 'Services & Requests',
  [routes.inHouseList]: 'In House list',
  [routes.roomAllocation]: 'Room Allocation',
  [routes.roomAllocationGroup]: 'Room Allocation',
  [routes.salesRevenue.dashboard]: 'Sales & Revenue',
  [routes.salesRevenue.rateCalendar]: 'Sales & Revenue',
  [routes.salesRevenue.roomTypes]: 'Sales & Revenue',
  [routes.salesRevenue.pricing]: 'Sales & Revenue',
  [routes.salesRevenue.corporateAccount]: 'Sales & Revenue',
  [routes.salesRevenue.groupContracts]: 'Sales & Revenue',
  [routes.salesRevenue.productionReport]: 'Sales & Revenue',
  [routes.salesRevenue.packages]: 'Sales & Revenue',
  [routes.policies.corporateCancellation]: 'Policies',
  [routes.policies.earlyCheckout]: 'Policies',
  [routes.policies.roomChange]: 'Policies',
  [routes.policies.lateCheckout]: 'Policies',
  [routes.policies.extendStay]: 'Policies',
}

export function DashboardLayout() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const title = location.pathname.startsWith('/group-reservations/')
    ? 'Group Reservations Details'
    : titleByPath[location.pathname] ?? 'Dashboard'
  const [selectReservationTypeOpen, setSelectReservationTypeOpen] = useState(false)
  const [newReservationOpen, setNewReservationOpen] = useState(false)
  const [corporateReservationOpen, setCorporateReservationOpen] = useState(false)
  const [otaReservationOpen, setOtaReservationOpen] = useState(false)
  const [groupReservationOpen, setGroupReservationOpen] = useState(false)
  const [shiftStartOpen, setShiftStartOpen] = useState(false)
  const [activeReservationDraftId, setActiveReservationDraftId] = useState<string | null>(null)
  const [initialReservationStep, setInitialReservationStep] = useState<SavedReservationStep>(1)
  const [initialReservationStep4Page, setInitialReservationStep4Page] = useState<SavedReservationStep4Page>(1)
  const [activeGroupReservationDraftId, setActiveGroupReservationDraftId] = useState<string | null>(null)
  const [initialGroupReservationStep, setInitialGroupReservationStep] = useState<GroupWizardStep>(1)
  const [initialGroupReservationDraft, setInitialGroupReservationDraft] = useState<GroupReservationDraftValue | null>(null)

  const isShiftActive = useAppSelector(selectIsShiftActive)
  const shiftStatus = useAppSelector((state) => state.shift.shiftStatus)
  const notifications = useAppSelector((state) => state.notifications.items)

  // ── Bootstrap: fetch server time + active shift once on app mount ──────────
  useEffect(() => {
    void dispatch(fetchBusinessDate())
    void dispatch(fetchCurrentShift())
    dispatch(hydrateReservationDraftNotifications(getSavedReservationDrafts()))
    dispatch(hydrateGroupReservationDraftNotifications(getSavedGroupReservationDrafts()))
  }, [dispatch])

  const openNewReservation = (options?: OpenNewReservationOptions) => {
    if (!options?.draftId) {
      dispatch(resetDraft())
    }

    setActiveReservationDraftId(options?.draftId ?? null)
    setInitialReservationStep(options?.step ?? 1)
    setInitialReservationStep4Page(options?.step4Page ?? 1)
    setNewReservationOpen(true)
  }

  const openGroupReservation = (draftId?: string) => {
    const savedDraft = draftId ? getSavedGroupReservationDraft(draftId) : null

    setActiveGroupReservationDraftId(savedDraft?.id ?? null)
    setInitialGroupReservationStep(savedDraft?.step ?? 1)
    setInitialGroupReservationDraft(savedDraft?.draft ?? null)
    setGroupReservationOpen(true)
  }

  useEffect(() => {
    // If shift is not active (and we are done loading) and no shift_start notification exists, add one
    if (!isShiftActive && shiftStatus !== 'idle' && shiftStatus !== 'loading') {
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
      <NewReservationModalProvider value={{ openNewReservation }}>
        <div className="flex h-full">
          <div className="shrink-0">
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {(!isShiftActive && shiftStatus !== 'idle' && shiftStatus !== 'loading') && (
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
            <Header
              title={title}
              onAddReservationClick={() => setSelectReservationTypeOpen(true)}
              onOpenGroupReservationDraft={openGroupReservation}
            />
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
          dispatch(resetDraft())
          openNewReservation()
        }}
        onSelectCorporate={() => {
          setSelectReservationTypeOpen(false)
          setCorporateReservationOpen(true)
        }}
        onSelectOta={() => {
          setSelectReservationTypeOpen(false)
          setOtaReservationOpen(true)
        }}
        onSelectGroup={() => {
          setSelectReservationTypeOpen(false)
          openGroupReservation()
        }}
      />
      <NewReservationModal
        open={newReservationOpen}
        activeDraftId={activeReservationDraftId}
        initialStep={initialReservationStep}
        initialStep4Page={initialReservationStep4Page}
        onActiveDraftIdChange={setActiveReservationDraftId}
        onClose={() => setNewReservationOpen(false)}
      />
      <CorporateReservationModal open={corporateReservationOpen} onClose={() => setCorporateReservationOpen(false)} />
      <OtaReservationModal open={otaReservationOpen} onClose={() => setOtaReservationOpen(false)} />
      <GroupReservationModal
        open={groupReservationOpen}
        activeDraftId={activeGroupReservationDraftId}
        initialDraft={initialGroupReservationDraft}
        initialStep={initialGroupReservationStep}
        onActiveDraftIdChange={setActiveGroupReservationDraftId}
        onClose={() => setGroupReservationOpen(false)}
      />
      <ShiftStartModal open={shiftStartOpen} onClose={() => setShiftStartOpen(false)} />
    </div>
  )
}
