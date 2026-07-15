import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Building2, ChevronDown, Clock3, Coins, FileText, Save, StickyNote, X } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { createNewCorporateContract, fetchCorporateContractsByAccount } from '../../../../features/corporateContracts/corporateContractSlice'
import { fetchCorporateAccountById, fetchCorporateAccounts } from '../../../../features/corporateAccounts/corporateAccountsSlice'
import { fetchCorporateCancellationPolicies } from '../../../../features/policies/corporateCancellationPoliciesSlice'
import { ContractType } from '../../../../models/CorporateContract'
import type { CreateCorporateContractRequest } from '../../../../models/CorporateContract'
import { appAlert } from '../../../../shared/ui/AppAlert'

interface AddCorporateContractPopupProps {
  accountId: string
  onClose: () => void
}

type ContractFormState = {
  contractNumber: string
  contractType: ContractType
  startDate: string
  endDate: string
  corporateCancellationPolicyId: string
  creditLimit: string
  currency: string
  releaseDaysBefore: string
  notes: string
}

function toDateTimeInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoDateTime(value: string) {
  const date = new Date(value)
  return date.toISOString()
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  return 'Failed to create corporate contract.'
}

export function AddCorporateContractPopup({ accountId, onClose }: AddCorporateContractPopupProps) {
  const dispatch = useAppDispatch()
  const { items: accounts } = useAppSelector((state) => state.corporateAccounts)
  const {
    items: cancellationPolicies,
    status: policiesStatus,
    error: policiesError,
  } = useAppSelector((state) => state.corporateCancellationPolicies)

  const now = useMemo(() => new Date(), [])
  const thirtyDaysLater = useMemo(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), [])
  const [formData, setFormData] = useState<ContractFormState>({
    contractNumber: '',
    contractType: ContractType.Commitment,
    startDate: toDateTimeInputValue(now),
    endDate: toDateTimeInputValue(thirtyDaysLater),
    corporateCancellationPolicyId: '',
    creditLimit: '',
    currency: 'EUR',
    releaseDaysBefore: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedAccount = useMemo(() => accounts.find((item) => item.id === accountId), [accounts, accountId])
  const filteredPolicies = useMemo(
    () => cancellationPolicies.filter((policy) => policy.appliesToContractType === formData.contractType && policy.isActive),
    [cancellationPolicies, formData.contractType]
  )
  const selectedPolicy = useMemo(
    () => filteredPolicies.find((policy) => String(policy.id) === formData.corporateCancellationPolicyId),
    [filteredPolicies, formData.corporateCancellationPolicyId]
  )

  useEffect(() => {
    dispatch(fetchCorporateAccounts())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchCorporateCancellationPolicies({
      ContractType: formData.contractType,
      IsActive: true,
    }))
    setFormData((prev) => ({
      ...prev,
      corporateCancellationPolicyId: '',
      releaseDaysBefore: prev.contractType === ContractType.Commitment ? '' : prev.releaseDaysBefore,
    }))
  }, [dispatch, formData.contractType])

  const updateField = (name: keyof ContractFormState, value: string) => {
    setSubmitError(null)
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'contractType' && value === ContractType.Commitment) {
        next.releaseDaysBefore = ''
      }
      return next
    })
  }

  const validate = () => {
    if (!formData.contractNumber.trim()) return 'Contract number is required.'
    if (!formData.startDate || !formData.endDate) return 'Start date and end date are required.'
    if (new Date(formData.endDate).getTime() <= new Date(formData.startDate).getTime()) {
      return 'End date must be after start date.'
    }
    if (!formData.corporateCancellationPolicyId) return 'Please select a cancellation policy.'
    if (!formData.creditLimit || Number(formData.creditLimit) < 0) return 'Credit limit must be zero or more.'
    if (!formData.currency.trim()) return 'Currency is required.'
    if (formData.contractType === ContractType.Allotment) {
      if (formData.releaseDaysBefore === '' || Number(formData.releaseDaysBefore) < 0) {
        return 'Release days before is required for Allotment contracts.'
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const payload: CreateCorporateContractRequest = {
      corporateAccountId: accountId,
      contractNumber: formData.contractNumber.trim(),
      contractType: formData.contractType,
      startDate: toIsoDateTime(formData.startDate),
      endDate: toIsoDateTime(formData.endDate),
      corporateCancellationPolicyId: Number(formData.corporateCancellationPolicyId),
      creditLimit: Number(formData.creditLimit),
      currency: formData.currency.trim().toUpperCase(),
      releaseDaysBefore: formData.contractType === ContractType.Commitment ? null : Number(formData.releaseDaysBefore),
      notes: formData.notes.trim(),
    }

    try {
      await dispatch(createNewCorporateContract(payload)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(accountId)).unwrap()
      await dispatch(fetchCorporateAccountById(accountId)).unwrap()
      appAlert.fire('Success', 'Corporate contract created successfully.', 'success')
      onClose()
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="flex max-h-[92vh] w-[92vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#004bb4] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Create Corporate Contract</h2>
            <p className="mt-1 text-sm text-blue-100">Create a contract linked to the selected corporate account.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {submitError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="whitespace-pre-line font-medium">{submitError}</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-[#004bb4]" />
                <h3 className="font-semibold">Corporate Account</h3>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{selectedAccount?.companyName ?? 'Selected corporate account'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedAccount?.contactPerson ? `${selectedAccount.contactPerson} • ` : ''}
                  {selectedAccount?.email ?? accountId}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Contract Number *</label>
                <div className="relative">
                  <input
                    value={formData.contractNumber}
                    onChange={(e) => updateField('contractNumber', e.target.value)}
                    placeholder="CONT-2026-001"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                  />
                  <FileText className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Contract Type *</label>
                <div className="relative">
                  <select
                    value={formData.contractType}
                    onChange={(e) => updateField('contractType', e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={ContractType.Commitment}>Commitment</option>
                    <option value={ContractType.Allotment}>Allotment</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">End Date *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Cancellation Policy *</label>
              <div className="relative">
                <select
                  value={formData.corporateCancellationPolicyId}
                  onChange={(e) => updateField('corporateCancellationPolicyId', e.target.value)}
                  disabled={policiesStatus === 'loading' || filteredPolicies.length === 0}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {policiesStatus === 'loading'
                      ? 'Loading policies...'
                      : filteredPolicies.length === 0
                        ? `No active ${formData.contractType} policies`
                        : 'Select cancellation policy'}
                  </option>
                  {filteredPolicies.map((policy) => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} ({policy.code}) - {policy.liquidatedDamagesPenaltyPercentage}%
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {policiesError && <p className="mt-2 text-sm font-medium text-red-600">{policiesError}</p>}
              {selectedPolicy && (
                <p className="mt-2 text-sm text-slate-500">
                  Applies to {selectedPolicy.appliesToContractType}; penalty {selectedPolicy.liquidatedDamagesPenaltyPercentage}%.
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Credit Limit *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => updateField('creditLimit', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                  />
                  <Coins className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="EGP">EGP</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Release Days Before</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formData.releaseDaysBefore}
                    onChange={(e) => updateField('releaseDaysBefore', e.target.value)}
                    disabled={formData.contractType === ContractType.Commitment}
                    placeholder={formData.contractType === ContractType.Commitment ? 'Not used' : '0'}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {formData.contractType === ContractType.Commitment
                    ? 'Commitment contracts submit release days as null.'
                    : 'Allotment contracts require a release window.'}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={4}
                  placeholder="Add internal notes if needed"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-slate-700 outline-none focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100"
                />
                <StickyNote className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-[#004bb4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Create Contract'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
