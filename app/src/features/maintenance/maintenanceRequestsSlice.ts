// Maintenance Requests Slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { maintenanceRequestsApi } from '../../shared/apis/maintenanceRequestsApi';
import { appAlert } from '../../shared/ui/AppAlert'
import type {
  MaintenanceRequestListItem,
  MaintenanceRequestDetails,
  CreateMaintenanceRequest,
  AssignEmployeeRequest,
  ReassignEmployeeRequest,
  PagedMaintenanceRequestsResponse
} from '../../models/MaintenanceRequest';

export interface MaintenanceRequestsState {
  list: MaintenanceRequestListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  loadingList: boolean;
  errorList?: string;
  selected?: MaintenanceRequestDetails;
  loadingDetail: boolean;
  errorDetail?: string;
  creating: boolean;
  createError?: string;
  assigning: boolean;
  assignError?: string;
  uploadingImages: boolean;
  uploadError?: string;
  actionStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
}

const initialState: MaintenanceRequestsState = {
  list: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  loadingList: false,
  loadingDetail: false,
  creating: false,
  assigning: false,
  uploadingImages: false,
  actionStatus: 'idle'
};

// Thunks
export const fetchMaintenanceRequests = createAsyncThunk<
  PagedMaintenanceRequestsResponse,
  {
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    isDescending?: boolean;
  }
>('api/maintenanceRequests/', async (params, { rejectWithValue }) => {
  try {
    const data = await maintenanceRequestsApi.fetchRequests(params);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchMaintenanceRequestById = createAsyncThunk<
  MaintenanceRequestDetails,
  number | string
>('maintenanceRequests/fetchDetail', async (id, { rejectWithValue }) => {
  try {
    const data = await maintenanceRequestsApi.fetchRequestById(id);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const createMaintenanceRequest = createAsyncThunk<
  MaintenanceRequestDetails,
  { payload: CreateMaintenanceRequest; images?: File[] }
>('maintenanceRequests/create', async ({ payload, images }, { rejectWithValue }) => {
  try {
    const created = await maintenanceRequestsApi.createRequest(payload);
    const requestId = (created as any)?.id ?? (created as any)?.Id ?? (created as any)?.data?.id;

    if (images && images.length > 0 && requestId) {
      try {
        await maintenanceRequestsApi.uploadImages(requestId, images);
        appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Images uploaded successfully' })
      } catch (uploadErr: any) {
        appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 5000, icon: 'error', title: 'Image upload failed', text: uploadErr?.message || 'Failed to upload images' })
      }
    }
    return created;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const assignEmployee = createAsyncThunk<
  void,
  { id: number | string; employeeId: string }
>('maintenanceRequests/assign', async ({ id, employeeId }, { rejectWithValue }) => {
  try {
    await maintenanceRequestsApi.assignEmployee(id, { employeeId } as AssignEmployeeRequest);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const reassignEmployee = createAsyncThunk<
  void,
  { id: number | string; newEmployeeId: string }
>('maintenanceRequests/reassign', async ({ id, newEmployeeId }, { rejectWithValue }) => {
  try {
    await maintenanceRequestsApi.reassignEmployee(id, { newEmployeeId } as ReassignEmployeeRequest);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const startMaintenanceRequest = createAsyncThunk<
  void,
  number | string
>('maintenanceRequests/start', async (id, { rejectWithValue }) => {
  try {
    await maintenanceRequestsApi.startRequest(id);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const completeMaintenanceRequest = createAsyncThunk<
  void,
  number | string
>('maintenanceRequests/complete', async (id, { rejectWithValue }) => {
  try {
    await maintenanceRequestsApi.completeRequest(id);
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

const maintenanceRequestsSlice = createSlice({
  name: 'maintenanceRequests',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = undefined;
    }
  },
  extraReducers: (builder) => {
    // List
    builder
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loadingList = true;
        state.errorList = undefined;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action: PayloadAction<PagedMaintenanceRequestsResponse>) => {
        state.loadingList = false;
        state.list = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload as string;
      })
      // Detail
      .addCase(fetchMaintenanceRequestById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = undefined;
      })
      .addCase(fetchMaintenanceRequestById.fulfilled, (state, action: PayloadAction<MaintenanceRequestDetails>) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchMaintenanceRequestById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string;
      })
      // Create
      .addCase(createMaintenanceRequest.pending, (state) => {
        state.creating = true;
        state.createError = undefined;
      })
      .addCase(createMaintenanceRequest.fulfilled, (state, action: PayloadAction<MaintenanceRequestDetails>) => {
        state.creating = false;
        // prepend to list for immediate UI feedback
        state.list.unshift({
          id: action.payload.id,
          location: action.payload.location,
          source: action.payload.source,
          roomNo: action.payload.roomNo,
          itemName: action.payload.itemName,
          notes: action.payload.notes,
          priorityLevel: action.payload.priorityLevel,
          status: action.payload.status,
          createdAt: action.payload.createdAt,
          requestNo: action.payload.requestNo
        } as any);
        state.totalCount += 1;
      })
      .addCase(createMaintenanceRequest.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      // Assign
      .addCase(assignEmployee.pending, (state) => {
        state.assigning = true;
        state.assignError = undefined;
      })
      .addCase(assignEmployee.fulfilled, (state) => {
        state.assigning = false;
      })
      .addCase(assignEmployee.rejected, (state, action) => {
        state.assigning = false;
        state.assignError = action.payload as string;
      })
      // Reassign
      .addCase(reassignEmployee.pending, (state) => {
        state.assigning = true;
        state.assignError = undefined;
      })
      .addCase(reassignEmployee.fulfilled, (state) => {
        state.assigning = false;
      })
      .addCase(reassignEmployee.rejected, (state, action) => {
        state.assigning = false;
        state.assignError = action.payload as string;
      })
      // Start
      .addCase(startMaintenanceRequest.pending, (state) => {
        state.actionStatus = 'pending';
      })
      .addCase(startMaintenanceRequest.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(startMaintenanceRequest.rejected, (state, action) => {
        state.actionStatus = 'failed';
      })
      // Complete
      .addCase(completeMaintenanceRequest.pending, (state) => {
        state.actionStatus = 'pending';
      })
      .addCase(completeMaintenanceRequest.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(completeMaintenanceRequest.rejected, (state, action) => {
        state.actionStatus = 'failed';
      });
  }
});

export const { clearSelected } = maintenanceRequestsSlice.actions;
export const maintenanceRequestsReducer = maintenanceRequestsSlice.reducer;
