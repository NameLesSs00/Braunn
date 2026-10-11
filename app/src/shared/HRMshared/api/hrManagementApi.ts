import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  HRMOverviewResponse,
  ShiftManagementOverviewResponse,
  HRMOverviewData,
  ShiftManagementOverviewData,
} from '../../../models/HRMmodels/HRManagementOverview';

const BASE_PATH = 'hr/HRManagement';

export const hrManagementApi = {
  fetchOverviewHRM: async (signal?: AbortSignal): Promise<HRMOverviewData> => {
    return unwrapApiResponse<HRMOverviewData>(
      await apiRequest<HRMOverviewResponse>({
        method: 'GET',
        path: `/${BASE_PATH}/overview-HRM`,
        signal,
      })
    );
  },
  
  fetchShiftManagementOverview: async (signal?: AbortSignal): Promise<ShiftManagementOverviewData> => {
    return unwrapApiResponse<ShiftManagementOverviewData>(
      await apiRequest<ShiftManagementOverviewResponse>({
        method: 'GET',
        path: `/${BASE_PATH}/ShiftManagement-overview`,
        signal,
      })
    );
  }
};
