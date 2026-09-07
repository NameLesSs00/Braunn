import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { payrollApi } from '../../../shared/HRMshared/api/payrollApi';
import { payrollProcessingApi } from '../../../shared/HRMshared/api/payrollProcessingApi';
import type {
  HRPayrollReadDto,
  HRPayrollSnapshotReadDto,
  PaginatedPayroll,
  PaginatedPayrollProcessing,
  PaginatedPayrollSnapshots,
  PayrollGenerateDto,
  PayrollProcessRequestDto,
  PayrollProcessResponseDto,
  PayrollProcessingBatchReadDto,
  PayrollProcessingQueryParams,
  PayrollProcessingReadDto,
  PayrollQueryParams,
  PayrollSnapshotQueryParams,
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
  processingRecords: PayrollProcessingReadDto[];
  totalProcessingCount: number;
  processingPageNumber: number;
  processingPageSize: number;
  selectedProcessingRecord: PayrollProcessingReadDto | null;
  selectedProcessingBatch: PayrollProcessingBatchReadDto | null;
  lastProcessResult: PayrollProcessResponseDto | null;

  status: AsyncStatus;
  processStatus: AsyncStatus;
  historyStatus: AsyncStatus;
  processingDetailStatus: AsyncStatus;
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
  processingRecords: [],
  totalProcessingCount: 0,
  processingPageNumber: 1,
  processingPageSize: 10,
  selectedProcessingRecord: null,
  selectedProcessingBatch: null,
  lastProcessResult: null,

  status: 'idle',
  processStatus: 'idle',
  historyStatus: 'idle',
  processingDetailStatus: 'idle',
  error: undefined,
};

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

export const processHrPayrolls = createAsyncThunk<PayrollProcessResponseDto, PayrollProcessRequestDto>(
  'hrPayroll/process',
  async (payload, { rejectWithValue, signal }) => {
    try {
      return await payrollProcessingApi.processPayrolls(payload, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to process payrolls';
      return rejectWithValue(message);
    }
  }
);

export const fetchPayrollProcessingRecords = createAsyncThunk<PaginatedPayrollProcessing, PayrollProcessingQueryParams | undefined>(
  'hrPayroll/fetchProcessingRecords',
  async (params, { rejectWithValue, signal }) => {
    try {
      return await payrollProcessingApi.getProcessingRecords(params, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll processing records';
      return rejectWithValue(message);
    }
  }
);

export const fetchPayrollProcessingById = createAsyncThunk<PayrollProcessingReadDto, string>(
  'hrPayroll/fetchProcessingById',
  async (id, { rejectWithValue, signal }) => {
    try {
      return await payrollProcessingApi.getProcessingById(id, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll processing details';
      return rejectWithValue(message);
    }
  }
);

export const fetchPayrollProcessingByPayrollId = createAsyncThunk<PayrollProcessingReadDto, string>(
  'hrPayroll/fetchProcessingByPayrollId',
  async (payrollId, { rejectWithValue, signal }) => {
    try {
      return await payrollProcessingApi.getProcessingByPayrollId(payrollId, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll payment details';
      return rejectWithValue(message);
    }
  }
);

export const fetchPayrollProcessingBatch = createAsyncThunk<PayrollProcessingBatchReadDto, string>(
  'hrPayroll/fetchProcessingBatch',
  async (processingBatchId, { rejectWithValue, signal }) => {
    try {
      return await payrollProcessingApi.getProcessingBatch(processingBatchId, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch payroll batch details';
      return rejectWithValue(message);
    }
  }
);

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
    clearSelectedPayrollProcessing: (state) => {
      state.selectedProcessingRecord = null;
      state.selectedProcessingBatch = null;
      state.processingDetailStatus = 'idle';
    },
    clearLastPayrollProcessResult: (state) => {
      state.lastProcessResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      })

      .addCase(processHrPayrolls.pending, (state) => {
        state.processStatus = 'loading';
        state.error = undefined;
      })
      .addCase(processHrPayrolls.fulfilled, (state, action: PayloadAction<PayrollProcessResponseDto>) => {
        state.processStatus = 'succeeded';
        state.lastProcessResult = action.payload;
        const processedIds = new Set(action.payload.payrolls.map((p) => p.payrollId));
        state.payrolls = state.payrolls.map((payroll) =>
          processedIds.has(payroll.id) ? { ...payroll, status: 'Processed' } : payroll
        );
      })
      .addCase(processHrPayrolls.rejected, (state, action) => {
        state.processStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(fetchPayrollProcessingRecords.pending, (state) => {
        state.historyStatus = 'loading';
        state.error = undefined;
      })
      .addCase(fetchPayrollProcessingRecords.fulfilled, (state, action: PayloadAction<PaginatedPayrollProcessing>) => {
        state.historyStatus = 'succeeded';
        state.processingRecords = action.payload.items;
        state.totalProcessingCount = action.payload.totalCount;
        state.processingPageNumber = action.payload.pageNumber;
        state.processingPageSize = action.payload.pageSize;
      })
      .addCase(fetchPayrollProcessingRecords.rejected, (state, action) => {
        state.historyStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(fetchPayrollProcessingById.pending, (state) => {
        state.processingDetailStatus = 'loading';
        state.error = undefined;
      })
      .addCase(fetchPayrollProcessingById.fulfilled, (state, action: PayloadAction<PayrollProcessingReadDto>) => {
        state.processingDetailStatus = 'succeeded';
        state.selectedProcessingRecord = action.payload;
      })
      .addCase(fetchPayrollProcessingById.rejected, (state, action) => {
        state.processingDetailStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(fetchPayrollProcessingByPayrollId.pending, (state) => {
        state.processingDetailStatus = 'loading';
        state.error = undefined;
      })
      .addCase(fetchPayrollProcessingByPayrollId.fulfilled, (state, action: PayloadAction<PayrollProcessingReadDto>) => {
        state.processingDetailStatus = 'succeeded';
        state.selectedProcessingRecord = action.payload;
      })
      .addCase(fetchPayrollProcessingByPayrollId.rejected, (state, action) => {
        state.processingDetailStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPayrollProcessingBatch.fulfilled, (state, action: PayloadAction<PayrollProcessingBatchReadDto>) => {
        state.selectedProcessingBatch = action.payload;
      });
  },
});

export const {
  clearHrPayrollError,
  clearLastPayrollProcessResult,
  clearSelectedPayrollProcessing,
  clearSelectedPayrollSnapshot,
} = hrPayrollSlice.actions;

export const hrPayrollReducer = hrPayrollSlice.reducer;
