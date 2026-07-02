import { useEffect, useMemo, useState } from 'react'
import { X, Building2, FileText, CalendarDays, Percent, Coins, StickyNote, ChevronDown, Save, Clock3 } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { createNewCorporateContract, fetchCorporateContractsByAccount } from '../../../../features/corporateContracts/corporateContractSlice'
import { fetchCorporateAccounts } from '../../../../features/corporateAccounts/corporateAccountsSlice'
import { BillingCycle, ContractStatus, ContractType, RateCalculationMethod } from '../../../../models/CorporateContract'
import type { CreateCorporateContractRequest } from '../../../../models/CorporateContract'
import Swal from 'sweetalert2'

interface AddCorporateContractPopupProps {
  accountId: string
  onClose: () => void
}

function toDateTimeInputValue(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoDateTime(value: string) {
  const date = new Date(value)
  return date.toISOString()
}

export function AddCorporateContractPopup({ accountId, onClose }: AddCorporateContractPopupProps) {
  const dispatch = useAppDispatch()
  const { items: accounts } = useAppSelector((state) => state.corporateAccounts)

  useEffect(() => {
    dispatch(fetchCorporateAccounts())
  }, [dispatch])

  const [formData, setFormData] = useState<CreateCorporateContractRequest & { contractStatus?: ContractStatus }>({
    corporateAccountId: accountId,
    contractNumber: '',
    contractType: ContractType.Allotment,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancellationPolicy: '',
    penaltyPercentage: 0,
    depositAmount: 0,
    currency: 'EUR',
    releaseDaysBefore: 0,
    billingCycle: BillingCycle.MonthlyInvoice,
    rateCalculationMethod: RateCalculationMethod.Fixed,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedAccount = useMemo(() => accounts.find((item) => item.id === formData.corporateAccountId), [accounts, formData.corporateAccountId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let finalValue: string | number = value

    if (type === 'number') {
      finalValue = value ? Number(value) : 0
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async () => {
    if (!formData.corporateAccountId || !formData.contractNumber || !formData.startDate || !formData.endDate) {
      Swal.fire('Error', 'Please fill in the required contract fields.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateCorporateContractRequest = {
        ...formData,
        contractStatus: ContractStatus.Draft,
        contractType: formData.contractType,
        releaseDaysBefore: formData.contractType === ContractType.Commitment ? null : Number(formData.releaseDaysBefore || 0),
        startDate: toIsoDateTime(formData.startDate),
        endDate: toIsoDateTime(formData.endDate),
        notes: formData.notes || '',
      }

      await dispatch(createNewCorporateContract(payload)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(accountId))
      Swal.fire('Success', 'Corporate contract created successfully.', 'success')
      onClose()
    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to create corporate contract.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between rounded-t-2xl bg-[#004bb4] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Create Corporate Contract</h2>
            <p className="mt-1 text-sm text-blue-100">Add a new contract for this corporate account</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-[#004bb4]" />
                <h3 className="font-semibold">Corporate Account</h3>
              </div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Account</label>
              <div className="relative">
                <select
                  name="corporateAccountId"
                  value={formData.corporateAccountId}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none ring-0"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.companyName} — {account.contactPerson}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {selectedAccount && (
                <p className="mt-2 text-sm text-slate-500">Selected account: {selectedAccount.companyName}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Contract Number *</label>
                <input
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleInputChange}
                  placeholder="CONT1234"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Contract Type</label>
                <div className="relative">
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none ring-0"
                  >
                    <option value={ContractType.Allotment}>Allotment</option>
                    <option value={ContractType.Commitment}>Commitment</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={toDateTimeInputValue(formData.startDate)}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={toDateTimeInputValue(formData.endDate)}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Billing Cycle</label>
                <div className="relative">
                  <select
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none ring-0"
                  >
                    <option value={BillingCycle.MonthlyInvoice}>Monthly Invoice</option>
                    <option value={BillingCycle.PerReservation}>Per Reservation</option>
                    <option value={BillingCycle.Cash}>Cash</option>
                    <option value={BillingCycle.CreditBilling}>Credit Billing</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Rate Calculation Method</label>
                <div className="relative">
                  <select
                    name="rateCalculationMethod"
                    value={formData.rateCalculationMethod}
                    onChange={handleInputChange}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-700 outline-none ring-0"
                  >
                    <option value={RateCalculationMethod.Fixed}>Fixed</option>
                    <option value={RateCalculationMethod.PercentageDiscount}>Percentage Discount</option>
                    <option value={RateCalculationMethod.Dynamic}>Dynamic</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {formData.contractType === ContractType.Allotment && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Release Days Before</label>
                <div className="relative">
                  <input
                    type="number"
                    name="releaseDaysBefore"
                    min="0"
                    value={formData.releaseDaysBefore ?? ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                  />
                  <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Deposit Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    name="depositAmount"
                    min="0"
                    value={formData.depositAmount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                  />
                  <Coins className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Currency</label>
                <input
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="EUR"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Penalty %</label>
                <div className="relative">
                  <input
                    type="number"
                    name="penaltyPercentage"
                    min="0"
                    value={formData.penaltyPercentage}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
                  />
                  <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Cancellation Policy</label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter cancellation policy"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add internal notes if needed"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none ring-0"
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
