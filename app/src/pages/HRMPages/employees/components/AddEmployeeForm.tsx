import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Briefcase, Camera, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import { fetchPositions } from '../../../../features/HRMfeatures/positions/positionsSlice';
import { createHrEmployee, uploadHrEmployeeImage } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import Swal from 'sweetalert2';
import type { EmployeeGender, EmployeeRole } from '../../../../models/HRMmodels/HREmployee';

const NATIONALITIES = [
  'American',
  'British',
  'Canadian',
  'Egyptian',
  'Saudi',
  'Emirati',
  'French',
  'German',
  'Indian',
  'Other'
];

type Props = {
  onCancel: () => void;
};

type FormState = {
  photoFile: File | null;
  photoUrl: string | null;
  employeeCode: string;
  fullName: string;
  email: string;
  gender: EmployeeGender | '';
  nationality: string;
  role: EmployeeRole | '';
  departmentId: string;
  positionId: string;
  annualLeaveEntitlement: string;
  joiningDate: string;
  basicSalary: string;
  bankAccountNumber: string;
  password?: string;
};

const INITIAL_FORM: FormState = {
  photoFile: null,
  photoUrl: null,
  employeeCode: '',
  fullName: '',
  email: '',
  gender: '',
  nationality: '',
  role: '',
  departmentId: '',
  positionId: '',
  annualLeaveEntitlement: '30',
  joiningDate: '',
  basicSalary: '',
  bankAccountNumber: '',
  password: '',
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

export function AddEmployeeForm({ onCancel }: Props) {
  const dispatch = useAppDispatch();
  const departments = useAppSelector((state) => state.departments.departments);
  const positions = useAppSelector((state) => state.positions.positions);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setForm((f) => ({ ...f, photoFile: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    if (!form.photoFile) {
      Swal.fire({ icon: 'error', title: 'Photo Required', text: 'Please select a profile photo.' });
      return false;
    }
    if (!form.employeeCode || !form.fullName || !form.email || !form.gender || !form.nationality || !form.role || !form.departmentId || !form.positionId || !form.joiningDate || !form.basicSalary || !form.bankAccountNumber) {
      Swal.fire({ icon: 'error', title: 'Missing Fields', text: 'Please fill out all required fields.' });
      return false;
    }
    if (form.role === 'Manager' && !form.password) {
      Swal.fire({ icon: 'error', title: 'Password Required', text: 'A password is required for Manager role.' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 1. Create Employee
      const createPayload = {
        employeeCode: form.employeeCode,
        fullName: form.fullName,
        email: form.email,
        annualLeaveEntitlement: Number(form.annualLeaveEntitlement) || 0,
        nationality: form.nationality,
        bankAccountNumber: form.bankAccountNumber,
        gender: form.gender as EmployeeGender,
        role: form.role as EmployeeRole,
        departmentId: form.departmentId,
        positionId: form.positionId,
        joiningDate: new Date(form.joiningDate).toISOString(),
        basicSalary: Number(form.basicSalary) || 0,
        password: form.role === 'Manager' ? form.password : '',
      };

      const result = await dispatch(createHrEmployee(createPayload)).unwrap();

      // 2. Upload Photo
      if (form.photoFile && result.id) {
        await dispatch(uploadHrEmployeeImage({ employeeId: result.id, file: form.photoFile })).unwrap();
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'Employee added successfully',
      });
      onCancel();
    } catch (error: any) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'error',
        title: error || 'Failed to add employee',
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
          <h1 className="text-[22px] font-bold text-[#0B4EA2]">Add New Employee</h1>
        </div>
        <p className="ml-11 text-[14px] text-slate-500">Enter employee details to register them in the system.</p>
      </div>

      <div className="space-y-0 divide-y divide-slate-200">
        {/* ── Section 1: Personal Information ── */}
        <section className="py-8">
          <SectionHeader icon={User} title="Personal Information" />

          {/* Photo upload */}
          <div className="flex items-center gap-5 mb-7">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-[76px] w-[76px] shrink-0 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#0B4EA2] hover:bg-[#EEF4FF] overflow-hidden"
            >
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <div>
              <p className="text-[14px] font-semibold text-slate-700">Profile Photo <span className="text-red-500">*</span></p>
              <p className="text-[12px] text-slate-500 mt-0.5">Required. JPG or PNG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Employee Code */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Employee Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. EMP-101"
                value={form.employeeCode}
                onChange={set('employeeCode')}
              />
            </div>

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

            {/* Gender */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Gender <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.gender} onChange={set('gender')}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
            </div>

            {/* Nationality */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Nationality <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.nationality} onChange={set('nationality')}>
                <option value="">Select Nationality</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
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

            {/* Role */}
            <div className="relative">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">System Role <span className="text-red-500">*</span></label>
              <select className={selectClass} value={form.role} onChange={set('role')}>
                <option value="">Select Role</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </select>
              <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-slate-400">▼</span>
            </div>

            {/* Joining Date */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Joining Date <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.joiningDate}
                onChange={set('joiningDate')}
              />
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
          </div>
        </section>

        {/* ── Section 3: Salary & Security ── */}
        <section className="py-8">
          <SectionHeader icon={ShieldAlert} title="Salary & Security" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Basic Salary */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Basic Salary <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className={`${inputClass} pl-8`}
                  placeholder="0.00"
                  value={form.basicSalary}
                  onChange={set('basicSalary')}
                />
              </div>
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Bank Account Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass}
                placeholder="Account Number"
                value={form.bankAccountNumber}
                onChange={set('bankAccountNumber')}
              />
            </div>

            {/* Conditional Password */}
            {form.role === 'Manager' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Account Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Enter secure password"
                  value={form.password}
                  onChange={set('password')}
                />
                <p className="mt-1 text-[11px] text-slate-500">Required for Manager access.</p>
              </div>
            )}
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
              Saving...
            </>
          ) : (
            'Save Employee'
          )}
        </button>
      </div>
    </div>
  );
}
