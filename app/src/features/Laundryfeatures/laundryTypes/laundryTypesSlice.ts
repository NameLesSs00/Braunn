import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  LaundryTypeReadDto,
  LaundryTypeCreateDto,
  LaundryTypeUpdateDto,
} from '../../../models/Laundrymodels/LaundryType';
import * as api from '../../../shared/Laundryshared/api/laundryTypesApi';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface LaundryTypesState {
  types: LaundryTypeReadDto[];
  status: AsyncStatus;
  error?: string;
}

const initialState: LaundryTypesState = {
  types: [],
  status: 'idle',
  error: undefined,
};

export const fetchLaundryTypes = createAsyncThunk(
  'laundryTypes/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getLaundryTypes(thunkApi.signal);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch types';
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const createLaundryType = createAsyncThunk(
  'laundryTypes/create',
  async (payload: LaundryTypeCreateDto, thunkApi) => {
    try {
      return await api.createLaundryType(payload, thunkApi.signal);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create type';
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const updateLaundryType = createAsyncThunk(
  'laundryTypes/update',
  async ({ id, payload }: { id: number; payload: LaundryTypeUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryType(id, payload, thunkApi.signal);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update type';
      return thunkApi.rejectWithValue(message);
    }
  }
);

export const deleteLaundryType = createAsyncThunk(
  'laundryTypes/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryType(id, thunkApi.signal);
      return id;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete type';
      return thunkApi.rejectWithValue(message);
    }
  }
);

const laundryTypesSlice = createSlice({
  name: 'laundryTypes',
  initialState,
  reducers: {
    clearLaundryTypesError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLaundryTypes.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchLaundryTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.types = action.payload;
      })
      .addCase(fetchLaundryTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(createLaundryType.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(createLaundryType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.types.push(action.payload);
      })
      .addCase(createLaundryType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(updateLaundryType.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(updateLaundryType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.types.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.types[index] = action.payload;
        }
      })
      .addCase(updateLaundryType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      })
      .addCase(deleteLaundryType.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(deleteLaundryType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.types = state.types.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteLaundryType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string | undefined) ?? action.error.message;
      });
  },
});

export const { clearLaundryTypesError } = laundryTypesSlice.actions;
export const laundryTypesReducer = laundryTypesSlice.reducer;
