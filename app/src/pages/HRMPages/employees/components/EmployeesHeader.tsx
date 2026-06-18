import { FiPlus } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

type Props = {
  onAdd: () => void;
};

export function EmployeesHeader({ onAdd }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Employees</h1>
        <p className="text-slate-500 mt-1">Manage employee data, departments, and employment status.</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-[#0B4EA2] hover:bg-[#093c80] text-white px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors"
      >
        <IconImage src={FiPlus} alt="Add" className="w-4 h-4" />
        Add employee
      </button>
    </div>
  );
}
