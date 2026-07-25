import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertCircle,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { TbCategory2 } from 'react-icons/tb'
import {
  HiOutlineVariable,
  HiOutlineBolt,
  HiOutlinePower,
  HiOutlineBeaker,
  HiOutlineShieldCheck,
  HiOutlineWrench,
  HiOutlineArrowsUpDown,
  HiOutlineBars3BottomRight
} from 'react-icons/hi2'

import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { 
  fetchMaintenanceCategories, 
  addMaintenanceCategory,    // <--- Changed from createMaintenanceCategory
  editMaintenanceCategory,   // <--- Changed from updateMaintenanceCategory
  removeMaintenanceCategory  // <--- Changed from deleteMaintenanceCategory
  ,  clearCategoryError

} from '../../features/maintenance/maintenanceCategoriesSlice'
import { appAlert } from '../../shared/ui/AppAlert'
import type { MaintenanceCategory } from '../../models/MaintenanceCategory'
import { maintenanceUnitsApi, type MaintenanceUnit } from '../../shared/apis/maintenanceUnitsApi'

const iconOptions = [
  'Fan',
  'Bolt',
  'Plug',
  'Drop',
  'Shield',
  'Wrench',
  'Lift',
  'Pipe',
]

const ICONS_MAP: Record<string, any> = {
  Fan: HiOutlineVariable,
  Bolt: HiOutlineBolt,
  Plug: HiOutlinePower,
  Drop: HiOutlineBeaker,
  Shield: HiOutlineShieldCheck,
  Wrench: HiOutlineWrench,
  Lift: HiOutlineArrowsUpDown,
  Pipe: HiOutlineBars3BottomRight,
}

function CategoryBadge({ label }: { label: string }) {
  // Generate a consistent color based on string length or first char just for display if we don't have explicit tones
  return <span className="inline-flex rounded-full bg-[#eff6ff] px-2.5 py-1 text-[12px] font-semibold text-[#1d4ed8]">{label}</span>
}

