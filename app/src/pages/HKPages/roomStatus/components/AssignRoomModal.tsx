import { useState } from 'react'
import { FiSearch, FiUser } from 'react-icons/fi'
import { Modal } from '../../foundsAndLost/components/modals/Modal'
import { useAppDispatch } from '../../../../store/hooks'
import { 
  createHkmReceptionAssignment, 
  setHkmReceptionAssignmentProgress 
} from '../../../../features/HKfeatures/hkmReceptionAssignments/hkmReceptionAssignmentsSlice'
import { fetchAllRooms } from '../../../../features/housekeeping/housekeepingSlice'
import { hrEmployeesApi } from '../../../../shared/HRMshared/api/hrEmployeesApi'
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee'

interface AssignRoomModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string | null
  roomNumber: string
}

export function AssignRoomModal({ isOpen, onClose, roomId, roomNumber }: AssignRoomModalProps) {
  const dispatch = useAppDispatch()

  const [note, setNote] = useState('')
  
  // Employee Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [employeesResult, setEmployeesResult] = useState<HREmployeeReadDto[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<HREmployeeReadDto | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSearchEmployee = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    setSearchError('')
    setEmployeesResult([])
    setSelectedEmployee(null)
    
    try {
      const response = await hrEmployeesApi.fetchEmployees({ SearchTerm: searchQuery, PageSize: 50 }) as any
      if (response && response.items && response.items.length > 0) {
        setEmployeesResult(response.items)
      } else {
        setSearchError('No employees found')
      }
    } catch (e: any) {
      setSearchError(e.message || 'Error searching employee')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAssign = async () => {
    if (!roomId || !selectedEmployee) return
    
    setIsSubmitting(true)
    try {
      // 1. Create the assignment
      const createAction = await dispatch(createHkmReceptionAssignment({
        roomId,
        employeeId: selectedEmployee.id,
        note
      })).unwrap()
      
      // 2. Set it to in progress in the background
      await dispatch(setHkmReceptionAssignmentProgress(createAction.id)).unwrap()
      
      // 3. Refresh rooms list to reflect the new status (Cleaning)
      dispatch(fetchAllRooms())
      
      // 4. Reset & Close
      setNote('')
      setSearchQuery('')
      setEmployeesResult([])
      setSelectedEmployee(null)
      onClose()
    } catch (e: any) {
      console.error('Failed to assign room:', e)
      alert(e.message || 'Failed to assign room')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Room"
      subtitle={`Assign Room ${roomNumber} to an employee for cleaning`}
      maxWidth="max-w-md"
    >
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-slate-700">Search Employee <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or email..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 focus:border-[#0B4EA2] transition-all text-[14px]"
            />
            <button
              type="button"
              onClick={handleSearchEmployee}
              disabled={isSearching || !searchQuery}
              className="px-4 py-3 rounded-xl bg-[#0B4EA2] hover:bg-[#0a3f85] text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchError && (
            <span className="text-[13px] text-red-500">{searchError}</span>
          )}

          {employeesResult.length > 0 && !selectedEmployee && (
            <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
              {employeesResult.map(emp => (
                <div 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp)}
                  className="p-3 bg-white hover:border-[#0B4EA2] border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  <div className="text-[14px] font-bold text-slate-800">{emp.fullName}</div>
                  <div className="text-[13px] text-slate-500">{emp.email} • {emp.positionName || 'No Position'}</div>
                </div>
              ))}
            </div>
          )}

          {selectedEmployee && (
            <div className="flex justify-between items-center p-3 bg-[#EEF4FF] border border-[#D1E0FF] rounded-xl mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B4EA2] flex items-center justify-center text-white shrink-0">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#0B4EA2]">{selectedEmployee.fullName}</div>
                  <div className="text-[13px] text-[#0a3f85]">{selectedEmployee.email} • {selectedEmployee.positionName}</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setSelectedEmployee(null); setEmployeesResult([]); setSearchQuery(''); }}
                className="text-[12px] font-bold text-[#0B4EA2] hover:text-[#0a3f85] px-3 py-1.5 rounded-lg hover:bg-[#D1E0FF] transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-slate-700">Additional Note</label>
          <textarea 
            placeholder="Any specific instructions..."
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 focus:border-[#0B4EA2] transition-all text-[14px] resize-none"
          />
        </div>

        <div className="flex justify-between gap-4 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleAssign}
            disabled={!selectedEmployee || isSubmitting}
            className="flex-1 py-3 rounded-xl bg-[#0B4EA2] hover:bg-[#0a3f85] transition-colors text-white text-[14px] font-bold disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
