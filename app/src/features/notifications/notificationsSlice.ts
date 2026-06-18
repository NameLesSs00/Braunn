import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReservationDraft } from '../reservations/draftSlice'

export type Notification = {
  id: string
  type: 'reservation_draft' | 'shift_start'
  firstName?: string
  surName?: string
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
  },
})

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions
export const notificationsReducer = notificationsSlice.reducer
