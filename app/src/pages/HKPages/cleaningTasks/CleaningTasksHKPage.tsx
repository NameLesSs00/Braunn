import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchHkmReceptionAssignments,
  setHkmReceptionAssignmentProgress,
  completeHkmReceptionAssignment,
  deleteHkmReceptionAssignment,
} from '../../../features/HKfeatures/hkmReceptionAssignments/hkmReceptionAssignmentsSlice';
import type { HkmReceptionAssignmentReadDto } from '../../../models/HKmodels/HkmReceptionAssignment';
import { hrEmployeesApi } from '../../../shared/HRMshared/api/hrEmployeesApi';
import type { HREmployeeReadDto } from '../../../models/HRMmodels/HREmployee';
import { getRooms } from '../../../shared/apis/roomsApi';
import type { Room } from '../../../models/Room';
import { showSuccessToast, showErrorToast } from '../../../shared/ui/toastFeedback';
import { CleaningTasksHeader, CleaningTasksFilters } from './components/CleaningTasksFilters';
import { CleaningTasksTable } from './components/CleaningTasksTable';
import { EditAssignmentModal } from './components/modals/EditAssignmentModal';

export function CleaningTasksHKPage() {
  const dispatch = useAppDispatch();
  const { items: assignments, status } = useAppSelector((state) => state.hkmReceptionAssignments);

  // Reference data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<HREmployeeReadDto[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Modals & Action loading states
  const [editingAssignment, setEditingAssignment] = useState<HkmReceptionAssignmentReadDto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      await dispatch(fetchHkmReceptionAssignments({ PageNumber: 1, PageSize: 100 })).unwrap();
    } catch (err) {
      showErrorToast(err, 'Failed to load reception cleaning assignments');
    }
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    loadAssignments();

    // Fetch rooms for room number lookup
    getRooms({ pageNumber: 1, pageSize: 1000 })
      .then((res) => {
        if (res && res.items) {
          setRooms(res.items);
        }
      })
      .catch((err) => console.error('Failed to load rooms:', err));

    // Fetch employees for staff name lookup
    hrEmployeesApi
      .fetchEmployees({ PageSize: 100 })
      .then((res: any) => {
        if (res && res.items) {
          setEmployees(res.items);
        }
      })
      .catch((err) => console.error('Failed to load employees:', err));
  }, [loadAssignments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssignments();
    setIsRefreshing(false);
  };

  // Maps for fast O(1) lookups
  const roomNumberMap = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((r) => {
      map.set(r.id, r.roomNumber);
    });
    return map;
  }, [rooms]);

  const employeeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((emp) => {
      map.set(emp.id, emp.fullName || emp.id);
    });
    return map;
  }, [employees]);

  // Action handlers
  const handleSetProgress = async (id: number) => {
    setLoadingActionId(id);
    try {
      await dispatch(setHkmReceptionAssignmentProgress(id)).unwrap();
      showSuccessToast('Cleaning status updated to In Progress.');
      await loadAssignments();
    } catch (err) {
      showErrorToast(err, 'Failed to set assignment in progress');
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleComplete = async (id: number) => {
    setLoadingActionId(id);
    try {
      await dispatch(completeHkmReceptionAssignment(id)).unwrap();
      showSuccessToast('Assignment marked as completed.');
      await loadAssignments();
    } catch (err) {
      showErrorToast(err, 'Failed to complete assignment');
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this cleaning assignment?')) {
      return;
    }
    setLoadingActionId(id);
    try {
      await dispatch(deleteHkmReceptionAssignment(id)).unwrap();
      showSuccessToast('Assignment deleted successfully.');
      await loadAssignments();
    } catch (err) {
      showErrorToast(err, 'Failed to delete assignment');
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleEdit = (assignment: HkmReceptionAssignmentReadDto) => {
    setEditingAssignment(assignment);
    setIsEditModalOpen(true);
  };

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((task) => {
      if (selectedEmployeeId && task.employeeId !== selectedEmployeeId) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const roomNum = (roomNumberMap.get(task.roomId) || '').toLowerCase();
        const empName = (employeeNameMap.get(task.employeeId) || '').toLowerCase();
        const note = (task.note || '').toLowerCase();
        const idStr = String(task.id);

        const match =
          roomNum.includes(query) ||
          empName.includes(query) ||
          note.includes(query) ||
          idStr.includes(query);

        if (!match) return false;
      }

      return true;
    });
  }, [assignments, selectedEmployeeId, searchQuery, roomNumberMap, employeeNameMap]);

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <CleaningTasksHeader />

      <CleaningTasksFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeChange={setSelectedEmployeeId}
        employees={employees}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || status === 'loading'}
      />

      <CleaningTasksTable
        assignments={filteredAssignments}
        roomNumberMap={roomNumberMap}
        employeeNameMap={employeeNameMap}
        onSetProgress={handleSetProgress}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loadingActionId={loadingActionId}
      />

      <EditAssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAssignment(null);
        }}
        assignment={editingAssignment}
        roomNumber={editingAssignment ? roomNumberMap.get(editingAssignment.roomId) : undefined}
        onSuccess={loadAssignments}
      />
    </div>
  );
}
