import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { payrollApi } from '../../../shared/HRMshared/api/payrollApi';
import type {
  HRPayrollReadDto,
  HRPayrollSnapshotReadDto,
  PayrollGenerateDto,
  PayrollQueryParams,
  PayrollSnapshotQueryParams,
  PaginatedPayroll,
  PaginatedPayrollSnapshots,
} from '../../../models/HRMmodels/Payroll';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface HrPayrollState {
  payrolls: HRPayrollReadDto[];
  totalPayrollsCount: number;
  payrollsPageNumber: number;
  payrollsPageSize: number;

  snapshots: HRPayrollSnapshotReadDto[];
  totalSnapshotsCount: number;
  snapshotsPageNumber: number;
  snapshotsPageSize: number;

  selectedSnapshot: HRPayrollSnapshotReadDto | null;
  
  status: AsyncStatus;
  error: string | undefined;
}

const initialState: HrPayrollState = {
  payrolls: [],
  totalPayrollsCount: 0,
  payrollsPageNumber: 1,
  payrollsPageSize: 10,

  snapshots: [],
  totalSnapshotsCount: 0,
  snapshotsPageNumber: 1,
  snapshotsPageSize: 10,

  selectedSnapshot: null,
  
  status: 'idle',
  error: undefined,
};

// --- Thunks ---

export const generateHrPayroll = createAsyncThunk<void, PayrollGenerateDto>(
  'hrPayroll/generate',
  async (payload, { rejectWithValue, signal }) => {
    try {
      await payrollApi.generatePayroll(payload, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to generate payroll';
      return rejectWithValue(message);
    }
  }
);

export const reviewHrPayroll = createAsyncThunk<string, string>(
  'hrPayroll/review',
  async (id, { rejectWithValue, signal }) => {
    try {
      await payrollApi.reviewPayroll(id, signal);
      return id;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to review payroll';
      return rejectWithValue(message);
    }
  }
);

export const fetchHrPayrolls = createAsyncThunk<PaginatedPayroll, PayrollQueryParams | undefined>(
  'hrPayroll/fetchPayrolls',
  async (params, { rejectWithValue, signal }) => {
    try {
      return await payrollApi.getPayrolls(params, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payrolls';
      return rejectWithValue(message);
    }
  }
);

export const fetchHrPayrollSnapshots = createAsyncThunk<PaginatedPayrollSnapshots, PayrollSnapshotQueryParams | undefined>(
  'hrPayroll/fetchSnapshots',
  async (params, { rejectWithValue, signal }) => {
    try {
      return await payrollApi.getPayrollSnapshots(params, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll snapshots';
      return rejectWithValue(message);
    }
  }
);

export const fetchHrPayrollSnapshotById = createAsyncThunk<HRPayrollSnapshotReadDto, string>(
  'hrPayroll/fetchSnapshotById',
  async (id, { rejectWithValue, signal }) => {
    try {
      return await payrollApi.getPayrollSnapshotById(id, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll snapshot details';
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const hrPayrollSlice = createSlice({
  name: 'hrPayroll',
  initialState,
  reducers: {
    clearHrPayrollError: (state) => {
      state.error = undefined;
    },
    clearSelectedPayrollSnapshot: (state) => {
      state.selectedSnapshot = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // generate
      .addCase(generateHrPayroll.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(generateHrPayroll.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(generateHrPayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // review
      .addCase(reviewHrPayroll.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(reviewHrPayroll.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        const index = state.payrolls.findIndex((p) => p.id === action.payload);
        if (index !== -1) {
          state.payrolls[index].status = 'Reviewed';
        }
      })
      .addCase(reviewHrPayroll.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchPayrolls
      .addCase(fetchHrPayrolls.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrPayrolls.fulfilled, (state, action: PayloadAction<PaginatedPayroll>) => {
        state.status = 'succeeded';
        state.payrolls = action.payload.items;
        state.totalPayrollsCount = action.payload.totalCount;
        state.payrollsPageNumber = action.payload.pageNumber;
        state.payrollsPageSize = action.payload.pageSize;
      })
      .addCase(fetchHrPayrolls.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchSnapshots
      .addCase(fetchHrPayrollSnapshots.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrPayrollSnapshots.fulfilled, (state, action: PayloadAction<PaginatedPayrollSnapshots>) => {
        state.status = 'succeeded';
        state.snapshots = action.payload.items;
        state.totalSnapshotsCount = action.payload.totalCount;
        state.snapshotsPageNumber = action.payload.pageNumber;
        state.snapshotsPageSize = action.payload.pageSize;
      })
      .addCase(fetchHrPayrollSnapshots.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchSnapshotById
      .addCase(fetchHrPayrollSnapshotById.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrPayrollSnapshotById.fulfilled, (state, action: PayloadAction<HRPayrollSnapshotReadDto>) => {
        state.status = 'succeeded';
        state.selectedSnapshot = action.payload;
      })
      .addCase(fetchHrPayrollSnapshotById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearHrPayrollError, clearSelectedPayrollSnapshot } = hrPayrollSlice.actions;

export const hrPayrollReducer = hrPayrollSlice.reducer;
