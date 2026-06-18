import { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import { fetchPositions } from '../../../../features/HRMfeatures/positions/positionsSlice';
import { fetchHrEmployees } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';

export function EmployeesFilters() {
  const dispatch = useAppDispatch();
  const departments = useAppSelector((state) => state.departments.departments);
  const positions = useAppSelector((state) => state.positions.positions);

  const [status, setStatus] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments({ PageNumber: 1, PageSize: 100 }));
    dispatch(fetchPositions({ PageNumber: 1, PageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchHrEmployees({
          PageNumber: 1,
          PageSize: 10,
          ...(status ? { Status: status } : {}),
          ...(departmentId ? { DepartmentId: departmentId } : {}),
          ...(positionId ? { PositionId: positionId } : {}),
          ...(searchTerm ? { SearchTerm: searchTerm } : {}),
        })
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [dispatch, status, departmentId, positionId, searchTerm]);

  const selectClass =
    'w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[14px] rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#0B4EA2] transition-colors cursor-pointer';

  return (
    <div className="flex items-center gap-4 mb-6 flex-wrap">
      {/* Status Dropdown */}
      <div className="relative w-[180px]">
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="Active">Active</option>
          <option value="OnLeave">On Leave</option>
          <option value="Terminated">Terminated</option>
        </select>
        <IconImage src={FiChevronDown} alt="Expand" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
      </div>

      {/* Department Dropdown */}
      <div className="relative w-[200px]">
        <select className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <IconImage src={FiChevronDown} alt="Expand" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
      </div>

      {/* Position Dropdown */}
      <div className="relative w-[200px]">
        <select className={selectClass} value={positionId} onChange={(e) => setPositionId(e.target.value)}>
          <option value="">All positions</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <IconImage src={FiChevronDown} alt="Expand" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-[380px]">
        <IconImage src={FiSearch} alt="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-700 text-[14px] rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0B4EA2] transition-colors placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
