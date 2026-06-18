import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchShiftAssignments } from '../../../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice';
import { fetchHrEmployees } from '../../../features/HRMfeatures/employees/hrEmployeesSlice';
import type { HREmployeeReadDto } from '../../../models/HRMmodels/HREmployee';
import { ShiftSummaryCards } from './components/ShiftSummaryCards';
import { ShiftToolbar } from './components/ShiftToolbar';
import { ShiftCalendar } from './components/ShiftCalendar';
import { SelectEmployeePopup } from './components/SelectEmployeePopup';
import { AssignEmployeePopup } from './components/AssignEmployeePopup';
import { ShiftDetailsPopup } from './components/ShiftDetailsPopup';
import { ShiftTransferPopup } from './components/ShiftTransferPopup';
import { Shift } from './types';

export function ShiftManagementHRMPage() {
  const dispatch = useAppDispatch();
  const { items: assignments } = useAppSelector((state: any) => state.shiftAssignments);
  const { employees } = useAppSelector((state: any) => state.hrEmployees);

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<HREmployeeReadDto[]>([]);

  // New states for the latest popups
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<Shift | null>(null);
  const [isGeneralTransferOpen, setIsGeneralTransferOpen] = useState(false);
  const [employeeForTransfer, setEmployeeForTransfer] = useState<HREmployeeReadDto | null>(null);

  // Use 2026-06-01 as Monday of the starting week matching the mock data visually (Jun 2 was Tuesday)
  // Let's set it to 2026-06-08 (Monday of next week, wait, 2026-06-01 is Monday).
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date('2026-06-01T00:00:00'));

  useEffect(() => {
    // Fetch with large page size to get all assignments and employees
    dispatch(fetchShiftAssignments({ PageNumber: 1, PageSize: 100 }));
    dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 100 }));
  }, [dispatch]);

  // Derived Week Days
  const weekDays = useMemo(() => {
    const days = [];
    const date = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Jun 2"
      
      // format to local YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;
      
      days.push({ label, date: dateLabel, dateStr });
    }
    return days;
  }, [currentWeekStart]);


  // Transform assignments into Shift[]
  const shifts = useMemo(() => {
    const mappedShifts: Shift[] = [];

    // Helper map for quick employee lookup
    const empMap = new Map(employees?.map((e: any) => [e.id, e]));

    if (!assignments || assignments.length === 0) return mappedShifts;

    // Grouping overlapping assignments per day per shiftId
    weekDays.forEach((day) => {
      const dayDate = new Date(`${day.dateStr}T00:00:00`).getTime();

      // Find overlapping assignments for this day
      const overlapping = assignments.filter((a: any) => {
        // "from": "2026-06-18 02:00:00"
        const fromDateStr = a.from.split(' ')[0];
        const toDateStr = a.to.split(' ')[0];
        const fromDate = new Date(`${fromDateStr}T00:00:00`).getTime();
        const toDate = new Date(`${toDateStr}T00:00:00`).getTime();
        return dayDate >= fromDate && dayDate <= toDate;
      });

      // Group by shiftId
      const grouped = overlapping.reduce((acc: any, curr: any) => {
        if (!acc[curr.shiftId]) {
          acc[curr.shiftId] = { shiftName: curr.shiftName, employees: [], from: curr.from, to: curr.to };
        }
        acc[curr.shiftId].employees.push(curr);
        return acc;
      }, {});

      Object.keys(grouped).forEach(shiftId => {
        const group = grouped[shiftId];
        
        // Find department from first employee
        let department = 'Unknown';
        const assignedEmps: { id: string; name: string; initials: string }[] = [];
        
        for (const a of group.employees) {
          const emp = empMap.get(a.employeeId) as any;
          if (emp && emp.departmentName) {
            department = emp.departmentName;
          }
          const names = a.employeeName.trim().split(' ');
          const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : (names[0][0] || '?');
          assignedEmps.push({
            id: a.employeeId,
            name: a.employeeName,
            initials: initials.toUpperCase()
          });
        }

        // Extract time from 'from' and 'to'
        const startTime = group.from.split(' ')[1]?.substring(0, 5) || '00:00';
        const endTime = group.to.split(' ')[1]?.substring(0, 5) || '00:00';

        mappedShifts.push({
          id: `${shiftId}-${day.dateStr}`,
          type: group.shiftName,
          department,
          startTime,
          endTime,
          employeeCount: group.employees.length,
          dateStr: day.dateStr,
          assignedEmployees: assignedEmps
        });
      });
    });

    return mappedShifts;
  }, [assignments, employees, weekDays]);

  const dynamicDepartments = useMemo(() => {
    const deps = new Set<string>();
    shifts.forEach(s => deps.add(s.department));
    return Array.from(deps);
  }, [shifts]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleAssignClick = () => {
    setIsSelectOpen(true);
  };

  const handleNext = (employeesList: HREmployeeReadDto[]) => {
    setSelectedEmployees(employeesList);
    setIsSelectOpen(false);
    setIsAssignOpen(true);
  };

  const handleBack = () => {
    setIsAssignOpen(false);
    setIsSelectOpen(true);
  };

  const handleCloseAll = () => {
    setIsSelectOpen(false);
    setIsAssignOpen(false);
    setSelectedEmployees([]);
    setSelectedShiftForDetails(null);
    setIsGeneralTransferOpen(false);
    setEmployeeForTransfer(null);
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShiftForDetails(shift);
  };

  const handleGeneralTransferClick = () => {
    setIsGeneralTransferOpen(true);
  };

  const handleEmployeeTransferClick = (emp: HREmployeeReadDto) => {
    setEmployeeForTransfer(emp);
    setIsSelectOpen(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a365d]">Shift Management</h1>
        <p className="text-slate-500 mt-1">
          Manage weekly schedules and ensure full operational coverage.
        </p>
      </div>

      {/* Summary Cards */}
      <ShiftSummaryCards />

      {/* Toolbar */}
      <ShiftToolbar 
        onAssignClick={handleAssignClick} 
        onTransferClick={handleGeneralTransferClick} 
      />

      {/* Main Calendar Area */}
      <ShiftCalendar 
        onShiftClick={handleShiftClick} 
        shifts={shifts}
        weekDays={weekDays}
        currentWeekStart={currentWeekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onDateChange={setCurrentWeekStart}
        dynamicDepartments={dynamicDepartments}
      />

      {/* Step 1: Select Employee Popup */}
      <SelectEmployeePopup
        open={isSelectOpen}
        onClose={handleCloseAll}
        onNext={handleNext}
        onTransferClick={handleEmployeeTransferClick}
      />

      {/* Step 2: Assign Employee Popup */}
      <AssignEmployeePopup
        open={isAssignOpen}
        onClose={handleCloseAll}
        onBack={handleBack}
        selectedEmployees={selectedEmployees}
      />

      {/* Shift Details Popup */}
      <ShiftDetailsPopup
        open={!!selectedShiftForDetails}
        onClose={() => setSelectedShiftForDetails(null)}
        shift={selectedShiftForDetails}
      />

      {/* Shift Transfer Popup (Handles both General and Employee-specific) */}
      <ShiftTransferPopup
        open={isGeneralTransferOpen || !!employeeForTransfer}
        onClose={() => {
          setIsGeneralTransferOpen(false);
          setEmployeeForTransfer(null);
        }}
        employee={employeeForTransfer}
      />
    </div>
  );
}
