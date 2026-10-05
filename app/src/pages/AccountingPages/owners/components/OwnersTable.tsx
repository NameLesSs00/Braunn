import { useState, useEffect } from 'react'
import { MoreHorizontal, Edit2, Power, PowerOff, Trash2 } from 'lucide-react'
import type { Owner } from '../../../../models/Accounting/owner'
import { useAppDispatch } from '../../../../store/hooks'
import { deactivateOwner, removeOwner } from '../../../../features/accounting/ownersSlice'
import { appAlert } from '../../../../shared/ui/AppAlert'
import { OwnerModal } from '../modals/OwnerModal'

type OwnersTableProps = {
  owners: Owner[]
}

export function OwnersTable({ owners }: OwnersTableProps) {
  const dispatch = useAppDispatch()
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-dropdown')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleDeactivate = async (id: string, name: string) => {
    const confirmed = await appAlert.fire({
      icon: 'warning',
      title: 'Deactivate Owner?',
      text: `Are you sure you want to deactivate ${name}?`,
      confirmButtonText: 'Yes, deactivate',
    })

    if (confirmed.isConfirmed) {
      dispatch(deactivateOwner(id))
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await appAlert.fire({
      icon: 'error',
      title: 'Delete Owner?',
      text: `Are you sure you want to permanently delete ${name}? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete',
    })

    if (confirmed.isConfirmed) {
      dispatch(removeOwner(id))
    }
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[13px] font-semibold text-slate-700 shadow-sm">
            <tr>
              <th className="whitespace-nowrap px-6 py-4">Full Name</th>
              <th className="whitespace-nowrap px-6 py-4">Contact Info</th>
              <th className="whitespace-nowrap px-6 py-4">ID Number</th>
              <th className="whitespace-nowrap px-6 py-4">IBAN</th>
              <th className="whitespace-nowrap px-6 py-4">Stats</th>
              <th className="whitespace-nowrap px-6 py-4 text-center">Status</th>
              <th className="whitespace-nowrap px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {owners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No owners found. Try adjusting your search or add a new one.
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{owner.fullName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-[13px] text-slate-800">{owner.email || '—'}</div>
                      <div className="text-[12px] text-slate-500">{owner.phone || '—'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] text-slate-800">{owner.identificationNumber || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] text-slate-800">{owner.iban || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-[13px] text-slate-800">{owner.activeRoomsCount} Rooms</div>
                      <div className="text-[12px] text-slate-500">{owner.activeContractsCount} Contracts</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        owner.isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                      }`}
                    >
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left action-dropdown">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === owner.id ? null : owner.id)}
                        className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
                      >
                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                      </button>
                      
                      {openDropdown === owner.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 origin-top-right rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                setEditingOwner(owner)
                                setOpenDropdown(null)
                              }}
                              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Edit2 className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeactivate(owner.id, owner.fullName)
                                setOpenDropdown(null)
                              }}
                              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                            >
                              {owner.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4 text-amber-400 group-hover:text-amber-500" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4 text-emerald-400 group-hover:text-emerald-500" />
                                  Activate
                                </>
                              )}
                            </button>
                            <div className="my-1 h-px bg-slate-100" />
                            <button
                              onClick={() => {
                                handleDelete(owner.id, owner.fullName)
                                setOpenDropdown(null)
                              }}
                              className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-rose-400 group-hover:text-rose-500" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingOwner && (
        <OwnerModal
          open={!!editingOwner}
          onClose={() => setEditingOwner(null)}
          owner={editingOwner}
        />
      )}
    </>
  )
}
