import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getShiftAssignments as getShiftAssignmentsApi,
  assignShift as assignShiftApi,
  updateShiftAssignment as updateShiftAssignmentApi,
  deleteShiftAssignment as deleteShiftAssignmentApi
} from '../../../shared/HRMshared/api/shiftAssignmentsApi';
import {
  ShiftAssignmentReadDto,
  ShiftAssignmentQueryParams,
  ShiftAssignmentCreateDto,
  ShiftAssignmentUpdateDto
} from '../../../models/HRMmodels/ShiftAssignments';

interface ShiftAssignmentsState {
  items: ShiftAssignmentReadDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: ShiftAssignmentsState = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  loading: false,
  error: null,
};

export const fetchShiftAssignments = createAsyncThunk(
  'shiftAssignments/fetchShiftAssignments',
  async (params: ShiftAssignmentQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await getShiftAssignmentsApi(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch shift assignments');
    }
  }
);

export const assignShift = createAsyncThunk(
  'shiftAssignments/assignShift',
  async (payload: ShiftAssignmentCreateDto, { rejectWithValue }) => {
    try {
      await assignShiftApi(payload);
      // We don't get the created entity back directly according to DTO, so we return void/success.
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign shift');
    }
  }
);

export const updateShiftAssignment = createAsyncThunk(
  'shiftAssignments/updateShiftAssignment',
  async ({ id, payload }: { id: string; payload: ShiftAssignmentUpdateDto }, { rejectWithValue }) => {
    try {
      return await updateShiftAssignmentApi(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update shift assignment');
    }
  }
);

export const deleteShiftAssignment = createAsyncThunk(
  'shiftAssignments/deleteShiftAssignment',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteShiftAssignmentApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete shift assignment');
    }
  }
);

const shiftAssignmentsSlice = createSlice({
  name: 'shiftAssignments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchShiftAssignments
    builder.addCase(fetchShiftAssignments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchShiftAssignments.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.totalCount = action.payload.totalCount;
      state.pageNumber = action.payload.pageNumber;
      state.pageSize = action.payload.pageSize;
    });
    builder.addCase(fetchShiftAssignments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // assignShift
    builder.addCase(assignShift.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(assignShift.fulfilled, (state) => {
      state.loading = false;
      // Ideally we would fetch again after this, but we can't easily dispatch from inside the reducer.
    });
    builder.addCase(assignShift.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateShiftAssignment
    builder.addCase(updateShiftAssignment.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    // deleteShiftAssignment
    builder.addCase(deleteShiftAssignment.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalCount -= 1;
    });
  },
});

export default shiftAssignmentsSlice.reducer;
