import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Briefcase, Camera } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import { fetchPositions } from '../../../../features/HRMfeatures/positions/positionsSlice';
import { updateHrEmployee, uploadHrEmployeeImage } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { appAlert } from '../../../../shared/ui/AppAlert';
import type { HREmployeeReadDto, HREmployeeUpdateDto } from '../../../../models/HRMmodels/HREmployee';
import { resolveImageUrl } from '../../../../shared/HRMshared/utils/imageUrl';

type Props = {
  employee: HREmployeeReadDto;
  onCancel: () => void;
};

type FormState = {
  fullName: string;
  email: string;
  departmentId: string;
  annualLeaveEntitlement: string;
  positionId: string;
  status: string;
};

const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10';

const selectClass =
  'h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 text-[14px] text-slate-700 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10';

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className="h-5 w-5 text-[#0B4EA2]" strokeWidth={1.8} />
      <h2 className="text-[17px] font-bold text-[#0B4EA2]">{title}</h2>
    </div>
  );
}

export function EditEmployeeForm({ employee, onCancel }: Props) {
  const dispatch = useAppDispatch();
  const departments = useAppSelector((state) => state.departments.departments);
  const positions = useAppSelector((state) => state.positions.positions);

  const [form, setForm] = useState<FormState>({
    fullName: employee.fullName,
    email: employee.email,
    departmentId: employee.departmentId,
    annualLeaveEntitlement: employee.annualLeaveEntitlement.toString(),
    positionId: employee.positionId,
    status: employee.status,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(resolveImageUrl(employee.imageUrl));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchDepartments({ PageNumber: 1, PageSize: 100 }));
    dispatch(fetchPositions({ PageNumber: 1, PageSize: 100 }));
  }, [dispatch]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    if (!form.fullName || !form.email || !form.departmentId || !form.positionId || !form.status) {
      appAlert.fire({ icon: 'error', title: 'Missing Fields', text: 'Please fill out all required fields.' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatePayload: HREmployeeUpdateDto = {
        fullName: form.fullName,
        email: form.email,
        departmentId: form.departmentId,
        positionId: form.positionId,
        annualLeaveEntitlement: Number(form.annualLeaveEntitlement) || 0,
        status: form.status,
      };

      await dispatch(updateHrEmployee({ id: employee.id, payload: updatePayload })).unwrap();

      // If a new photo was selected, upload it
      if (photoFile) {
        await dispatch(uploadHrEmployeeImage({ employeeId: employee.id, file: photoFile })).unwrap();
      }

      appAlert.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Employee updated successfully',
      });
      onCancel();
    } catch (error: any) {
      appAlert.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'error',
        title: error || 'Failed to update employee',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#0B4EA2] hover:bg-[#EEF4FF] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[22px] font-bold text-[#0B4EA2]">Edit Employee</h1>
        </div>
        <p className="ml-11 text-[14px] text-slate-500">Update the basic details and employment status for {employee.fullName}.</p>
      </div>

      <div className="space-y-0 divide-y divide-slate-200">
        {/* ── Section 1: Personal Information ── */}
        <section className="py-8">
          <SectionHeader icon={User} title="Personal Information" />

          {/* Profile Photo */}
          <div className="flex items-center gap-5 mb-7">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-[76px] w-[76px] shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#0B4EA2] hover:bg-[#EEF4FF] overflow-hidden group"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 text-2xl font-bold">
                  {employee.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div>
              <p className="text-[14px] font-semibold text-slate-700">Profile Photo</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Click to change. JPG or PNG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. John Doe"
                value={form.fullName}
                onChange={set('fullName')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                className={inputClass}
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>
          </div>
        </section>

        {/* ── Section 2: Employment Details ── */}
        <section className="py-8">
          <SectionHeader icon={Briefcase} title="Employment Details" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Department */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Department <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.departmentId} onChange={set('departmentId')}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
            </div>

            {/* Position */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Position <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.positionId} onChange={set('positionId')}>
                <option value="">Select Position</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
            </div>

            {/* Annual Leave Entitlement */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Annual Leave (Days) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="30"
                value={form.annualLeaveEntitlement}
                onChange={set('annualLeaveEntitlement')}
              />
            </div>

            {/* Status */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Employee Status <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.status} onChange={set('status')}>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="OnLeave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 pb-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 rounded-lg border border-slate-200 px-7 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="h-10 rounded-lg bg-[#0B4EA2] px-7 text-[14px] font-semibold text-white transition-colors hover:bg-[#093c80] disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Updating...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
