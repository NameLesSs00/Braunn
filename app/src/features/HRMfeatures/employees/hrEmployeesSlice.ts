import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hrEmployeesApi } from '../../../shared/HRMshared/api/hrEmployeesApi';
import type { 
  HREmployeeReadDto, 
  HREmployeeCreateDto, 
  HREmployeeUpdateDto,
  SalaryUpdateDto,
  HREmployeesQueryParams,
  PaginatedHREmployees
} from '../../../models/HRMmodels/HREmployee';

export interface SalaryHistoryEntry {
  id: string;
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  reason: string;
  effectiveDate: string;
  createdAt: string;
}

interface HrEmployeesState {
  employees: HREmployeeReadDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  selectedEmployee: HREmployeeReadDto | null;
  salaryHistory: SalaryHistoryEntry[];
  salaryHistoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | undefined;
}

const initialState: HrEmployeesState = {
  employees: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  selectedEmployee: null,
  salaryHistory: [],
  salaryHistoryStatus: 'idle',
  status: 'idle',
  error: undefined,
};

// --- Thunks ---

export const fetchHrEmployees = createAsyncThunk<PaginatedHREmployees, HREmployeesQueryParams | undefined>(
  'hrEmployees/fetchAll',
  async (params, { rejectWithValue, signal }) => {
    try {
      const res = await hrEmployeesApi.fetchEmployees(params, signal);
      return res as PaginatedHREmployees;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch employees';
      return rejectWithValue(message);
    }
  }
);

export const fetchHrEmployeeById = createAsyncThunk<HREmployeeReadDto, string>(
  'hrEmployees/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const res = await hrEmployeesApi.fetchEmployeeById(id, signal);
      return res as HREmployeeReadDto;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch employee';
      return rejectWithValue(message);
    }
  }
);

export const createHrEmployee = createAsyncThunk<HREmployeeReadDto, HREmployeeCreateDto>(
  'hrEmployees/create',
  async (payload, { rejectWithValue, signal }) => {
    try {
      const res = await hrEmployeesApi.createEmployee(payload, signal);
      return res as HREmployeeReadDto;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create employee';
      return rejectWithValue(message);
    }
  }
);

export const updateHrEmployee = createAsyncThunk<HREmployeeReadDto, { id: string; payload: HREmployeeUpdateDto }>(
  'hrEmployees/update',
  async ({ id, payload }, { rejectWithValue, signal }) => {
    try {
      const res = await hrEmployeesApi.updateEmployee(id, payload, signal);
      return res as HREmployeeReadDto;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update employee';
      return rejectWithValue(message);
    }
  }
);

export const deleteHrEmployee = createAsyncThunk<string, string>(
  'hrEmployees/delete',
  async (id, { rejectWithValue, signal }) => {
    try {
      await hrEmployeesApi.deleteEmployee(id, signal);
      return id;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete employee';
      return rejectWithValue(message);
    }
  }
);

export const updateHrEmployeeSalary = createAsyncThunk<string, { id: string; payload: SalaryUpdateDto }>(
  'hrEmployees/updateSalary',
  async ({ id, payload }, { rejectWithValue, signal }) => {
    try {
      await hrEmployeesApi.updateEmployeeSalary(id, payload, signal);
      return id; // Or return full payload if needed
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update employee salary';
      return rejectWithValue(message);
    }
  }
);

export const uploadHrEmployeeImage = createAsyncThunk<string, { employeeId: string; file: File }>(
  'hrEmployees/uploadImage',
  async ({ employeeId, file }, { rejectWithValue, signal }) => {
    try {
      await hrEmployeesApi.uploadEmployeeImage(employeeId, file, signal);
      return employeeId;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to upload image';
      return rejectWithValue(message);
    }
  }
);

export const fetchHrEmployeeSalaryHistory = createAsyncThunk<SalaryHistoryEntry[], string>(
  'hrEmployees/fetchSalaryHistory',
  async (id, { rejectWithValue, signal }) => {
    try {
      const res = await hrEmployeesApi.fetchEmployeeSalaryHistory(id, { SortDirection: 'desc' }, signal);
      // API may return a paginated result or a flat array
      if (Array.isArray(res)) return res as SalaryHistoryEntry[];
      const paginated = res as { items?: SalaryHistoryEntry[] };
      return paginated.items ?? (res as SalaryHistoryEntry[]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch salary history';
      return rejectWithValue(message);
    }
  }
);

// --- Slice ---

const hrEmployeesSlice = createSlice({
  name: 'hrEmployees',
  initialState,
  reducers: {
    clearHrEmployeesError: (state) => {
      state.error = undefined;
    },
    clearSelectedHrEmployee: (state) => {
      state.selectedEmployee = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchHrEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrEmployees.fulfilled, (state, action: PayloadAction<PaginatedHREmployees>) => {
        state.status = 'succeeded';
        state.employees = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchHrEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // fetchEmployeeById
      .addCase(fetchHrEmployeeById.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchHrEmployeeById.fulfilled, (state, action: PayloadAction<HREmployeeReadDto>) => {
        state.status = 'succeeded';
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchHrEmployeeById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // createEmployee
      .addCase(createHrEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(createHrEmployee.fulfilled, (state, action: PayloadAction<HREmployeeReadDto>) => {
        state.status = 'succeeded';
        state.employees.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createHrEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // updateEmployee
      .addCase(updateHrEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(updateHrEmployee.fulfilled, (state, action: PayloadAction<HREmployeeReadDto>) => {
        state.status = 'succeeded';
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.selectedEmployee?.id === action.payload.id) {
          state.selectedEmployee = action.payload;
        }
      })
      .addCase(updateHrEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // deleteEmployee
      .addCase(deleteHrEmployee.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(deleteHrEmployee.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.employees = state.employees.filter((e) => e.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedEmployee?.id === action.payload) {
          state.selectedEmployee = null;
        }
      })
      .addCase(deleteHrEmployee.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // updateEmployeeSalary (just show loading/failed, don't necessarily update local list unless we want to re-fetch)
      .addCase(updateHrEmployeeSalary.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // uploadEmployeeImage
      .addCase(uploadHrEmployeeImage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // fetchSalaryHistory
      .addCase(fetchHrEmployeeSalaryHistory.pending, (state) => {
        state.salaryHistoryStatus = 'loading';
      })
      .addCase(fetchHrEmployeeSalaryHistory.fulfilled, (state, action) => {
        state.salaryHistoryStatus = 'succeeded';
        state.salaryHistory = action.payload;
      })
      .addCase(fetchHrEmployeeSalaryHistory.rejected, (state, action) => {
        state.salaryHistoryStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearHrEmployeesError, clearSelectedHrEmployee } = hrEmployeesSlice.actions;

export const hrEmployeesReducer = hrEmployeesSlice.reducer;
