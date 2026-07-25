import { useMemo, useState } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import { Modal } from '../../../shared/ui/Modal'
import type { MaintenanceRequestListItem } from '../../../models/MaintenanceRequest'

type Employee = { id: string; fullName: string }

type Props = {
  open: boolean
  request: MaintenanceRequestListItem | null
  employees: Employee[]
  mode?: 'assign' | 'reassign'
  onClose: () => void
  onAssign: (employeeId: string) => void
}

export function EmployeeAssignModal({ open, request, employees, mode = 'assign', onClose, onAssign }: Props) {
  const [query, setQuery] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  const filteredEmployees = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return employees
    return employees.filter((employee) => employee.fullName.toLowerCase().includes(value))
  }, [employees, query])

  const handleClose = () => {
    setQuery('')
    setSelectedEmployeeId(null)
    onClose()
  }

  const handleAssign = () => {
    if (!selectedEmployeeId) return
    onAssign(selectedEmployeeId)
    handleClose()
  }

  const isReassign = mode === 'reassign'
  const title = isReassign ? 'Reassign Employee' : 'Assign Employee'
  const buttonLabel = isReassign ? 'Reassign' : 'Assign'

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="w-[500px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between bg-[#0B4EA2] px-6 py-4 text-white">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="text-[12px] text-blue-100">{request?.requestNo ?? 'Maintenance request'}</p>
          </div>
          <button type="button" onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold text-slate-800">Select employee</p>
            <div className="mt-2 relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none placeholder:text-slate-400"
                placeholder="Search employee"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => setSelectedEmployeeId(employee.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${selectedEmployeeId === employee.id ? 'bg-[#EAF2FF] text-[#0B4EA2]' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
              >
                <span className="font-medium">{employee.fullName}</span>
                <span className="text-xs">{selectedEmployeeId === employee.id ? 'Selected' : 'Choose'}</span>
              </button>
            ))}
            {filteredEmployees.length === 0 && <div className="px-2 py-4 text-center text-sm text-slate-500">No employees found</div>}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" onClick={handleAssign} disabled={!selectedEmployeeId} className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0A3F8B] disabled:cursor-not-allowed disabled:opacity-50">
              <UserPlus className="h-4 w-4" />
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
