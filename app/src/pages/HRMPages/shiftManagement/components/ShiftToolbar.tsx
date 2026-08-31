import { UserPlus } from 'lucide-react';

type Props = {
  onAssignClick: () => void;
};

export function ShiftToolbar({ onAssignClick }: Props) {
  return (
    <div className="flex items-center justify-end gap-4 mt-8 mb-6">
      {/* Assign Employee Button */}
      <button
        type="button"
        onClick={onAssignClick}
        className="flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#093d82]"
      >
        <UserPlus className="h-4 w-4" />
        Assign Employee
      </button>
    </div>
  );
}
