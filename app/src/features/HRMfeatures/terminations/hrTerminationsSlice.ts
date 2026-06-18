import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { terminationsApi } from '../../../shared/HRMshared/api/terminationsApi';
import type {
  TerminationCreateDto,
  TerminationReadDto,
  PaginatedTerminations,
  TerminationQueryParams,
} from '../../../models/HRMmodels/Termination';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface HrTerminationsState {
  terminations: TerminationReadDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  selectedTermination: TerminationReadDto | null;
  status: AsyncStatus;
  error: string | undefined;
}

const initialState: HrTerminationsState = {
  terminations: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  selectedTermination: null,
  status: 'idle',
  error: undefined,
};

// --- Thunks ---

export const fetchHrTerminations = createAsyncThunk<PaginatedTerminations, TerminationQueryParams | undefined>(
  'hrTerminations/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      return await terminationsApi.getTerminations(params, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch terminations';
      return rejectWithValue(message);
    }
  }
);

export const createHrTermination = createAsyncThunk<TerminationReadDto, TerminationCreateDto>(
  'hrTerminations/create',
  async (payload, { rejectWithValue, signal }) => {
    try {
      return await terminationsApi.createTermination(payload, signal);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create termination';
      return rejectWithValue(message);
    }
  }
);

export const deleteHrTermination = createAsyncThunk<string, string>(
  'hrTerminations/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      await terminationsApi.deleteTermination(id, signal);
      return id;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete termination';
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const hrTerminationsSlice = createSlice({
  name: 'hrTerminations',
  initialState,
  reducers: {
    clearHrTerminationsError: (state) => {
      state.error = undefined;
    },
    clearSelectedTermination: (state) => {
      state.selectedTermination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHrTerminations.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrTerminations.fulfilled, (state, action: PayloadAction<PaginatedTerminations>) => {
        state.status = 'succeeded';
        state.terminations = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchHrTerminations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // create
      .addCase(createHrTermination.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(createHrTermination.fulfilled, (state, action: PayloadAction<TerminationReadDto>) => {
        state.status = 'succeeded';
        state.terminations.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createHrTermination.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // delete
      .addCase(deleteHrTermination.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(deleteHrTermination.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.terminations = state.terminations.filter((t) => t.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedTermination?.id === action.payload) {
          state.selectedTermination = null;
        }
      })
      .addCase(deleteHrTermination.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearHrTerminationsError, clearSelectedTermination } = hrTerminationsSlice.actions;

export const hrTerminationsReducer = hrTerminationsSlice.reducer;
