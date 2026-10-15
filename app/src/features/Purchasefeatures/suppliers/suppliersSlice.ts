import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { suppliersApi } from '../../../shared/Purchaseshared/api/suppliersApi';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  UpdateSupplierDepartmentsDto,
  SuppliersQueryParams,
  PaginatedSuppliers,
  PurchasingDepartment,
} from '../../../models/Purchasemodels/Supplier';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SuppliersState {
  suppliers: Supplier[];
  departmentSuppliers: Supplier[];
  selectedSupplier: Supplier | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  status: AsyncStatus;
  actionStatus: AsyncStatus;
  error: string | null;
}

const initialState: SuppliersState = {
  suppliers: [],
  departmentSuppliers: [],
  selectedSupplier: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  status: 'idle',
  actionStatus: 'idle',
  error: null,
};

// Async Thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params: SuppliersQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await suppliersApi.getSuppliers(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch suppliers');
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  'suppliers/fetchSupplierById',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      return await suppliersApi.getSupplierById(id, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch supplier details');
    }
  }
);

export const fetchSuppliersByDepartment = createAsyncThunk(
  'suppliers/fetchSuppliersByDepartment',
  async (department: PurchasingDepartment, { rejectWithValue, signal }) => {
    try {
      return await suppliersApi.getSuppliersByDepartment(department, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to fetch suppliers for department: ${department}`);
    }
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (payload: CreateSupplierDto, { rejectWithValue, signal }) => {
    try {
      return await suppliersApi.createSupplier(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async (
    { id, payload }: { id: number; payload: UpdateSupplierDto },
    { rejectWithValue, signal }
  ) => {
    try {
      await suppliersApi.updateSupplier(id, payload, signal);
      return { id, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update supplier');
    }
  }
);

export const updateSupplierDepartments = createAsyncThunk(
  'suppliers/updateSupplierDepartments',
  async (
    { id, payload }: { id: number; payload: UpdateSupplierDepartmentsDto },
    { rejectWithValue, signal }
  ) => {
    try {
      await suppliersApi.updateSupplierDepartments(id, payload, signal);
      return { id, departments: payload.departments };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update supplier departments');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/deleteSupplier',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      await suppliersApi.deleteSupplier(id, signal);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete supplier');
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearSuppliersError: (state) => {
      state.error = null;
    },
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSuppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<PaginatedSuppliers>) => {
        state.status = 'succeeded';
        const raw = action.payload as any;
        const items = Array.isArray(raw)
          ? raw
          : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
        state.suppliers = items;
        state.totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
        state.pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
        state.pageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 10);
        state.totalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 1))));
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchSupplierById
      .addCase(fetchSupplierById.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.actionStatus = 'succeeded';
        state.selectedSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // fetchSuppliersByDepartment
      .addCase(fetchSuppliersByDepartment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSuppliersByDepartment.fulfilled, (state, action: PayloadAction<Supplier[]>) => {
        state.status = 'succeeded';
        const raw = action.payload as any;
        state.departmentSuppliers = Array.isArray(raw) ? raw : raw?.items || raw?.Items || raw?.data || [];
      })
      .addCase(fetchSuppliersByDepartment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // createSupplier
      .addCase(createSupplier.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // updateSupplier
      .addCase(updateSupplier.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { id, payload } = action.payload;
        const index = state.suppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.suppliers[index] = {
            ...state.suppliers[index],
            ...payload,
          };
        }
        if (state.selectedSupplier?.id === id) {
          state.selectedSupplier = {
            ...state.selectedSupplier,
            ...payload,
          };
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // updateSupplierDepartments
      .addCase(updateSupplierDepartments.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateSupplierDepartments.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { id, departments } = action.payload;
        const index = state.suppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.suppliers[index].departments = departments;
        }
        if (state.selectedSupplier?.id === id) {
          state.selectedSupplier.departments = departments;
        }
      })
      .addCase(updateSupplierDepartments.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // deleteSupplier
      .addCase(deleteSupplier.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<number>) => {
        state.actionStatus = 'succeeded';
        state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
        state.departmentSuppliers = state.departmentSuppliers.filter((s) => s.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedSupplier?.id === action.payload) {
          state.selectedSupplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSuppliersError,
  setSelectedSupplier,
  clearSelectedSupplier,
  setPageNumber,
  setPageSize,
} = suppliersSlice.actions;

export const suppliersReducer = suppliersSlice.reducer;
export default suppliersSlice.reducer;
