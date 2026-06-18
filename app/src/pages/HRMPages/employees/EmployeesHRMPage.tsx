import { useState } from 'react';
import { EmployeesHeader } from './components/EmployeesHeader';
import { EmployeesFilters } from './components/EmployeesFilters';
import { EmployeesTable } from './components/EmployeesTable';
import { AddEmployeeForm } from './components/AddEmployeeForm';
import { EditEmployeeForm } from './components/EditEmployeeForm';
import { EmployeeDetailsView } from './components/EmployeeDetailsView';
import { TerminationDetailsModal } from './components/modals/TerminationDetailsModal';
import type { HREmployeeReadDto } from '../../../models/HRMmodels/HREmployee';

export function EmployeesHRMPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<HREmployeeReadDto | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);

  if (isAdding) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <AddEmployeeForm onCancel={() => setIsAdding(false)} />
      </div>
    );
  }

  if (editingEmployee) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <EditEmployeeForm employee={editingEmployee} onCancel={() => setEditingEmployee(null)} />
      </div>
    );
  }

  if (viewingEmployee && viewingEmployee.status !== 'Terminated') {
    return (
      <div className="max-w-[1600px] mx-auto">
        <EmployeeDetailsView 
          employee={viewingEmployee} 
          onBack={() => setViewingEmployee(null)} 
          onEdit={() => setEditingEmployee(viewingEmployee)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <EmployeesHeader onAdd={() => setIsAdding(true)} />
      <EmployeesFilters />
      <EmployeesTable 
        onView={(emp) => setViewingEmployee(emp)} 
        onEdit={(emp) => setEditingEmployee(emp)}
      />

      <TerminationDetailsModal
        open={viewingEmployee?.status === 'Terminated'}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee?.status === 'Terminated' ? viewingEmployee : null}
      />
    </div>
  );
}
