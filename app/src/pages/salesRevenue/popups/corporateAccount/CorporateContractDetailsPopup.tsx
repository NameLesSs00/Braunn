import { useEffect, useMemo, useState } from 'react'
import { X, Package2, Plus, BadgePercent, Coins, CalendarDays, StickyNote, AlertCircle, FileText, Wallet, PencilLine, Trash2, Tag, TrendingDown, Receipt, Star, UtensilsCrossed, Wrench } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { addPackageToContract, removePackageFromContract, fetchCorporateContractById, fetchCorporateContractsByAccount, updateCorporateContractAction } from '../../../../features/corporateContracts/corporateContractSlice'
import { fetchPackages } from '../../../../features/packages/packagesSlice'
import { fetchMealPlans } from '../../../../features/admin/mealPlansSlice'
import { fetchAdditionalServices } from '../../../../features/admin/additionalServicesSlice'
import { fetchCorporateCancellationPolicies } from '../../../../features/policies/corporateCancellationPoliciesSlice'
import { ContractType, type CorporateContract } from '../../../../models/CorporateContract'
import { ConfirmActionModal } from '../../../../shared/ui/ConfirmActionModal'
import { appAlert } from '../../../../shared/ui/AppAlert'

interface CorporateContractDetailsPopupProps {
  contract: CorporateContract
  onClose: () => void
}

type TabKey = 'Overview' | 'Packages' | 'Rates' | 'Discounts'

