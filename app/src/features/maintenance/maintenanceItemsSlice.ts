import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/maintenanceItemsApi'
import { MaintenanceItem, CreateMaintenanceItemRequest, UpdateMaintenanceItemRequest } from '../../models/MaintenanceItem'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type MaintenanceItemsState = {
  items: MaintenanceItem[]
  lowStockItems: MaintenanceItem[]
  selectedItem?: MaintenanceItem
  fetchStatus: AsyncStatus
  lowStockFetchStatus: AsyncStatus
  createStatus: AsyncStatus
  updateStatus: AsyncStatus
  deleteStatus: AsyncStatus
  error?: string
}

const initialState: MaintenanceItemsState = {
  items: [],
  lowStockItems: [],
  fetchStatus: 'idle',
  lowStockFetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
}
export enum MaintenanceItemStatus {
  InStock = 'InStock',
  LowStock = 'LowStock',
  OutStock = 'OutStock',
}
export const fetchMaintenanceItems = createAsyncThunk('maintenanceItems/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getMaintenanceItems(undefined, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch items'
    return thunkApi.rejectWithValue(message)
  }
})
export const fetchLowStockItems = createAsyncThunk(
  'maintenanceItems/fetchLow',
  async (_, thunkApi) => {
    try {
      return await api.getMaintenanceItems(
        {
          status: MaintenanceItemStatus.OutStock,
        },
        thunkApi.signal
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Failed to fetch low stock items';
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const fetchMaintenanceItemById = createAsyncThunk('maintenanceItems/fetchById', async (id: number, thunkApi) => {
  try {
    return await api.getMaintenanceItemById(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch item'
    return thunkApi.rejectWithValue(message)
  }
})

export const addMaintenanceItem = createAsyncThunk('maintenanceItems/add', async (payload: CreateMaintenanceItemRequest, thunkApi) => {
  try {
    const created = await api.createMaintenanceItem(payload, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceItems())
    return created
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to add item'
    return thunkApi.rejectWithValue(message)
  }
})

export const editMaintenanceItem = createAsyncThunk('maintenanceItems/edit', async ({ id, payload }: { id: number; payload: UpdateMaintenanceItemRequest }, thunkApi) => {
  try {
    const updated = await api.updateMaintenanceItem(id, payload, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceItems())
    return updated
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to edit item'
    return thunkApi.rejectWithValue(message)
  }
})

export const removeMaintenanceItem = createAsyncThunk('maintenanceItems/remove', async (id: number, thunkApi) => {
  try {
    await api.deleteMaintenanceItem(id, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceItems())
    return id
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to remove item'
    return thunkApi.rejectWithValue(message)
  }
})

const maintenanceItemsSlice = createSlice({
  name: 'maintenanceItems',
  initialState,
  reducers: {
    clearItemError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchMaintenanceItems.pending, (state) => { state.fetchStatus = 'loading'; state.error = undefined })
      .addCase(fetchMaintenanceItems.fulfilled, (state, action) => { 
        state.fetchStatus = 'succeeded'
        state.items = Array.isArray(action.payload?.items) ? action.payload.items : []
      })
      .addCase(fetchMaintenanceItems.rejected, (state, action) => { state.fetchStatus = 'failed'; state.error = action.payload as string })
      // fetch low stock
      .addCase(fetchLowStockItems.pending, (state) => { state.lowStockFetchStatus = 'loading'; state.error = undefined })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => { 
        state.lowStockFetchStatus = 'succeeded'
        state.lowStockItems = Array.isArray(action.payload?.items) ? action.payload.items : []
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => { state.lowStockFetchStatus = 'failed'; state.error = action.payload as string })
      // fetch by id
      .addCase(fetchMaintenanceItemById.fulfilled, (state, action) => { state.selectedItem = action.payload })
      // create
      .addCase(addMaintenanceItem.pending, (state) => { state.createStatus = 'loading'; state.error = undefined })
      .addCase(addMaintenanceItem.fulfilled, (state) => { state.createStatus = 'succeeded' })
      .addCase(addMaintenanceItem.rejected, (state, action) => { state.createStatus = 'failed'; state.error = action.payload as string })
      // update
      .addCase(editMaintenanceItem.pending, (state) => { state.updateStatus = 'loading'; state.error = undefined })
      .addCase(editMaintenanceItem.fulfilled, (state) => { state.updateStatus = 'succeeded' })
      .addCase(editMaintenanceItem.rejected, (state, action) => { state.updateStatus = 'failed'; state.error = action.payload as string })
      // delete
      .addCase(removeMaintenanceItem.pending, (state) => { state.deleteStatus = 'loading'; state.error = undefined })
      .addCase(removeMaintenanceItem.fulfilled, (state) => { state.deleteStatus = 'succeeded' })
      .addCase(removeMaintenanceItem.rejected, (state, action) => { state.deleteStatus = 'failed'; state.error = action.payload as string })
  },
})

export const { clearItemError } = maintenanceItemsSlice.actions
export const maintenanceItemsReducer = maintenanceItemsSlice.reducer
