import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frontOfficeComplaintsApi } from '../../shared/apis/frontOfficeComplaintsApi';
import type { 
  FrontOfficeComplaintReadDto, 
  FrontOfficeComplaintCreateDto, 
  FrontOfficeComplaintUpdateStatusDto 
} from '../../models/FrontOfficeComplaint';

interface FrontOfficeComplaintsState {
  complaints: FrontOfficeComplaintReadDto[];
  selectedComplaint: FrontOfficeComplaintReadDto | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FrontOfficeComplaintsState = {
  complaints: [],
  selectedComplaint: null,
  status: 'idle',
  error: null,
};

export const fetchComplaints = createAsyncThunk(
  'frontOfficeComplaints/fetchComplaints',
  async (
    params: {
      DateFrom?: string;
      DateTo?: string;
      Status?: string;
      Priority?: string;
      Category?: string;
      GuestId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      return await frontOfficeComplaintsApi.fetchComplaints(params);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch complaints';
      return rejectWithValue(message);
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'frontOfficeComplaints/fetchComplaintById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await frontOfficeComplaintsApi.fetchComplaintById(id);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch complaint details';
      return rejectWithValue(message);
    }
  }
);

export const createComplaint = createAsyncThunk(
  'frontOfficeComplaints/createComplaint',
  async (payload: FrontOfficeComplaintCreateDto, { rejectWithValue }) => {
    try {
      return await frontOfficeComplaintsApi.createComplaint(payload);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create complaint';
      return rejectWithValue(message);
    }
  }
);

export const updateComplaintStatus = createAsyncThunk(
  'frontOfficeComplaints/updateComplaintStatus',
  async ({ id, payload }: { id: string; payload: FrontOfficeComplaintUpdateStatusDto }, { rejectWithValue }) => {
    try {
      return await frontOfficeComplaintsApi.updateComplaintStatus(id, payload);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update complaint status';
      return rejectWithValue(message);
    }
  }
);

const frontOfficeComplaintsSlice = createSlice({
  name: 'frontOfficeComplaints',
  initialState,
  reducers: {
    clearComplaintsError: (state) => {
      state.error = null;
    },
    clearSelectedComplaint: (state) => {
      state.selectedComplaint = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchComplaints
      .addCase(fetchComplaints.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchComplaintById
      .addCase(fetchComplaintById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createComplaint
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // updateComplaintStatus
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const index = state.complaints.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
        if (state.selectedComplaint?.id === action.payload.id) {
          state.selectedComplaint = action.payload;
        }
      })
      .addCase(updateComplaintStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearComplaintsError, clearSelectedComplaint } = frontOfficeComplaintsSlice.actions;

export const frontOfficeComplaintsReducer = frontOfficeComplaintsSlice.reducer;
