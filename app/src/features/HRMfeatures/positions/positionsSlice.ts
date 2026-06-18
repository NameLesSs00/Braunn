import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { positionsApi } from '../../../shared/HRMshared/api/positionsApi';
import type { PositionReadDto, PositionCreateDto, PositionUpdateDto } from '../../../models/HRMmodels/Position';

interface PositionsState {
  positions: PositionReadDto[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PositionsState = {
  positions: [],
  status: 'idle',
  error: null,
};

// --- Thunks ---

export const fetchPositions = createAsyncThunk(
  'positions/fetchPositions',
  async (
    params?: {
      PageNumber?: number;
      PageSize?: number;
      SearchTerm?: string;
      SortBy?: string;
      SortDirection?: string;
      IsActive?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await positionsApi.fetchPositions(params);
      return data.items; // data also has totalCount, pageNumber, pageSize if we need them later
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch positions';
      return rejectWithValue(message);
    }
  }
);

export const createPosition = createAsyncThunk(
  'positions/createPosition',
  async (payload: PositionCreateDto, { rejectWithValue }) => {
    try {
      const data = await positionsApi.createPosition(payload);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create position';
      return rejectWithValue(message);
    }
  }
);

export const updatePosition = createAsyncThunk(
  'positions/updatePosition',
  async ({ id, payload }: { id: string; payload: PositionUpdateDto }, { rejectWithValue }) => {
    try {
      const data = await positionsApi.updatePosition(id, payload);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update position';
      return rejectWithValue(message);
    }
  }
);

export const deletePosition = createAsyncThunk(
  'positions/deletePosition',
  async (id: string, { rejectWithValue }) => {
    try {
      await positionsApi.deletePosition(id);
      return id;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete position';
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    clearPositionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPositions
      .addCase(fetchPositions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createPosition
      .addCase(createPosition.fulfilled, (state, action) => {
        state.positions.unshift(action.payload);
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // updatePosition
      .addCase(updatePosition.fulfilled, (state, action) => {
        const index = state.positions.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.positions[index] = action.payload;
        }
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // deletePosition
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.positions = state.positions.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearPositionsError } = positionsSlice.actions;

export const positionsReducer = positionsSlice.reducer;
