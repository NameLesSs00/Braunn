import { useState, useEffect } from 'react'
import { motion, type Variants } from 'motion/react'
import { Plus, Search, ChevronDown, Check, AlertCircle, ToggleLeft, ToggleRight, Building2, Edit2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchCorporateCancellationPolicies,
  activateCorporateCancellationPolicy,
  deactivateCorporateCancellationPolicy,
} from '../../features/policies/corporateCancellationPoliciesSlice'
import type { CorporateCancellationPolicy } from '../../models/CorporateCancellationPolicy'
import { PoliciesTabNav } from './components/PoliciesTabNav'
import { AddCorporateCancellationPolicyPopup } from './popups/AddCorporateCancellationPolicyPopup'
import { EditCorporateCancellationPolicyPopup } from './popups/EditCorporateCancellationPolicyPopup'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

export function CorporateCancellationPoliciesPage() {
  const dispatch = useAppDispatch()
  const { items: policies, status } = useAppSelector(s => s.corporateCancellationPolicies)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<CorporateCancellationPolicy | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contractTypeFilter, setContractTypeFilter] = useState<'All' | 'Allotment' | 'Commitment'>('All')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCorporateCancellationPolicies())
    }
  }, [dispatch, status])

  const handleToggle = async (id: number, isActive: boolean) => {
    setTogglingId(id)
    try {
      if (isActive) {
        await dispatch(deactivateCorporateCancellationPolicy(id)).unwrap()
      } else {
        await dispatch(activateCorporateCancellationPolicy(id)).unwrap()
      }
    } finally {
      setTogglingId(null)
    }
  }

  const filteredPolicies = policies.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    const matchesContract = contractTypeFilter === 'All' || p.appliesToContractType === contractTypeFilter
    return matchesSearch && matchesContract
  })

  return (
    <div className="flex flex-col gap-0">
      {/* Tab Navigation — styled exactly like ReportTabs / Reservations tabs */}
      <PoliciesTabNav />

      <motion.div
        className="flex flex-col gap-5 mt-5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Toolbar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: search + filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by code or name..."
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 pr-10 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:border-[#004bb4] transition-all shadow-sm placeholder:text-slate-400 text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={contractTypeFilter}
                onChange={e => setContractTypeFilter(e.target.value as any)}
                className="bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:border-[#004bb4] transition-all shadow-sm cursor-pointer text-sm w-full sm:w-52"
              >
                <option value="All">All Contract Types</option>
                <option value="Allotment">Allotment</option>
                <option value="Commitment">Commitment</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right: Add button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-[#003d99] transition-colors font-semibold shadow-sm text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Policy
          </button>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {status === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="animate-spin h-8 w-8 mb-4 text-[#004bb4]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-medium">Loading policies...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Policy</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Contract Type</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Effective Dates</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Penalty</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPolicies.length > 0 ? (
                    filteredPolicies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-slate-50/60 transition-colors bg-white group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#004bb4]/10 text-[#004bb4] text-[12px] font-bold tracking-wide border border-[#004bb4]/10">
                              {policy.code}
                            </span>
                            <span className="font-semibold text-slate-800 text-sm">{policy.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                            <Building2 className="w-3.5 h-3.5" />
                            {policy.appliesToContractType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-[13px] font-medium text-slate-600">
                            {policy.effectiveFrom ? new Date(policy.effectiveFrom).toLocaleDateString() : '—'}
                            <span className="text-slate-400 mx-1.5">→</span>
                            {policy.effectiveTo ? new Date(policy.effectiveTo).toLocaleDateString() : 'Open ended'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-800 text-sm">{policy.liquidatedDamagesPenaltyPercentage}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {policy.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                              <AlertCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit */}
                            <button
                              onClick={() => setEditingPolicy(policy)}
                              title="Edit policy"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>

                            {/* Toggle */}
                            <button
                              onClick={() => handleToggle(policy.id, policy.isActive)}
                              disabled={togglingId === policy.id}
                              title={policy.isActive ? 'Deactivate' : 'Activate'}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                                policy.isActive
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {togglingId === policy.id ? (
                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : policy.isActive ? (
                                <ToggleLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ToggleRight className="w-3.5 h-3.5" />
                              )}
                              {policy.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-[15px] text-slate-700">No corporate cancellation policies found</p>
                            <p className="text-sm mt-1">Try adjusting your search filters or create a new policy.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Popups */}
      {isAddOpen && <AddCorporateCancellationPolicyPopup onClose={() => setIsAddOpen(false)} />}
      {editingPolicy && <EditCorporateCancellationPolicyPopup policy={editingPolicy} onClose={() => setEditingPolicy(null)} />}
    </div>
  )
}
