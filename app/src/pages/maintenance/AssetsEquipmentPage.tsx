import { useMemo, useState } from 'react'
import { FiAlertTriangle, FiChevronDown, FiChevronRight, FiCircle, FiPlus, FiSearch, FiTriangle, FiX } from 'react-icons/fi'
import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'

type AssetRow = {
  name: string
  location: string
  warranty: string
  nextService: string
  condition: 'Good' | 'Fair' | 'Poor'
  status: 'Operational' | 'In Maintenance' | 'Out of Service'
  code: string
}

const assetRows: AssetRow[] = [
  {
    name: 'HVAC Unit — Floor 4',
    location: 'Floor 4 Mechanical Room',
    warranty: 'Jun 15, 2024',
    nextService: 'Jun 10, 2024',
    condition: 'Good',
    status: 'Operational',
    code: 'HVAC · HVAC-4F-2019-007',
  },
  {
    name: 'Commercial Elevator — Unit 2',
    location: 'Lobby East Tower',
    warranty: 'Aug 05, 2024',
    nextService: 'Jun 12, 2024',
    condition: 'Good',
    status: 'In Maintenance',
    code: 'ELV · ELV-2-2022-017',
  },
]

const alertTags = [
  'HVAC Unit — Floor 4 — Service overdue',
  'Commercial Elevator — Unit 2 — Service overdue',
  'Pool Circulation Pump — Service overdue',
  'Commercial Dishwasher — Service overdue',
  'Generator — Backup Unit — Service overdue',
  'Chiller Unit — Central — Service overdue',
]

function StatusBadge({ status }: { status: AssetRow['status'] }) {
  if (status === 'Operational') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-[12px] font-semibold text-white">
        <FiCircle className="h-2.5 w-2.5 fill-current" />
        Operational
      </span>
    )
  }

  if (status === 'In Maintenance') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-700">
        <FiCircle className="h-2.5 w-2.5 fill-current" />
        In Maintenance
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-[12px] font-semibold text-rose-700">
      <FiCircle className="h-2.5 w-2.5 fill-current" />
      Out of Service
    </span>
  )
}

function ConditionPill({ condition }: { condition: AssetRow['condition'] }) {
  const tone =
    condition === 'Good'
      ? 'border-sky-200 bg-sky-50 text-sky-600'
      : condition === 'Fair'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-600'

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${tone}`}>{condition}</span>
}

function AddAssetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[680px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-[#004bb0] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[22px] font-bold">Add New Asset</div>
              <div className="text-[13px] text-blue-100">Register a new piece of equipment or machinery</div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-white hover:bg-white/15" aria-label="Close">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Asset Name *</span>
              <input placeholder="e.g. HVAC Unit — Floor 5" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Location *</span>
              <input placeholder="e.g. Floor 5 Mechanical Room" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Asset Value ($)</span>
              <input type="number" defaultValue={0} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Model</span>
              <input placeholder="e.g. 50XC-D" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Warranty Expiry</span>
              <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
          </div>

          <div className="space-y-3">
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Category *</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]">
                <option>select category</option>
                <option>HVAC</option>
                <option>Electrical</option>
              </select>
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Serial Number *</span>
              <input placeholder="e.g. HVAC-5F-2024-001" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Manufacturer</span>
              <input placeholder="e.g. Carrier" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Purchase Date</span>
              <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Initial Condition</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]">
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
              <span>Notes</span>
              <textarea rows={4} placeholder="Any relevant notes about this asset..." className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700">
            Cancel
          </button>
          <button type="button" className="rounded-lg bg-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-500" disabled>
            Add Asset
          </button>
        </div>
      </div>
    </div>
  )
}

function EditStatusModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-[#004bb0] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[20px] font-bold">Edit Asset Status</div>
              <div className="text-[12px] text-blue-100">HVAC Unit — Floor 4</div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-white hover:bg-white/15" aria-label="Close">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
            <span>Operational Status</span>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]">
              <option>Operational</option>
              <option>In Maintenance</option>
              <option>Out of Service</option>
            </select>
          </label>

          <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
            <span>Physical Condition</span>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]">
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </label>

          <label className="block space-y-1 text-[13px] font-semibold text-slate-700">
            <span>Notes</span>
            <textarea rows={3} placeholder="Any additional notes..." className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004bb0]" />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 bg-slate-50 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700">
            Cancel
          </button>
          <button type="button" className="rounded-lg bg-[#004bb0] px-4 py-2 text-[13px] font-semibold text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export function AssetsEquipmentPage() {
  const [search, setSearch] = useState('')
  const [assetFilter, setAssetFilter] = useState('All Assets')
  const [statusFilter, setStatusFilter] = useState('All status')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditStatus, setShowEditStatus] = useState(false)

  const filteredAssets = useMemo(() => {
    return assetRows.filter((asset) => {
      const query = `${asset.name} ${asset.location} ${asset.code}`.toLowerCase()
      const matchesQuery = query.includes(search.toLowerCase())
      const matchesAsset = assetFilter === 'All Assets' || asset.name.includes(assetFilter)
      const matchesStatus = statusFilter === 'All status' || asset.status === statusFilter
      return matchesQuery && matchesAsset && matchesStatus
    })
  }, [assetFilter, search, statusFilter])

  return (
    <div className="space-y-6">
      <MaintenanceHeader NameMaintenance="Assets & Equipments" />

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-[20px] font-bold text-slate-800">Assets & Equipment</div>
          <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-lg bg-[#004bb0] px-4 py-2 text-sm font-semibold text-white">
            <FiPlus className="h-4 w-4" />
            Add Asset
          </button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-[#fffbeb] p-4">
          <div className="mb-3 flex items-center gap-2 text-[14px] font-bold text-amber-700">
            <FiAlertTriangle className="h-4 w-4" />
            6 assets need attention
          </div>
          <div className="flex flex-wrap gap-2">
            {alertTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200">
                <FiTriangle className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <div className="text-[30px] font-bold text-emerald-600">5</div>
            <div className="text-[13px] font-semibold text-emerald-700">Operational</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <div className="text-[30px] font-bold text-amber-600">1</div>
            <div className="text-[13px] font-semibold text-amber-700">In Maintenance</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <div className="text-[30px] font-bold text-rose-600">0</div>
            <div className="text-[13px] font-semibold text-rose-700">Out of Service</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-[360px]">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name ,category ..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#004bb0]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-[180px]">
              <select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[#004bb0]">
                <option>All Assets</option>
                <option>HVAC Unit</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative w-[180px]">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[#004bb0]">
                <option>All status</option>
                <option>Operational</option>
                <option>In Maintenance</option>
                <option>Out of Service</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-50">
              <tr>
                {['ASSET', 'LOCATION', 'WARRANTY', 'NEXT SERVICE', 'CONDITION', 'STATUS'].map((column) => (
                  <th key={column} className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.name} className="border-t border-slate-200 bg-white">
                  <td className="px-4 py-4">
                    <div className="text-[14px] font-bold text-slate-800">{asset.name}</div>
                    <div className="text-[12px] text-slate-500">{asset.code}</div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-700">{asset.location}</td>
                  <td className="px-4 py-4 text-[13px] text-amber-700">⚠ {asset.warranty}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-rose-600">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      {asset.nextService}
                    </div>
                  </td>
                  <td className="px-4 py-4"><ConditionPill condition={asset.condition} /></td>
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => setShowEditStatus(true)} className="flex items-center gap-2">
                      <StatusBadge status={asset.status} />
                      <FiChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AddAssetModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditStatusModal isOpen={showEditStatus} onClose={() => setShowEditStatus(false)} />
    </div>
  )
}
