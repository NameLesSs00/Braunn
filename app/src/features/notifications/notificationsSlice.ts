import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReservationDraft } from '../reservations/draftSlice'
import type { SavedReservationDraft } from '../reservations/reservationDraftStorage'
import type { SavedGroupReservationDraft } from '../reservations/groupReservationDraftStorage'

export type Notification = {
  id: string
  type: 'reservation_draft' | 'group_reservation_draft' | 'shift_start'
  draftId?: string
  firstName?: string
  surName?: string
  groupName?: string
  contactName?: string
  draft?: ReservationDraft
  timestamp: number
  isOptional?: boolean
}

interface NotificationsState {
  items: Notification[]
}

const initialState: NotificationsState = {
  items: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      state.items.unshift({
        ...action.payload,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.items = []
    },
    upsertReservationDraftNotification: (state, action: PayloadAction<SavedReservationDraft>) => {
      const savedDraft = action.payload
      const existingIndex = state.items.findIndex((item) => item.type === 'reservation_draft' && item.draftId === savedDraft.id)
      const notification: Notification = {
        id: `reservation-draft-${savedDraft.id}`,
        type: 'reservation_draft',
        draftId: savedDraft.id,
        firstName: savedDraft.draft.firstName,
        surName: savedDraft.draft.surName,
        timestamp: savedDraft.updatedAt,
      }

      if (existingIndex >= 0) {
        state.items[existingIndex] = notification
        return
      }

      state.items.unshift(notification)
    },
    hydrateReservationDraftNotifications: (state, action: PayloadAction<SavedReservationDraft[]>) => {
      const savedDrafts = action.payload
      const otherNotifications = state.items.filter((item) => item.type !== 'reservation_draft')
      const reservationNotifications = savedDrafts.map<Notification>((savedDraft) => ({
        id: `reservation-draft-${savedDraft.id}`,
        type: 'reservation_draft',
        draftId: savedDraft.id,
        firstName: savedDraft.draft.firstName,
        surName: savedDraft.draft.surName,
        timestamp: savedDraft.updatedAt,
      }))

      state.items = [...reservationNotifications, ...otherNotifications]
    },
    removeReservationDraftNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.type !== 'reservation_draft' || item.draftId !== action.payload)
    },
    upsertGroupReservationDraftNotification: (state, action: PayloadAction<SavedGroupReservationDraft>) => {
      const savedDraft = action.payload
      const existingIndex = state.items.findIndex((item) => item.type === 'group_reservation_draft' && item.draftId === savedDraft.id)
      const notification: Notification = {
        id: `group-reservation-draft-${savedDraft.id}`,
        type: 'group_reservation_draft',
        draftId: savedDraft.id,
        groupName: savedDraft.draft.groupInfo.groupName,
        contactName: savedDraft.draft.groupInfo.contactPerson,
        timestamp: savedDraft.updatedAt,
      }

      if (existingIndex >= 0) {
        state.items[existingIndex] = notification
        return
      }

      state.items.unshift(notification)
    },
    hydrateGroupReservationDraftNotifications: (state, action: PayloadAction<SavedGroupReservationDraft[]>) => {
      const savedDrafts = action.payload
      const otherNotifications = state.items.filter((item) => item.type !== 'group_reservation_draft')
      const reservationNotifications = savedDrafts.map<Notification>((savedDraft) => ({
        id: `group-reservation-draft-${savedDraft.id}`,
        type: 'group_reservation_draft',
        draftId: savedDraft.id,
        groupName: savedDraft.draft.groupInfo.groupName,
        contactName: savedDraft.draft.groupInfo.contactPerson,
        timestamp: savedDraft.updatedAt,
      }))

      state.items = [...reservationNotifications, ...otherNotifications]
    },
    removeGroupReservationDraftNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.type !== 'group_reservation_draft' || item.draftId !== action.payload)
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  upsertReservationDraftNotification,
  hydrateReservationDraftNotifications,
  removeReservationDraftNotification,
  upsertGroupReservationDraftNotification,
  hydrateGroupReservationDraftNotifications,
  removeGroupReservationDraftNotification,
} = notificationsSlice.actions
export const notificationsReducer = notificationsSlice.reducer
