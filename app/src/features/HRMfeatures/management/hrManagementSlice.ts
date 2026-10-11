import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrManagementApi } from '../../../shared/HRMshared/api/hrManagementApi';
import type { HRMOverviewData, ShiftManagementOverviewData } from '../../../models/HRMmodels/HRManagementOverview';

interface HrManagementState {
  hrmOverview: HRMOverviewData | null;
  shiftOverview: ShiftManagementOverviewData | null;
  overviewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  shiftOverviewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: HrManagementState = {
  hrmOverview: null,
  shiftOverview: null,
  overviewStatus: 'idle',
  shiftOverviewStatus: 'idle',
  error: null,
};

export const fetchHRMOverview = createAsyncThunk(
  'hrManagement/fetchHRMOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await hrManagementApi.fetchOverviewHRM();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch HRM overview');
    }
  }
);

export const fetchShiftManagementOverview = createAsyncThunk(
  'hrManagement/fetchShiftManagementOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await hrManagementApi.fetchShiftManagementOverview();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Shift Management overview');
    }
  }
);

const hrManagementSlice = createSlice({
  name: 'hrManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHRMOverview.pending, (state) => {
        state.overviewStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchHRMOverview.fulfilled, (state, action) => {
        state.overviewStatus = 'succeeded';
        state.hrmOverview = action.payload;
      })
      .addCase(fetchHRMOverview.rejected, (state, action) => {
        state.overviewStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchShiftManagementOverview.pending, (state) => {
        state.shiftOverviewStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchShiftManagementOverview.fulfilled, (state, action) => {
        state.shiftOverviewStatus = 'succeeded';
        state.shiftOverview = action.payload;
      })
      .addCase(fetchShiftManagementOverview.rejected, (state, action) => {
        state.shiftOverviewStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default hrManagementSlice.reducer;