export function CorporateContractDetailsPopup({ contract, onClose }: CorporateContractDetailsPopupProps) {
  const dispatch = useAppDispatch()
  const { packages, status: packagesStatus } = useAppSelector((state) => state.packages)
  const { items: mealPlans } = useAppSelector((state) => state.mealPlans)
  const { items: additionalServices } = useAppSelector((state) => state.additionalServices)
  const { items: cancellationPolicies, status: policiesStatus } = useAppSelector((state) => state.corporateCancellationPolicies)
  const selectedContractFromStore = useAppSelector((state) => state.corporateContract.selected?.id === contract.id ? state.corporateContract.selected : undefined)
  const activeContract = selectedContractFromStore ?? contract
  const contractStatus = activeContract.status ?? activeContract.contractStatus ?? '---'
  const activeCreditLimit = activeContract.creditLimit ?? activeContract.credit?.creditLimit ?? 0
  const [activeTab, setActiveTab] = useState<TabKey>('Overview')
  const [isAddingPackage, setIsAddingPackage] = useState(false)
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false)
  const [isSavingContract, setIsSavingContract] = useState(false)
  const [isEditContractOpen, setIsEditContractOpen] = useState(false)
  const [packageRemovalTarget, setPackageRemovalTarget] = useState<{ id: string; name: string } | null>(null)
  const [isRemovingPackage, setIsRemovingPackage] = useState(false)
  const [packageRemovalError, setPackageRemovalError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    corporateCancellationPolicyId: String(activeContract.corporateCancellationPolicy?.id ?? activeContract.corporateCancellationPolicyId ?? ''),
    creditLimit: String(activeCreditLimit),
    releaseDaysBefore: String(activeContract.releaseDaysBefore ?? ''),
    startDate: activeContract.startDate ? new Date(activeContract.startDate).toISOString().slice(0, 16) : '',
    endDate: activeContract.endDate ? new Date(activeContract.endDate).toISOString().slice(0, 16) : '',
    currency: activeContract.currency,
    notes: activeContract.notes,
  })
  const [newPackageForm, setNewPackageForm] = useState({
    packageId: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  useEffect(() => {
    dispatch(fetchPackages())
    dispatch(fetchMealPlans())
    dispatch(fetchAdditionalServices())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchCorporateCancellationPolicies({
      ContractType: activeContract.contractType,
      IsActive: true,
    }))
  }, [dispatch, activeContract.contractType])

  useEffect(() => {
    setEditForm({
      corporateCancellationPolicyId: String(activeContract.corporateCancellationPolicy?.id ?? activeContract.corporateCancellationPolicyId ?? ''),
      creditLimit: String(activeCreditLimit),
      releaseDaysBefore: String(activeContract.releaseDaysBefore ?? ''),
      startDate: activeContract.startDate ? new Date(activeContract.startDate).toISOString().slice(0, 16) : '',
      endDate: activeContract.endDate ? new Date(activeContract.endDate).toISOString().slice(0, 16) : '',
      currency: activeContract.currency,
      notes: activeContract.notes,
    })
  }, [activeContract.id, activeCreditLimit])

  const packageLookup = useMemo(() => new Map(packages.map((item) => [item.id, item])), [packages])
  const mealPlanLookup = useMemo(() => new Map(mealPlans.map((m) => [m.id, m])), [mealPlans])
  const serviceLookup = useMemo(() => new Map(additionalServices.map((s) => [s.id, s])), [additionalServices])
  const selectedPackageDetails = useMemo(() => {
    if (!newPackageForm.packageId) return null
    return packages.find((item) => item.id === newPackageForm.packageId) ?? null
  }, [newPackageForm.packageId, packages])
  const filteredCancellationPolicies = useMemo(
    () => cancellationPolicies.filter((policy) => policy.appliesToContractType === activeContract.contractType && policy.isActive),
    [cancellationPolicies, activeContract.contractType]
  )

  const handleSaveContract = async () => {
    if (!editForm.startDate || !editForm.endDate) {
      appAlert.fire('Error', 'Start date and end date are required.', 'error')
      return
    }
    if (new Date(editForm.endDate).getTime() <= new Date(editForm.startDate).getTime()) {
      appAlert.fire('Error', 'End date must be after start date.', 'error')
      return
    }
    if (!editForm.corporateCancellationPolicyId) {
      appAlert.fire('Error', 'Please select a cancellation policy.', 'error')
      return
    }
    if (!editForm.creditLimit || Number(editForm.creditLimit) < 0) {
      appAlert.fire('Error', 'Credit limit must be zero or more.', 'error')
      return
    }
    if (activeContract.contractType === ContractType.Allotment && (editForm.releaseDaysBefore === '' || Number(editForm.releaseDaysBefore) < 0)) {
      appAlert.fire('Error', 'Release days before is required for Allotment contracts.', 'error')
      return
    }

    setIsSavingContract(true)

    try {
      await dispatch(updateCorporateContractAction({
        id: activeContract.id,
        payload: {
          startDate: new Date(editForm.startDate).toISOString(),
          endDate: new Date(editForm.endDate).toISOString(),
          corporateCancellationPolicyId: Number(editForm.corporateCancellationPolicyId),
          creditLimit: Number(editForm.creditLimit),
          currency: editForm.currency.trim().toUpperCase(),
          releaseDaysBefore: activeContract.contractType === ContractType.Commitment ? null : Number(editForm.releaseDaysBefore),
          notes: editForm.notes,
        },
      })).unwrap()

      await dispatch(fetchCorporateContractById(activeContract.id)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(activeContract.corporateAccountId)).unwrap()

      appAlert.fire('Success', 'Contract updated successfully.', 'success')
      setIsEditContractOpen(false)
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not update contract.', 'error')
    } finally {
      setIsSavingContract(false)
    }
  }

  const handleAddPackage = async () => {
    if (!newPackageForm.packageId || !newPackageForm.startDate || !newPackageForm.endDate) {
      appAlert.fire('Error', 'Please choose a package and date range.', 'error')
      return
    }

    setIsSubmittingPackage(true)

    try {
      await dispatch(addPackageToContract({
        contractId: activeContract.id,
        payload: {
          packageId: newPackageForm.packageId,
          startDate: new Date(newPackageForm.startDate).toISOString(),
          endDate: new Date(newPackageForm.endDate).toISOString(),
          notes: newPackageForm.notes,
        },
      })).unwrap()

      await dispatch(fetchCorporateContractById(activeContract.id)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(activeContract.corporateAccountId)).unwrap()

      appAlert.fire('Success', 'Package added to contract.', 'success')
      setIsAddingPackage(false)
      setNewPackageForm({ packageId: '', startDate: '', endDate: '', notes: '' })
      setActiveTab('Packages')
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not add package.', 'error')
    } finally {
      setIsSubmittingPackage(false)
    }
  }

  const requestDeletePackage = (contractPackageId: string, packageName: string) => {
    setPackageRemovalTarget({ id: contractPackageId, name: packageName })
    setPackageRemovalError(null)
  }

  const handleDeletePackage = async () => {
    if (!packageRemovalTarget) return
    setIsRemovingPackage(true)
    setPackageRemovalError(null)
    try {
      await dispatch(removePackageFromContract({
        contractId: activeContract.id,
        contractPackageId: packageRemovalTarget.id,
      })).unwrap()

      await dispatch(fetchCorporateContractById(activeContract.id)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(activeContract.corporateAccountId)).unwrap()

      setPackageRemovalTarget(null)
    } catch (err: any) {
      setPackageRemovalError(err?.message || 'Could not remove package.')
    } finally {
      setIsRemovingPackage(false)
    }
  }

  const tabs: TabKey[] = ['Overview', 'Packages', 'Rates', 'Discounts']

  return (
    <>
    <Modal open onClose={onClose} lockScroll>
      <div className="flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#004bb4] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">{activeContract.contractNumber}</h2>
            <p className="mt-1 text-sm text-blue-100">{activeContract.contractType} • {activeContract.currency} • {contractStatus}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Coins className="h-4 w-4 text-[#004bb4]" />
            <span>Credit limit: {activeCreditLimit.toLocaleString()} {activeContract.currency}</span>
            <span className="text-slate-300">•</span>
            <span>Period: {new Date(activeContract.startDate).toLocaleDateString()} - {new Date(activeContract.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-slate-200 px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-[#004bb4] text-[#004bb4]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setIsEditContractOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit Contract
                </button>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <FileText className="h-5 w-5 text-[#004bb4]" />
                    <h3 className="text-lg font-semibold">Contract Summary</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contract Number</p>
                      <p className="mt-1 font-semibold text-slate-800">{activeContract.contractNumber}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contract Type</p>
                      <p className="mt-1 font-semibold text-slate-800">{activeContract.contractType}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                      <p className="mt-1 font-semibold text-slate-800">{contractStatus}</p>
                    </div>
                    {activeContract.contractType === ContractType.Allotment && (
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Release Days Before</p>
                        <p className="mt-1 font-semibold text-slate-800">{activeContract.releaseDaysBefore ?? 0}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <Wallet className="h-5 w-5 text-[#004bb4]" />
                    <h3 className="text-lg font-semibold">Financial Terms</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Credit Limit</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">{activeCreditLimit.toLocaleString()} {activeContract.currency}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remaining Credit</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">{(activeContract.credit?.remainingCredit ?? activeCreditLimit).toLocaleString()} {activeContract.currency}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cancellation Penalty</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">{activeContract.corporateCancellationPolicy?.liquidatedDamagesPenaltyPercentage ?? '---'}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <CalendarDays className="h-5 w-5 text-[#004bb4]" />
                    <h3 className="text-lg font-semibold">Contract Dates</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{new Date(activeContract.startDate).toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">End Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{new Date(activeContract.endDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <StickyNote className="h-5 w-5 text-[#004bb4]" />
                    <h3 className="text-lg font-semibold">Notes & Policy</h3>
                  </div>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cancellation Policy</p>
                      <p className="mt-1 leading-6">{activeContract.corporateCancellationPolicy?.name ?? activeContract.cancellationPolicy ?? 'No cancellation policy provided.'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Internal Notes</p>
                      <p className="mt-1 leading-6">{activeContract.notes || 'No notes provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Packages' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Assigned Packages</h3>
                  <p className="text-sm text-slate-500">Manage package inclusions for this contract.</p>
                </div>
                <button
                  onClick={() => setIsAddingPackage((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-[#004bb4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Package
                </button>
              </div>

              {isAddingPackage && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Package</label>
                      <select
                        value={newPackageForm.packageId}
                        onChange={(e) => setNewPackageForm((prev) => ({ ...prev, packageId: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
                      >
                        <option value="">Select package</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                        ))}
                      </select>
                      {packagesStatus === 'loading' && <p className="mt-2 text-sm text-slate-500">Loading available packages…</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Package Preview</label>
                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                        {selectedPackageDetails ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800">{selectedPackageDetails.name}</p>
                            <p>{selectedPackageDetails.code}</p>
                            <p>{selectedPackageDetails.currencyCode} • {selectedPackageDetails.baseNightPrice} / night</p>
                          </div>
                        ) : (
                          <p className="text-slate-500">Select a package to preview its details.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
                      <input
                        type="datetime-local"
                        value={newPackageForm.startDate}
                        onChange={(e) => setNewPackageForm((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
                      <input
                        type="datetime-local"
                        value={newPackageForm.endDate}
                        onChange={(e) => setNewPackageForm((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
                    <textarea
                      value={newPackageForm.notes}
                      onChange={(e) => setNewPackageForm((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
                      placeholder="Optional package notes"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setIsAddingPackage(false)}
                      disabled={isSubmittingPackage}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPackage}
                      disabled={isSubmittingPackage}
                      className="rounded-xl bg-[#004bb4] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmittingPackage ? 'Saving...' : 'Save Package'}
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const activePackages = activeContract.packages.filter((pkg) => pkg.isActive);

                if (activePackages.length === 0) {
                  return (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                      <Package2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                      <p className="font-medium">No active packages assigned yet.</p>
                      <p className="mt-1 text-sm">Click "Add Package" to assign one to this contract.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {activePackages.map((pkg) => {
                      const details = packageLookup.get(pkg.packageId)
                    const currency = details?.currencyCode || activeContract.currency
                    return (
                      <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#004bb4]/5 to-blue-50 px-6 py-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004bb4] text-white shadow-sm">
                              <Package2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-slate-800">{details?.name || 'Package'}</h4>
                                {details?.code && (
                                  <span className="rounded-md bg-[#004bb4]/10 px-2 py-0.5 text-xs font-semibold text-[#004bb4]">{details.code}</span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-slate-500">{details?.description || 'No description available.'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pkg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => requestDeletePackage(pkg.id, details?.name || 'this package')}
                              title="Remove package from contract"
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-5">
                          {/* Assignment Period */}
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rate Plan</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{details?.ratePlanCode || '—'}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Package Valid</p>
                              <p className="mt-1 text-xs font-semibold text-slate-800">
                                {details?.startDate ? new Date(details.startDate).toLocaleDateString() : '—'} → {details?.endDate ? new Date(details.endDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Period</p>
                              <p className="mt-1 text-xs font-semibold text-slate-800">
                                {pkg.startDate ? new Date(pkg.startDate).toLocaleDateString() : '—'} → {pkg.endDate ? new Date(pkg.endDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned At</p>
                              <p className="mt-1 text-xs font-semibold text-slate-800">{pkg.assignedAt ? new Date(pkg.assignedAt).toLocaleDateString() : '—'}</p>
                            </div>
                          </div>

                          {/* Pricing Breakdown */}
                          {details && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pricing Breakdown</p>

                              {/* Summary row */}
                              <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0">
                                  <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                      <Tag className="h-3.5 w-3.5" />
                                      <p className="text-xs font-semibold uppercase tracking-wide">Base/Night</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{details.baseNightPrice} {currency}</p>
                                  </div>
                                  <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                      <UtensilsCrossed className="h-3.5 w-3.5" />
                                      <p className="text-xs font-semibold uppercase tracking-wide">Meals/Night</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{details.mealTotalPerNight} {currency}</p>
                                  </div>
                                  <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                      <Wrench className="h-3.5 w-3.5" />
                                      <p className="text-xs font-semibold uppercase tracking-wide">Services/Night</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{details.serviceTotalPerNight} {currency}</p>
                                  </div>
                                  <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                      <Receipt className="h-3.5 w-3.5" />
                                      <p className="text-xs font-semibold uppercase tracking-wide">Tax {details.taxPercentage}%</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">+{details.taxAmount?.toFixed(2)} {currency}</p>
                                  </div>
                                  <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                      <TrendingDown className="h-3.5 w-3.5" />
                                      <p className="text-xs font-semibold uppercase tracking-wide">Discount {details.discountPercentage}%</p>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600">-{details.discountAmount?.toFixed(2)} {currency}</p>
                                  </div>
                                  <div className="p-3 text-center bg-[#004bb4]/5">
                                    <div className="flex items-center justify-center gap-1 text-[#004bb4] mb-1">
                                      <Star className="h-3.5 w-3.5" />
                                      <p className="text-xs font-bold uppercase tracking-wide">Final/Night</p>
                                    </div>
                                    <p className="text-sm font-bold text-[#004bb4]">{details.finalNightPrice?.toFixed(2)} {currency}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Meal plans breakdown */}
                              {details.mealRates && details.mealRates.length > 0 && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                                    <UtensilsCrossed className="h-4 w-4 text-[#004bb4]" />
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Included Meal Plans</p>
                                  </div>
                                  <div className="divide-y divide-slate-100">
                                    {details.mealRates.map((mr, i) => {
                                      const meal = mealPlanLookup.get(mr.mealPlanId)
                                      return (
                                        <div key={i} className="flex items-center justify-between px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-[#004bb4]">{i + 1}</span>
                                            <span className="text-sm font-medium text-slate-800">
                                              {meal ? `${meal.name}${meal.code ? ` (${meal.code})` : ''}` : `Meal Plan ${mr.mealPlanId.slice(0, 8)}…`}
                                            </span>
                                          </div>
                                          <span className="text-sm font-semibold text-slate-700">{mr.pricePerNight} {currency}<span className="ml-1 text-xs text-slate-400">/night</span></span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Services breakdown */}
                              {details.serviceRates && details.serviceRates.length > 0 && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                                    <Wrench className="h-4 w-4 text-[#004bb4]" />
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Included Services</p>
                                  </div>
                                  <div className="divide-y divide-slate-100">
                                    {details.serviceRates.map((sr, i) => {
                                      const svc = serviceLookup.get(sr.additionalServiceId)
                                      return (
                                        <div key={i} className="flex items-center justify-between px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-[#004bb4]">{i + 1}</span>
                                            <span className="text-sm font-medium text-slate-800">
                                              {svc ? svc.name : `Service ${sr.additionalServiceId.slice(0, 8)}…`}
                                            </span>
                                          </div>
                                          <span className="text-sm font-semibold text-slate-700">{sr.pricePerNight} {currency}<span className="ml-1 text-xs text-slate-400">/night</span></span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}


                          {/* Extras + Rates counts */}
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {details && (
                              <>
                                <div className="rounded-xl bg-slate-50 p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Adult Extra</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">{details.adultExtraPrice} {currency}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Child Extra</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-800">{details.childExtraPrice} {currency}</p>
                                </div>
                              </>
                            )}
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room Rates</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{details?.roomRates?.length ?? 0} type(s)</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Meal Rates</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{details?.mealRates?.length ?? 0} plan(s)</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Service Rates</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{details?.serviceRates?.length ?? 0} service(s)</p>
                            </div>
                          </div>

                          {/* Assignment Notes */}
                          {pkg.notes && (
                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Assignment Notes</p>
                              <p className="mt-1.5 text-sm leading-6 text-slate-700">{pkg.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'Rates' && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <BadgePercent className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-800">Rates are coming soon</h3>
              <p className="mt-2 text-sm text-slate-500">The rates section will be wired once the backend endpoints are ready.</p>
            </div>
          )}

          {activeTab === 'Discounts' && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-800">Discounts are coming soon</h3>
              <p className="mt-2 text-sm text-slate-500">The discounts section will be completed when the API is available.</p>
            </div>
          )}
        </div>
      </div>

      {isEditContractOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between rounded-t-2xl bg-[#004bb4] px-6 py-5 text-white">
                <div>
                  <h2 className="text-xl font-bold">Edit Contract</h2>
                  <p className="mt-1 text-sm text-blue-100">Update the contract details for {activeContract.contractNumber}</p>
                </div>
                <button onClick={() => setIsEditContractOpen(false)} className="rounded-lg p-2 transition-colors hover:bg-white/20">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contract Number</p>
                    <p className="mt-1 font-semibold text-slate-800">{activeContract.contractNumber}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contract Type</p>
                    <p className="mt-1 font-semibold text-slate-800">{activeContract.contractType}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
                    <input
                      type="datetime-local"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
                    <input
                      type="datetime-local"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Cancellation Policy</label>
                  <select
                    value={editForm.corporateCancellationPolicyId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, corporateCancellationPolicyId: e.target.value }))}
                    disabled={policiesStatus === 'loading' || filteredCancellationPolicies.length === 0}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {policiesStatus === 'loading'
                        ? 'Loading policies...'
                        : filteredCancellationPolicies.length === 0
                          ? `No active ${activeContract.contractType} policies`
                          : 'Select cancellation policy'}
                    </option>
                    {filteredCancellationPolicies.map((policy) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.name} ({policy.code}) - {policy.liquidatedDamagesPenaltyPercentage}%
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Credit Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.creditLimit}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, creditLimit: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Currency</label>
                    <select
                      value={editForm.currency}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="EGP">EGP</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Release Days Before</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.releaseDaysBefore}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, releaseDaysBefore: e.target.value }))}
                      disabled={activeContract.contractType === ContractType.Commitment}
                      placeholder={activeContract.contractType === ContractType.Commitment ? 'Not used' : '0'}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button onClick={() => setIsEditContractOpen(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={handleSaveContract}
                  disabled={isSavingContract}
                  className="rounded-xl bg-[#004bb4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingContract ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
    <ConfirmActionModal
      open={Boolean(packageRemovalTarget)}
      title="Remove Package"
      description={`This will remove "${packageRemovalTarget?.name ?? 'this package'}" from the contract. This action cannot be undone.`}
      confirmLabel="Remove Package"
      variant="danger"
      isLoading={isRemovingPackage}
      error={packageRemovalError}
      onCancel={() => {
        if (isRemovingPackage) return
        setPackageRemovalTarget(null)
        setPackageRemovalError(null)
      }}
      onConfirm={handleDeletePackage}
    />
    </>
  )
}