function CategoryModal({
  title,
  submitLabel,
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting,
}: {
  title: string
  submitLabel: string
  isOpen: boolean
  onClose: () => void
  initialData?: MaintenanceCategory | null
  onSubmit: (data: { name: string; code: string; description: string; icon: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Fan')

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '')
      setCode(initialData?.code ?? '')
      setDescription(initialData?.description ?? '')
      setSelectedIcon(initialData?.icon || 'Fan')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name || !code) {
      appAlert.fire({ icon: 'warning', title: 'Validation Error', text: 'Name and Code are required.' })
      return
    }
    onSubmit({ name, code, description, icon: selectedIcon })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb0] px-5 py-4 text-white">
          <div className="text-[18px] font-bold">{title}</div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full p-1 text-white hover:bg-white/15" aria-label="Close">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 bg-white p-5">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-slate-700">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Plumbing"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-slate-700">Category Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. PLMB"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="Brief description of the category..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[13px] font-semibold text-slate-700">Select Icon</div>
            <div className="grid grid-cols-4 gap-3">
              {iconOptions.map((iconName) => {
                const IconComp = ICONS_MAP[iconName]
                return (
                  <button
                    key={iconName}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setSelectedIcon(iconName)}
                    className={[
                      'flex h-14 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-semibold transition',
                      selectedIcon === iconName
                        ? 'border-2 border-[#004bb0] bg-[#eef4ff] text-[#004bb0]'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {IconComp && <IconComp className="h-5 w-5" />}
                    <span className="text-[11px] font-normal">{iconName}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-[#f8fafc] px-5 py-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="rounded-lg bg-[#004bb0] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  category: MaintenanceCategory | null
  onConfirm: () => void
  isDeleting: boolean
}) {
  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white shadow-2xl">
        <div className="px-5 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#fee2e2] text-[#b91c1c]">
              <FiAlertCircle className="h-5 w-5" />
            </div>
            <div className="text-[18px] font-bold text-slate-800">Delete Category</div>
          </div>

          <div className="text-[15px] font-semibold text-slate-700">
            Are you sure you want to delete the "{category.name}" category?
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-100 bg-[#eff6ff] px-4 py-3 text-[13px] text-slate-600">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-slate-700 text-[11px] font-bold text-white">i</div>
            <div>
              This action will unassign all assets currently associated with it and cannot be undone.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-lg border border-slate-400 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="flex items-center gap-2 rounded-lg bg-[#b91c1c] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            <FiTrash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UnitModal({
  title,
  submitLabel,
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting,
}: {
  title: string
  submitLabel: string
  isOpen: boolean
  onClose: () => void
  initialData?: MaintenanceUnit | null
  onSubmit: (data: { name: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim()) {
      appAlert.fire({ icon: 'warning', title: 'Validation Error', text: 'Unit name is required.' })
      return
    }
    onSubmit({ name: name.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb0] px-5 py-4 text-white">
          <div className="text-[18px] font-bold">{title}</div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full p-1 text-white hover:bg-white/15" aria-label="Close">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 bg-white p-5">
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-slate-700">Unit Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Pieces, Kilograms, Liters"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-[#f8fafc] px-5 py-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="rounded-lg bg-[#004bb0] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteUnitModal({
  isOpen,
  onClose,
  unit,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  unit: MaintenanceUnit | null
  onConfirm: () => void
  isDeleting: boolean
}) {
  if (!isOpen || !unit) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white shadow-2xl">
        <div className="px-5 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#fee2e2] text-[#b91c1c]">
              <FiAlertCircle className="h-5 w-5" />
            </div>
            <div className="text-[18px] font-bold text-slate-800">Delete Unit</div>
          </div>

          <div className="text-[15px] font-semibold text-slate-700">
            Are you sure you want to delete the "{unit.name}" unit?
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-100 bg-[#eff6ff] px-4 py-3 text-[13px] text-slate-600">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-slate-700 text-[11px] font-bold text-white">i</div>
            <div>
              This action cannot be undone. All items associated with this unit will need to be reassigned.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-lg border border-slate-400 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="flex items-center gap-2 rounded-lg bg-[#b91c1c] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
            <FiTrash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AssetCategoriesPage() {
  const dispatch = useAppDispatch()
  
  const { items, totalCount, status, createStatus, updateStatus, deleteStatus, error } = useAppSelector((state) => state.maintenanceCategories)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'categories' | 'units'>('categories')
  
  // Categories state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null)

  // Units state
  const [units, setUnits] = useState<MaintenanceUnit[]>([])
  const [unitsTotalCount, setUnitsTotalCount] = useState(0)
  const [unitsSearch, setUnitsSearch] = useState('')
  const [debouncedUnitsSearch, setDebouncedUnitsSearch] = useState('')
  const [unitsPage, setUnitsPage] = useState(1)
  const unitsPageSize = 10
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [unitModalOpen, setUnitModalOpen] = useState(false)
  const [deleteUnitModalOpen, setDeleteUnitModalOpen] = useState(false)
  const [unitModalMode, setUnitModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUnit, setSelectedUnit] = useState<MaintenanceUnit | null>(null)
  const [unitSubmitting, setUnitSubmitting] = useState(false)
  const [unitDeleting, setUnitDeleting] = useState(false)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  // Debounce units search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUnitsSearch(unitsSearch)
      setUnitsPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [unitsSearch])

  // Fetch items
  useEffect(() => {
    if (activeTab === 'categories') {
      dispatch(fetchMaintenanceCategories({
        search: debouncedSearch,
        pageNumber: page,
        pageSize,
      }))
    }
  }, [dispatch, debouncedSearch, page, activeTab])

  // Fetch units
  const fetchUnits = async () => {
    try {
      setUnitsLoading(true)
      const result = await maintenanceUnitsApi.getAll({
        search: debouncedUnitsSearch,
        pageNumber: unitsPage,
        pageSize: unitsPageSize,
      })
      setUnits(result.items || [])
      setUnitsTotalCount(result.totalCount || 0)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch units'
      appAlert.fire({ icon: 'error', title: 'Error', text: errorMsg })
    } finally {
      setUnitsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'units') {
      fetchUnits()
    }
  }, [activeTab, debouncedUnitsSearch, unitsPage])

  // Error handling
  useEffect(() => {
    if (status === 'failed' || createStatus === 'failed' || updateStatus === 'failed' || deleteStatus === 'failed') {
      if (error) {
        appAlert.fire({ icon: 'error', title: 'Error', text: error })
        dispatch(clearCategoryError())
      }
    }
  }, [status, createStatus, updateStatus, deleteStatus, error, dispatch])

  const handleCreateOrUpdate = async (data: { name: string; code: string; description: string; icon: string }) => {
    if (modalMode === 'create') {
      const res = await dispatch(addMaintenanceCategory(data))
      if (addMaintenanceCategory.fulfilled.match(res)) {
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Category created successfully.', timer: 2000, showConfirmButton: false })
        setCategoryModalOpen(false)
        dispatch(fetchMaintenanceCategories({ search: debouncedSearch, pageNumber: page, pageSize }))
      }
    } else if (modalMode === 'edit' && selectedCategory) {
      const res = await dispatch(editMaintenanceCategory({ id: selectedCategory.id, payload: data }))
      if (editMaintenanceCategory.fulfilled.match(res)) {
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Category updated successfully.', timer: 2000, showConfirmButton: false })
        setCategoryModalOpen(false)
        dispatch(fetchMaintenanceCategories({ search: debouncedSearch, pageNumber: page, pageSize }))
      }
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    const res = await dispatch(removeMaintenanceCategory(selectedCategory.id))
    if (removeMaintenanceCategory.fulfilled.match(res)) {
      appAlert.fire({ icon: 'success', title: 'Success', text: 'Category deleted successfully.', timer: 2000, showConfirmButton: false })
      setDeleteModalOpen(false)
      dispatch(fetchMaintenanceCategories({ search: debouncedSearch, pageNumber: page, pageSize }))
    }
  }

  // Units handlers
  const handleCreateOrUpdateUnit = async (data: { name: string }) => {
    try {
      setUnitSubmitting(true)
      if (unitModalMode === 'create') {
        await maintenanceUnitsApi.create(data)
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Unit created successfully.', timer: 2000, showConfirmButton: false })
      } else if (unitModalMode === 'edit' && selectedUnit) {
        await maintenanceUnitsApi.update(selectedUnit.id, data)
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Unit updated successfully.', timer: 2000, showConfirmButton: false })
      }
      setUnitModalOpen(false)
      setSelectedUnit(null)
      fetchUnits()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to save unit'
      appAlert.fire({ icon: 'error', title: 'Error', text: errorMsg })
    } finally {
      setUnitSubmitting(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return
    try {
      setUnitDeleting(true)
      await maintenanceUnitsApi.delete(selectedUnit.id)
      appAlert.fire({ icon: 'success', title: 'Success', text: 'Unit deleted successfully.', timer: 2000, showConfirmButton: false })
      setDeleteUnitModalOpen(false)
      setSelectedUnit(null)
      fetchUnits()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to delete unit'
      appAlert.fire({ icon: 'error', title: 'Error', text: errorMsg })
    } finally {
      setUnitDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))
  const unitsTotalPages = Math.max(1, Math.ceil((unitsTotalCount || 0) / unitsPageSize))
  const isSubmitting = createStatus === 'loading' || updateStatus === 'loading'
  const isDeleting = deleteStatus === 'loading'
  const isLoadingList = status === 'loading'

  return (
    <div className="space-y-6">
      <MaintenanceHeader NameMaintenance="Asset Management" />

      {/* Tab Navigation */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-200 flex justify-between items-center">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-[#004bb0] text-[#004bb0]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'units'
                  ? 'border-[#004bb0] text-[#004bb0]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Units
            </button>
          </nav>

          {activeTab === 'units' && (
            <button
              type="button"
              onClick={() => {
                setSelectedUnit(null)
                setUnitModalMode('create')
                setUnitModalOpen(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-[#004bb0] px-4 py-2 text-sm font-semibold text-white mb-4"
            >
              <FiPlus className="h-4 w-4" />
              Add Unit
            </button>
          )}
        </div>
      </div>

      {/* Categories Tab Content */}
      {activeTab === 'categories' && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-[320px]">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by category name or code..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#004bb0]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null)
                setModalMode('create')
                setCategoryModalOpen(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-[#004bb0] px-4 py-2 text-sm font-semibold text-white"
            >
              <FiPlus className="h-4 w-4" />
              Add category
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-50">
              <tr>
                {['Category Name', 'Code', 'Assets Count', 'Description', 'Actions'].map((column) => (
                  <th key={column} className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoadingList ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">Loading categories...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">No categories found.</td>
                </tr>
              ) : (
                items.map((category) => {
                  const IconComp = ICONS_MAP[category.icon] || TbCategory2
                  return (
                    <tr key={category.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                      <td className="px-4 py-4 text-[13px] font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[#004bb0]">
                            <IconComp className="h-4 w-4" />
                          </div>
                          {category.name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <CategoryBadge label={category.code} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[12px] font-semibold text-[#0369a1]">
                          {category.itemCount ?? 0} Items
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-600">{category.description}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-[#004bb0] p-2 text-[#004bb0] hover:bg-[#eef4ff] transition-colors"
                            onClick={() => {
                              setSelectedCategory(category)
                              setModalMode('edit')
                              setCategoryModalOpen(true)
                            }}
                            title="Edit"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[#b91c1c] p-2 text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
                            onClick={() => {
                              setSelectedCategory(category)
                              setDeleteModalOpen(true)
                            }}
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select disabled className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 opacity-70">
              <option>{pageSize}</option>
            </select>
            <span>entries</span>
          </div>
          <div>
            Showing {items.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-md bg-[#004bb0] px-3 py-1.5 text-white">
              {page}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Units Tab Content */}
      {activeTab === 'units' && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-[320px]">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={unitsSearch}
                  onChange={(event) => setUnitsSearch(event.target.value)}
                  placeholder="Search units..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#004bb0]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-slate-50">
                <tr>
                    <th  className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                     Unit Name
                    </th>
                     <th  className="px-4 text-right py-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                     Actions
                    </th>
                </tr>
              </thead>
              <tbody>
                {unitsLoading ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-sm text-slate-500">Loading units...</td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-sm text-slate-500">No units found.</td>
                  </tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                      <td className="px-4 py-4 text-[13px] font-semibold text-slate-800">{unit.name}</td>
                      <td className="px-4">
<div className="flex justify-end items-center gap-2">                          <button
                            type="button"
                            className="rounded-md border border-[#004bb0] p-2 text-[#004bb0] hover:bg-[#eef4ff] transition-colors"
                            onClick={() => {
                              setSelectedUnit(unit)
                              setUnitModalMode('edit')
                              setUnitModalOpen(true)
                            }}
                            title="Edit"
                          >
                            <FiEdit3 className="h-4 w-4 " />
                          </button>
                          <button
                            type="button"
                            className="rounded-md border  border-[#b91c1c] p-2 text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
                            onClick={() => {
                              setSelectedUnit(unit)
                              setDeleteUnitModalOpen(true)
                            }}
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select disabled className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 opacity-70">
                <option>{unitsPageSize}</option>
              </select>
              <span>entries</span>
            </div>
            <div>
              Showing {units.length > 0 ? (unitsPage - 1) * unitsPageSize + 1 : 0} to {Math.min(unitsPage * unitsPageSize, unitsTotalCount)} of {unitsTotalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={unitsPage === 1}
                onClick={() => setUnitsPage(unitsPage - 1)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-md bg-[#004bb0] px-3 py-1.5 text-white">
                {unitsPage}
              </button>
              <button
                type="button"
                disabled={unitsPage >= unitsTotalPages}
                onClick={() => setUnitsPage(unitsPage + 1)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      <CategoryModal
        title={modalMode === 'create' ? 'Add New Category' : 'Edit Category'}
        submitLabel={modalMode === 'create' ? 'Create Category' : 'Save Category'}
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        initialData={selectedCategory}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={isSubmitting}
      />

      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        category={selectedCategory}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <UnitModal
        title={unitModalMode === 'create' ? 'Add New Unit' : 'Edit Unit'}
        submitLabel={unitModalMode === 'create' ? 'Create Unit' : 'Save Unit'}
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        initialData={selectedUnit}
        onSubmit={handleCreateOrUpdateUnit}
        isSubmitting={unitSubmitting}
      />

      <DeleteUnitModal
        isOpen={deleteUnitModalOpen}
        onClose={() => setDeleteUnitModalOpen(false)}
        unit={selectedUnit}
        onConfirm={handleDeleteUnit}
        isDeleting={unitDeleting}
      />
    </div>
  )
}
