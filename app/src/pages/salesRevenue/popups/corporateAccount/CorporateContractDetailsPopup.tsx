import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BadgePercent,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Coins,
  FileText,
  Package2,
  Plus,
  RefreshCw,
  StickyNote,
  Trash2,
  UtensilsCrossed,
  Wrench,
  X,
} from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { ConfirmActionModal } from '../../../../shared/ui/ConfirmActionModal'
import { appAlert } from '../../../../shared/ui/AppAlert'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import {
  addPackageToContract,
  buildCorporateInventoryKey,
  fetchCorporateContractById,
  fetchCorporateContractsByAccount,
  fetchCorporateInventory,
  fetchCorporatePackagesByContract,
  generateCorporateInventory,
  removePackageFromContract,
} from '../../../../features/corporateContracts/corporateContractSlice'
import { fetchMealPlans } from '../../../../features/admin/mealPlansSlice'
import { fetchAdditionalServices } from '../../../../features/admin/additionalServicesSlice'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { fetchRatePlans } from '../../../../features/ratePlans/ratePlansSlice'
import type {
  CorporateContract,
  CorporateContractPackage,
  CorporateInventoryRow,
  CorporatePackageMealRate,
  CorporatePackageRoomRate,
  CorporatePackageServiceRate,
  GenerateCorporateInventoryResponse,
} from '../../../../models/CorporateContract'

interface CorporateContractDetailsPopupProps {
  contract: CorporateContract
  onClose: () => void
}

type TabKey = 'Overview' | 'Packages' | 'Inventory'

type PackageForm = {
  code: string
  name: string
  description: string
  isActive: boolean
  effectiveFrom: string
  effectiveTo: string
  taxPercentage: string
  discountPercentage: string
  currencyCode: string
  adultExtraPrice: string
  childExtraPrice: string
  notes: string
  roomRates: Array<{
    roomTypeId: string
    adults: string
    children: string
    childAges: string
    ratePlanCode: string
    pricePerNight: string
  }>
  mealRates: Array<{
    mealPlanId: string
    pricePerNight: string
  }>
  serviceRates: Array<{
    additionalServiceId: string
    pricePerNight: string
  }>
}

const emptyRoomRate = () => ({
  roomTypeId: '',
  adults: '1',
  children: '0',
  childAges: '',
  ratePlanCode: '',
  pricePerNight: '',
})

const emptyMealRate = () => ({
  mealPlanId: '',
  pricePerNight: '',
})

const emptyServiceRate = () => ({
  additionalServiceId: '',
  pricePerNight: '',
})

const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
const maxInventoryRangeDays = 21

const createInitialForm = (currency = 'EUR'): PackageForm => ({
  code: '',
  name: '',
  description: '',
  isActive: true,
  effectiveFrom: '',
  effectiveTo: '',
  taxPercentage: '0',
  discountPercentage: '0',
  currencyCode: currency || 'EUR',
  adultExtraPrice: '0',
  childExtraPrice: '0',
  notes: '',
  roomRates: [emptyRoomRate()],
  mealRates: [],
  serviceRates: [],
})

function formatDate(value?: string | null) {
  if (!value) return '---'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

function formatMoney(value?: number | null, currency = 'EUR') {
  if (value === null || value === undefined) return '---'
  return `${value.toLocaleString()} ${currency}`
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  parsed.setDate(parsed.getDate() + days)
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function minDate(...dates: Array<string | undefined | null>) {
  return dates.filter(Boolean).sort()[0] ?? ''
}

function clampInventoryRange(fromDate: string, toDate: string, effectiveTo?: string | null) {
  if (!fromDate) return { fromDate, toDate }
  const maxToDate = minDate(addDays(fromDate, maxInventoryRangeDays - 1), effectiveTo?.slice(0, 10))
  let nextToDate = toDate || maxToDate
  if (nextToDate < fromDate) nextToDate = fromDate
  if (maxToDate && nextToDate > maxToDate) nextToDate = maxToDate
  return { fromDate, toDate: nextToDate }
}

function parseChildAges(value: string) {
  if (!value.trim()) return []
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0)
}

function getVersion(pkg: CorporateContractPackage) {
  return pkg.currentVersion ?? pkg.versions?.[0] ?? null
}

export function CorporateContractDetailsPopup({ contract, onClose }: CorporateContractDetailsPopupProps) {
  const dispatch = useAppDispatch()
  const selectedContractFromStore = useAppSelector((state) => state.corporateContract.selected?.id === contract.id ? state.corporateContract.selected : undefined)
  const packagesByContractId = useAppSelector((state) => state.corporateContract.packagesByContractId)
  const packagesStatus = useAppSelector((state) => state.corporateContract.packagesStatus)
  const packagesError = useAppSelector((state) => state.corporateContract.packagesError)
  const inventoryByKey = useAppSelector((state) => state.corporateContract.inventoryByKey)
  const inventoryStatus = useAppSelector((state) => state.corporateContract.inventoryStatus)
  const inventoryError = useAppSelector((state) => state.corporateContract.inventoryError)
  const generateInventoryStatus = useAppSelector((state) => state.corporateContract.generateInventoryStatus)
  const generateInventoryError = useAppSelector((state) => state.corporateContract.generateInventoryError)
  const lastGeneratedInventory = useAppSelector((state) => state.corporateContract.lastGeneratedInventory)
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  const ratePlans = useAppSelector((state) => state.ratePlans.items)
  const mealPlans = useAppSelector((state) => state.mealPlans.items)
  const additionalServices = useAppSelector((state) => state.additionalServices.items)

  const activeContract = selectedContractFromStore ?? contract
  const contractPackages = packagesByContractId[activeContract.id] ?? activeContract.packages ?? []
  const isPackagesLoading = packagesStatus === 'loading'
  const hasContractPackages = contractPackages.length > 0
  const contractStatus = activeContract.status ?? activeContract.contractStatus ?? '---'
  const creditLimit = activeContract.creditLimit ?? activeContract.credit?.creditLimit ?? null
  const [activeTab, setActiveTab] = useState<TabKey>('Overview')
  const [isAddingPackage, setIsAddingPackage] = useState(false)
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false)
  const [packageForm, setPackageForm] = useState<PackageForm>(() => createInitialForm(activeContract.currency))
  const [packageRemovalTarget, setPackageRemovalTarget] = useState<{ id: string; name: string } | null>(null)
  const [isRemovingPackage, setIsRemovingPackage] = useState(false)
  const [packageRemovalError, setPackageRemovalError] = useState<string | null>(null)
  const [selectedInventoryPackageId, setSelectedInventoryPackageId] = useState('')
  const [inventoryRoomAllocations, setInventoryRoomAllocations] = useState<Record<string, string>>({})
  const [inventoryReason, setInventoryReason] = useState('')
  const [inventoryFilters, setInventoryFilters] = useState({
    fromDate: '',
    toDate: '',
    roomTypeId: '',
    onlyAvailable: false,
    onlyAdjusted: false,
  })

  const roomTypeLookup = useMemo(() => new Map(roomTypes.map((item) => [item.id, item])), [roomTypes])
  const mealPlanLookup = useMemo(() => new Map(mealPlans.map((item) => [item.id, item])), [mealPlans])
  const serviceLookup = useMemo(() => new Map(additionalServices.map((item) => [item.id, item])), [additionalServices])
  const selectedInventoryPackage = useMemo(
    () => contractPackages.find((pkg) => pkg.id === selectedInventoryPackageId) ?? contractPackages[0] ?? null,
    [contractPackages, selectedInventoryPackageId]
  )
  const selectedInventoryVersion = selectedInventoryPackage ? getVersion(selectedInventoryPackage) : null
  const selectedInventoryKey = selectedInventoryPackage && selectedInventoryVersion
    ? buildCorporateInventoryKey(activeContract.id, selectedInventoryPackage.id, selectedInventoryVersion.id)
    : ''
  const selectedInventory = selectedInventoryKey ? inventoryByKey[selectedInventoryKey] : undefined
  const inventoryRoomRates = useMemo(() => {
    const rates = selectedInventoryVersion?.roomRates ?? []
    const seen = new Set<string>()
    return rates.filter((rate) => {
      if (seen.has(rate.roomTypeId)) return false
      seen.add(rate.roomTypeId)
      return true
    })
  }, [selectedInventoryVersion])

  useEffect(() => {
    dispatch(fetchCorporateContractById(activeContract.id))
    dispatch(fetchCorporatePackagesByContract({ contractId: activeContract.id }))
    dispatch(fetchRoomTypes())
    dispatch(fetchRatePlans({ isActive: true }))
    dispatch(fetchMealPlans())
    dispatch(fetchAdditionalServices())
  }, [dispatch, activeContract.id])

  useEffect(() => {
    setPackageForm(createInitialForm(activeContract.currency))
  }, [activeContract.id, activeContract.currency])

  useEffect(() => {
    if (selectedInventoryPackageId && contractPackages.some((pkg) => pkg.id === selectedInventoryPackageId)) return
    setSelectedInventoryPackageId(contractPackages[0]?.id ?? '')
  }, [contractPackages, selectedInventoryPackageId])

  useEffect(() => {
    if (!selectedInventoryVersion) {
      setInventoryFilters((prev) => ({ ...prev, fromDate: '', toDate: '' }))
      setInventoryRoomAllocations({})
      return
    }

    setInventoryFilters((prev) => ({
      ...prev,
      ...clampInventoryRange(
        selectedInventoryVersion.effectiveFrom?.slice(0, 10) || '',
        selectedInventoryVersion.effectiveTo?.slice(0, 10) || '',
        selectedInventoryVersion.effectiveTo,
      ),
      roomTypeId: '',
    }))

    setInventoryRoomAllocations((prev) => {
      const next: Record<string, string> = {}
      inventoryRoomRates.forEach((rate) => {
        next[rate.roomTypeId] = prev[rate.roomTypeId] ?? '0'
      })
      return next
    })
  }, [inventoryRoomRates, selectedInventoryVersion])

  useEffect(() => {
    if (activeTab !== 'Inventory' || !selectedInventoryPackage || !selectedInventoryVersion) return

    const request = dispatch(fetchCorporateInventory({
      contractId: activeContract.id,
      params: {
        roomTypeId: inventoryFilters.roomTypeId || undefined,
        fromDate: inventoryFilters.fromDate || selectedInventoryVersion.effectiveFrom?.slice(0, 10),
        toDate: inventoryFilters.toDate || selectedInventoryVersion.effectiveTo?.slice(0, 10) || undefined,
        packageId: selectedInventoryPackage.id,
        versionId: selectedInventoryVersion.id,
        onlyAvailable: inventoryFilters.onlyAvailable,
        onlyAdjusted: inventoryFilters.onlyAdjusted,
      },
    }))

    return () => request.abort()
  }, [
    activeTab,
    activeContract.id,
    dispatch,
    inventoryFilters.fromDate,
    inventoryFilters.onlyAdjusted,
    inventoryFilters.onlyAvailable,
    inventoryFilters.roomTypeId,
    inventoryFilters.toDate,
    selectedInventoryPackage,
    selectedInventoryVersion,
  ])

  const updateRoomRate = (index: number, patch: Partial<PackageForm['roomRates'][number]>) => {
    setPackageForm((prev) => ({
      ...prev,
      roomRates: prev.roomRates.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }))
  }

  const updateMealRate = (index: number, patch: Partial<PackageForm['mealRates'][number]>) => {
    setPackageForm((prev) => ({
      ...prev,
      mealRates: prev.mealRates.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }))
  }

  const updateServiceRate = (index: number, patch: Partial<PackageForm['serviceRates'][number]>) => {
    setPackageForm((prev) => ({
      ...prev,
      serviceRates: prev.serviceRates.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row),
    }))
  }

  const validatePackageForm = () => {
    if (!packageForm.code.trim()) return 'Package code is required.'
    if (!packageForm.name.trim()) return 'Package name is required.'
    if (!packageForm.effectiveFrom) return 'Effective from date is required.'
    if (packageForm.effectiveTo && new Date(packageForm.effectiveTo).getTime() < new Date(packageForm.effectiveFrom).getTime()) {
      return 'Effective to date must be after effective from date.'
    }
    if (packageForm.roomRates.length === 0) return 'At least one room rate is required.'
    const numericFields = [
      ['Tax percentage', packageForm.taxPercentage],
      ['Discount percentage', packageForm.discountPercentage],
      ['Adult extra price', packageForm.adultExtraPrice],
      ['Child extra price', packageForm.childExtraPrice],
    ]
    const invalidNumber = numericFields.find(([, value]) => Number(value) < 0 || Number.isNaN(Number(value)))
    if (invalidNumber) return `${invalidNumber[0]} must be zero or more.`

    for (const [index, row] of packageForm.roomRates.entries()) {
      if (!row.roomTypeId) return `Room rate ${index + 1} needs a room type.`
      if (!row.ratePlanCode.trim()) return `Room rate ${index + 1} needs a rate plan.`
      const childrenCount = Number(row.children || 0)
      if (Number(row.adults) < 0 || childrenCount < 0 || Number(row.pricePerNight) < 0) {
        return `Room rate ${index + 1} has an invalid number.`
      }
      const ages = parseChildAges(row.childAges)
      if (childrenCount > 0 && ages.length !== childrenCount) {
        return `Room rate ${index + 1} child ages must match the children count.`
      }
    }

    for (const [index, row] of packageForm.mealRates.entries()) {
      if (!row.mealPlanId) return `Meal rate ${index + 1} needs a meal plan.`
      if (Number(row.pricePerNight) < 0 || Number.isNaN(Number(row.pricePerNight))) return `Meal rate ${index + 1} has an invalid price.`
    }

    for (const [index, row] of packageForm.serviceRates.entries()) {
      if (!row.additionalServiceId) return `Service rate ${index + 1} needs a service.`
      if (Number(row.pricePerNight) < 0 || Number.isNaN(Number(row.pricePerNight))) return `Service rate ${index + 1} has an invalid price.`
    }

    return null
  }

  const handleCreatePackage = async () => {
    const validationError = validatePackageForm()
    if (validationError) {
      appAlert.fire('Error', validationError, 'error')
      return
    }

    const roomRates: CorporatePackageRoomRate[] = packageForm.roomRates.map((row) => ({
      roomTypeId: row.roomTypeId,
      adults: Number(row.adults),
      children: Number(row.children || 0),
      childAges: Number(row.children || 0) > 0 ? parseChildAges(row.childAges) : [],
      ratePlanCode: row.ratePlanCode.trim(),
      pricePerNight: Number(row.pricePerNight),
    }))
    const mealRates: CorporatePackageMealRate[] = packageForm.mealRates.map((row) => ({
      mealPlanId: row.mealPlanId,
      pricePerNight: Number(row.pricePerNight),
    }))
    const serviceRates: CorporatePackageServiceRate[] = packageForm.serviceRates.map((row) => ({
      additionalServiceId: row.additionalServiceId,
      pricePerNight: Number(row.pricePerNight),
    }))

    setIsSubmittingPackage(true)
    try {
      await dispatch(addPackageToContract({
        contractId: activeContract.id,
        payload: {
          code: packageForm.code.trim().toUpperCase(),
          name: packageForm.name.trim(),
          description: packageForm.description.trim(),
          isActive: packageForm.isActive,
          initialVersion: {
            effectiveFrom: packageForm.effectiveFrom,
            effectiveTo: packageForm.effectiveTo || null,
            taxPercentage: Number(packageForm.taxPercentage),
            discountPercentage: Number(packageForm.discountPercentage),
            currencyCode: packageForm.currencyCode.trim().toUpperCase(),
            adultExtraPrice: Number(packageForm.adultExtraPrice),
            childExtraPrice: Number(packageForm.childExtraPrice),
            notes: packageForm.notes.trim(),
            roomRates,
            mealRates,
            serviceRates,
          },
        },
      })).unwrap()

      await dispatch(fetchCorporatePackagesByContract({ contractId: activeContract.id })).unwrap()
      await dispatch(fetchCorporateContractById(activeContract.id)).unwrap()
      await dispatch(fetchCorporateContractsByAccount(activeContract.corporateAccountId)).unwrap()

      appAlert.fire('Success', 'Package created successfully.', 'success')
      setPackageForm(createInitialForm(activeContract.currency))
      setIsAddingPackage(false)
      setActiveTab('Packages')
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not create package.', 'error')
    } finally {
      setIsSubmittingPackage(false)
    }
  }

  const handleGenerateInventory = async () => {
    if (!selectedInventoryPackage || !selectedInventoryVersion) {
      appAlert.fire('Error', 'Select a package with an active current version first.', 'error')
      return
    }

    const roomAllocations = inventoryRoomRates
      .map((rate) => ({
        roomTypeId: rate.roomTypeId,
        allocatedRooms: Number(inventoryRoomAllocations[rate.roomTypeId] ?? 0),
      }))
      .filter((row) => row.allocatedRooms > 0)

    if (roomAllocations.length === 0) {
      appAlert.fire('Error', 'Enter at least one room allocation greater than zero.', 'error')
      return
    }

    try {
      await dispatch(generateCorporateInventory({
        packageId: selectedInventoryPackage.id,
        versionId: selectedInventoryVersion.id,
        payload: {
          roomAllocations,
          regenerateFutureUnusedRows: true,
          reason: inventoryReason.trim(),
        },
      })).unwrap()

      await dispatch(fetchCorporateInventory({
        contractId: activeContract.id,
        params: {
          roomTypeId: inventoryFilters.roomTypeId || undefined,
          fromDate: inventoryFilters.fromDate || selectedInventoryVersion.effectiveFrom?.slice(0, 10),
          toDate: inventoryFilters.toDate || selectedInventoryVersion.effectiveTo?.slice(0, 10) || undefined,
          packageId: selectedInventoryPackage.id,
          versionId: selectedInventoryVersion.id,
          onlyAvailable: inventoryFilters.onlyAvailable,
          onlyAdjusted: inventoryFilters.onlyAdjusted,
        },
      })).unwrap()

      appAlert.fire('Success', 'Inventory generated successfully.', 'success')
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not generate inventory.', 'error')
    }
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
      await dispatch(fetchCorporatePackagesByContract({ contractId: activeContract.id })).unwrap()
      setPackageRemovalTarget(null)
    } catch (err: any) {
      setPackageRemovalError(err?.message || 'Could not remove package.')
    } finally {
      setIsRemovingPackage(false)
    }
  }

  const tabs: TabKey[] = ['Overview', 'Packages', 'Inventory']

  return (
    <>
      <Modal open onClose={onClose} lockScroll>
        <div className="flex h-[88vh] min-h-[720px] w-[min(1320px,94vw)] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
          <div className="flex items-start justify-between bg-[#004bb4] px-6 py-5 text-white">
            <div>
              <h2 className="text-xl font-bold">{activeContract.contractNumber}</h2>
              <p className="mt-1 text-sm text-blue-100">{activeContract.contractType} - {activeContract.currency} - {contractStatus}</p>
            </div>
            <button onClick={onClose} className="rounded-md p-2 transition-colors hover:bg-white/20" aria-label="Close contract details">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#004bb4]" />
                Credit limit: {formatMoney(creditLimit, activeContract.currency)}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#004bb4]" />
                {formatDate(activeContract.startDate)} - {formatDate(activeContract.endDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Package2 className="h-4 w-4 text-[#004bb4]" />
                {contractPackages.length} package{contractPackages.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-slate-200 px-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 py-4 text-base font-semibold transition-colors ${activeTab === tab ? 'border-[#004bb4] text-[#004bb4]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-8">
            {activeTab === 'Overview' && (
              <div className="grid min-h-[520px] content-start gap-8 xl:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-8">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <FileText className="h-6 w-6 text-[#004bb4]" />
                    <h3 className="text-xl font-semibold">Contract Summary</h3>
                  </div>
                    <div className="grid gap-5">
                    <SummaryItem label="Contract Number" value={activeContract.contractNumber} />
                    <SummaryItem label="Contract Type" value={activeContract.contractType} />
                    <SummaryItem label="Status" value={String(contractStatus)} />
                    <SummaryItem label="Release Days" value={activeContract.contractType === 'Commitment' ? 'N/A' : String(activeContract.releaseDaysBefore ?? '---')} />
                    <SummaryItem label="Credit Limit" value={formatMoney(creditLimit, activeContract.currency)} />
                    <SummaryItem label="Remaining Credit" value={formatMoney(activeContract.credit?.remainingCredit ?? creditLimit, activeContract.currency)} />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-8">
                  <div className="mb-5 flex items-center gap-2 text-slate-800">
                    <StickyNote className="h-6 w-6 text-[#004bb4]" />
                    <h3 className="text-xl font-semibold">Policy & Notes</h3>
                  </div>
                  <div className="space-y-4">
                    <SummaryItem label="Cancellation Policy" value={activeContract.corporateCancellationPolicy?.name ?? activeContract.cancellationPolicy ?? '---'} />
                    <SummaryItem label="Penalty" value={`${activeContract.corporateCancellationPolicy?.liquidatedDamagesPenaltyPercentage ?? activeContract.penaltyPercentage ?? 0}%`} />
                    <SummaryItem label="Notes" value={activeContract.notes || 'No notes provided.'} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Packages' && (
              <div className="flex min-h-[560px] flex-col space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Contract Packages</h3>
                    <p className="text-base text-slate-500">Create packages directly on this corporate contract.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingPackage((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingPackage ? 'Close Form' : 'Add Package'}
                  </button>
                </div>

                {isAddingPackage && (
                  <div className="space-y-7 rounded-lg border border-slate-200 bg-slate-50 p-7">
                    <div className="grid gap-5 lg:grid-cols-4">
                      <Field label="Code">
                        <input value={packageForm.code} onChange={(e) => setPackageForm((prev) => ({ ...prev, code: e.target.value }))} className={fieldClass} placeholder="TTT" />
                      </Field>
                      <Field label="Name">
                        <input value={packageForm.name} onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))} className={fieldClass} placeholder="Corporate Package" />
                      </Field>
                      <Field label="Currency">
                        <select value={packageForm.currencyCode} onChange={(e) => setPackageForm((prev) => ({ ...prev, currencyCode: e.target.value }))} className={`${fieldClass} bg-white`}>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="EGP">EGP</option>
                        </select>
                      </Field>
                      <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                        <input type="checkbox" checked={packageForm.isActive} onChange={(e) => setPackageForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                        Active package
                      </label>
                    </div>

                    <Field label="Description">
                      <textarea rows={2} value={packageForm.description} onChange={(e) => setPackageForm((prev) => ({ ...prev, description: e.target.value }))} className={fieldClass} />
                    </Field>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      <Field label="Effective From">
                        <input type="date" value={packageForm.effectiveFrom} onChange={(e) => setPackageForm((prev) => ({ ...prev, effectiveFrom: e.target.value }))} className={fieldClass} />
                      </Field>
                      <Field label="Effective To">
                        <input type="date" value={packageForm.effectiveTo} onChange={(e) => setPackageForm((prev) => ({ ...prev, effectiveTo: e.target.value }))} className={fieldClass} />
                      </Field>
                      <Field label="Tax %">
                        <input type="number" min="0" value={packageForm.taxPercentage} onChange={(e) => setPackageForm((prev) => ({ ...prev, taxPercentage: e.target.value }))} className={fieldClass} />
                      </Field>
                      <Field label="Discount %">
                        <input type="number" min="0" value={packageForm.discountPercentage} onChange={(e) => setPackageForm((prev) => ({ ...prev, discountPercentage: e.target.value }))} className={fieldClass} />
                      </Field>
                      <Field label="Adult Extra">
                        <input type="number" min="0" value={packageForm.adultExtraPrice} onChange={(e) => setPackageForm((prev) => ({ ...prev, adultExtraPrice: e.target.value }))} className={fieldClass} />
                      </Field>
                      <Field label="Child Extra">
                        <input type="number" min="0" value={packageForm.childExtraPrice} onChange={(e) => setPackageForm((prev) => ({ ...prev, childExtraPrice: e.target.value }))} className={fieldClass} />
                      </Field>
                    </div>

                    <RateBuilderHeader title="Room Rates" addLabel="Add Room Rate" onAdd={() => setPackageForm((prev) => ({ ...prev, roomRates: [...prev.roomRates, emptyRoomRate()] }))} />
                    <div className="space-y-4">
                      {packageForm.roomRates.map((row, index) => (
                        <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800">Room Rate {index + 1}</p>
                              <p className="mt-0.5 text-xs text-slate-500">Room type, occupancy, rate plan, and nightly price.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPackageForm((prev) => ({ ...prev, roomRates: prev.roomRates.filter((_, rowIndex) => rowIndex !== index) }))}
                              disabled={packageForm.roomRates.length === 1}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Remove room rate ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
                            <Field label="Room Type">
                              <select value={row.roomTypeId} onChange={(e) => updateRoomRate(index, { roomTypeId: e.target.value })} className={`${fieldClass} bg-white`}>
                                <option value="">Select room type</option>
                                {roomTypes.map((roomType) => <option key={roomType.id} value={roomType.id}>{roomType.name}</option>)}
                              </select>
                            </Field>
                            <Field label="Adults">
                              <input type="number" min="0" value={row.adults} onChange={(e) => updateRoomRate(index, { adults: e.target.value })} className={fieldClass} />
                            </Field>
                            <Field label="Children">
                              <input type="number" min="0" value={row.children} onChange={(e) => updateRoomRate(index, { children: e.target.value })} className={fieldClass} />
                            </Field>
                          </div>

                          <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 p-5 lg:grid-cols-[1fr_1fr_0.8fr]">
                            <Field label="Child Ages comma separated">
                              <input value={row.childAges} onChange={(e) => updateRoomRate(index, { childAges: e.target.value })} className={fieldClass} placeholder="Example: 4, 8" />
                            </Field>
                            <Field label="Rate Plan">
                              <select value={row.ratePlanCode} onChange={(e) => updateRoomRate(index, { ratePlanCode: e.target.value })} className={`${fieldClass} bg-white`}>
                                <option value="">Select rate plan</option>
                                {ratePlans.map((ratePlan) => <option key={ratePlan.id} value={ratePlan.code}>{ratePlan.code} - {ratePlan.name}</option>)}
                              </select>
                            </Field>
                            <Field label="Price / Night">
                              <input type="number" min="0" value={row.pricePerNight} onChange={(e) => updateRoomRate(index, { pricePerNight: e.target.value })} className={fieldClass} />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>

                    <RateBuilderHeader title="Meal Rates" addLabel="Add Meal Rate" onAdd={() => setPackageForm((prev) => ({ ...prev, mealRates: [...prev.mealRates, emptyMealRate()] }))} />
                    <div className="space-y-3">
                      {packageForm.mealRates.length === 0 && <p className="text-sm text-slate-500">No meal rates added.</p>}
                      {packageForm.mealRates.map((row, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
                          <select value={row.mealPlanId} onChange={(e) => updateMealRate(index, { mealPlanId: e.target.value })} className={`${fieldClass} bg-white`}>
                            <option value="">Meal plan</option>
                            {mealPlans.map((mealPlan) => <option key={mealPlan.id} value={mealPlan.id}>{mealPlan.name}</option>)}
                          </select>
                          <input type="number" min="0" value={row.pricePerNight} onChange={(e) => updateMealRate(index, { pricePerNight: e.target.value })} className={fieldClass} placeholder="Price/night" />
                          <button type="button" onClick={() => setPackageForm((prev) => ({ ...prev, mealRates: prev.mealRates.filter((_, rowIndex) => rowIndex !== index) }))} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Remove meal rate">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <RateBuilderHeader title="Service Rates" addLabel="Add Service Rate" onAdd={() => setPackageForm((prev) => ({ ...prev, serviceRates: [...prev.serviceRates, emptyServiceRate()] }))} />
                    <div className="space-y-3">
                      {packageForm.serviceRates.length === 0 && <p className="text-sm text-slate-500">No service rates added.</p>}
                      {packageForm.serviceRates.map((row, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
                          <select value={row.additionalServiceId} onChange={(e) => updateServiceRate(index, { additionalServiceId: e.target.value })} className={`${fieldClass} bg-white`}>
                            <option value="">Service</option>
                            {additionalServices.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                          </select>
                          <input type="number" min="0" value={row.pricePerNight} onChange={(e) => updateServiceRate(index, { pricePerNight: e.target.value })} className={fieldClass} placeholder="Price/night" />
                          <button type="button" onClick={() => setPackageForm((prev) => ({ ...prev, serviceRates: prev.serviceRates.filter((_, rowIndex) => rowIndex !== index) }))} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Remove service rate">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Field label="Version Notes">
                      <textarea rows={2} value={packageForm.notes} onChange={(e) => setPackageForm((prev) => ({ ...prev, notes: e.target.value }))} className={fieldClass} />
                    </Field>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                      <button type="button" onClick={() => setIsAddingPackage(false)} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="button" onClick={handleCreatePackage} disabled={isSubmittingPackage} className="rounded-lg bg-[#004bb4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70">
                        {isSubmittingPackage ? 'Creating...' : 'Create Package'}
                      </button>
                    </div>
                  </div>
                )}

                {isPackagesLoading && !hasContractPackages && (
                  <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-10 text-center">
                    <Package2 className="mb-4 h-10 w-10 animate-pulse text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-800">Loading packages</h3>
                    <p className="mt-2 text-sm text-slate-500">Checking packages for this contract...</p>
                  </div>
                )}

                {isPackagesLoading && hasContractPackages && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#004bb4]">
                    Refreshing package list...
                  </div>
                )}

                {packagesError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{packagesError}</div>
                )}

                {!hasContractPackages && !isPackagesLoading ? (
                  <div className="flex min-h-[340px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Package2 className="mb-4 h-11 w-11 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-800">No packages yet</h3>
                    <p className="mt-2 text-sm text-slate-500">Create the first package for this contract.</p>
                  </div>
                ) : hasContractPackages ? (
                  <div className="space-y-4">
                    {contractPackages.map((pkg) => {
                      const version = getVersion(pkg)
                      const currency = version?.currencyCode ?? activeContract.currency
                      return (
                        <div key={pkg.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-6">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-bold text-slate-900">{pkg.name}</h4>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#004bb4]">{pkg.code}</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {pkg.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {version && (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{version.status}</span>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-500">{pkg.description || 'No description provided.'}</p>
                            </div>
                            <button
                              onClick={() => setPackageRemovalTarget({ id: pkg.id, name: pkg.name })}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove package"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {version ? (
                            <div className="space-y-5 p-6">
                              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <PackageMetric icon={<CalendarDays className="h-4 w-4" />} label="Effective" value={`${formatDate(version.effectiveFrom)} - ${formatDate(version.effectiveTo)}`} />
                                <PackageMetric icon={<BadgePercent className="h-4 w-4" />} label="Tax" value={`${version.taxPercentage}%`} />
                                <PackageMetric icon={<BadgePercent className="h-4 w-4" />} label="Discount" value={`${version.discountPercentage}%`} />
                                <PackageMetric icon={<Coins className="h-4 w-4" />} label="Adult Extra" value={formatMoney(version.adultExtraPrice, currency)} />
                                <PackageMetric icon={<Coins className="h-4 w-4" />} label="Child Extra" value={formatMoney(version.childExtraPrice, currency)} />
                                <PackageMetric icon={<FileText className="h-4 w-4" />} label="Versions" value={String(pkg.versionCount ?? pkg.versions?.length ?? 1)} />
                              </div>

                              <RateSummary
                                title="Room Rates"
                                icon={<BedDouble className="h-4 w-4" />}
                                rows={version.roomRates.map((rate) => ({
                                  title: roomTypeLookup.get(rate.roomTypeId)?.name ?? 'Unknown room type',
                                  meta: `${rate.adults} adult(s), ${rate.children} child(ren) - ${rate.ratePlanCode}`,
                                  value: formatMoney(rate.pricePerNight, currency),
                                }))}
                              />
                              <RateSummary
                                title="Meal Rates"
                                icon={<UtensilsCrossed className="h-4 w-4" />}
                                rows={version.mealRates.map((rate) => ({
                                  title: mealPlanLookup.get(rate.mealPlanId)?.name ?? 'Unknown meal plan',
                                  meta: 'Per night',
                                  value: formatMoney(rate.pricePerNight, currency),
                                }))}
                              />
                              <RateSummary
                                title="Service Rates"
                                icon={<Wrench className="h-4 w-4" />}
                                rows={version.serviceRates.map((rate) => ({
                                  title: serviceLookup.get(rate.additionalServiceId)?.name ?? 'Unknown service',
                                  meta: 'Per night',
                                  value: formatMoney(rate.pricePerNight, currency),
                                }))}
                              />
                              {version.notes && (
                                <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700">{version.notes}</div>
                              )}
                            </div>
                          ) : (
                            <div className="p-5 text-sm text-slate-500">No package version returned for this package.</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'Inventory' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Corporate Inventory</h3>
                    <p className="text-base text-slate-500">Generate and review room inventory for package versions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedInventoryPackage || !selectedInventoryVersion) return
                      void dispatch(fetchCorporateInventory({
                        contractId: activeContract.id,
                        params: {
                          roomTypeId: inventoryFilters.roomTypeId || undefined,
                          fromDate: inventoryFilters.fromDate || selectedInventoryVersion.effectiveFrom?.slice(0, 10),
                          toDate: inventoryFilters.toDate || selectedInventoryVersion.effectiveTo?.slice(0, 10) || undefined,
                          packageId: selectedInventoryPackage.id,
                          versionId: selectedInventoryVersion.id,
                          onlyAvailable: inventoryFilters.onlyAvailable,
                          onlyAdjusted: inventoryFilters.onlyAdjusted,
                        },
                      }))
                    }}
                    disabled={!selectedInventoryPackage || !selectedInventoryVersion || inventoryStatus === 'loading'}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${inventoryStatus === 'loading' ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {!hasContractPackages ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Package2 className="mb-4 h-11 w-11 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-800">No packages available</h3>
                    <p className="mt-2 max-w-md text-sm text-slate-500">Create a contract package first, then generate inventory from its current version.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 rounded-lg border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                      <Field label="Package">
                        <select
                          value={selectedInventoryPackage?.id ?? ''}
                          onChange={(event) => setSelectedInventoryPackageId(event.target.value)}
                          className={`${fieldClass} bg-white`}
                        >
                          {contractPackages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.code})
                            </option>
                          ))}
                        </select>
                      </Field>
                      <SummaryItem label="Current Version" value={selectedInventoryVersion ? `Version ${selectedInventoryVersion.versionNumber}` : 'No current version'} />
                      <SummaryItem label="Effective Period" value={selectedInventoryVersion ? `${formatDate(selectedInventoryVersion.effectiveFrom)} - ${formatDate(selectedInventoryVersion.effectiveTo)}` : '---'} />
                    </div>

                    {!selectedInventoryVersion ? (
                      <div className="rounded-lg border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">
                        This package does not have a current version, so inventory cannot be generated.
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                          <div className="rounded-lg border border-slate-200 bg-white p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-base font-bold text-slate-800">Generate Inventory</h4>
                                <p className="text-sm text-slate-500">Use the selected package current version.</p>
                              </div>
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004bb4]">
                                Version {selectedInventoryVersion.versionNumber}
                              </span>
                            </div>

                            <div className="space-y-4">
                              {inventoryRoomRates.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                  This version has no room rates to allocate.
                                </div>
                              ) : (
                                inventoryRoomRates.map((rate) => (
                                  <div key={rate.roomTypeId} className="grid items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_160px]">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">{roomTypeLookup.get(rate.roomTypeId)?.name ?? 'Unknown room type'}</p>
                                      <p className="text-xs text-slate-500">{rate.adults} adult(s), {rate.children} child(ren) - {rate.ratePlanCode}</p>
                                    </div>
                                    <input
                                      type="number"
                                      min="0"
                                      value={inventoryRoomAllocations[rate.roomTypeId] ?? '0'}
                                      onChange={(event) => setInventoryRoomAllocations((prev) => ({ ...prev, [rate.roomTypeId]: event.target.value }))}
                                      className={fieldClass}
                                      placeholder="Rooms/day"
                                    />
                                  </div>
                                ))
                              )}

                              <Field label="Reason">
                                <textarea
                                  rows={3}
                                  value={inventoryReason}
                                  onChange={(event) => setInventoryReason(event.target.value)}
                                  className={fieldClass}
                                  placeholder="Why are you generating this inventory?"
                                />
                              </Field>

                              {generateInventoryError && (
                                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                  {generateInventoryError}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={handleGenerateInventory}
                                disabled={generateInventoryStatus === 'loading' || inventoryRoomRates.length === 0}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {generateInventoryStatus === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                                {generateInventoryStatus === 'loading' ? 'Generating...' : 'Generate Inventory'}
                              </button>
                            </div>
                          </div>

                          <GenerationResultPanel result={lastGeneratedInventory} />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white">
                          <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-2 xl:grid-cols-5">
                            <Field label="Room Type">
                              <select
                                value={inventoryFilters.roomTypeId}
                                onChange={(event) => setInventoryFilters((prev) => ({ ...prev, roomTypeId: event.target.value }))}
                                className={`${fieldClass} bg-white`}
                              >
                                <option value="">All room types</option>
                                {inventoryRoomRates.map((rate) => (
                                  <option key={rate.roomTypeId} value={rate.roomTypeId}>
                                    {roomTypeLookup.get(rate.roomTypeId)?.name ?? 'Unknown room type'}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="From Date">
                              <input
                                type="date"
                                value={inventoryFilters.fromDate}
                                onChange={(event) => {
                                  const fromDate = event.target.value
                                  setInventoryFilters((prev) => ({ ...prev, ...clampInventoryRange(fromDate, prev.toDate, selectedInventoryVersion.effectiveTo) }))
                                }}
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="To Date">
                              <input
                                type="date"
                                value={inventoryFilters.toDate}
                                min={inventoryFilters.fromDate}
                                max={inventoryFilters.fromDate ? minDate(addDays(inventoryFilters.fromDate, maxInventoryRangeDays - 1), selectedInventoryVersion.effectiveTo?.slice(0, 10)) : selectedInventoryVersion.effectiveTo?.slice(0, 10)}
                                onChange={(event) => {
                                  const next = clampInventoryRange(inventoryFilters.fromDate, event.target.value, selectedInventoryVersion.effectiveTo)
                                  setInventoryFilters((prev) => ({ ...prev, ...next }))
                                }}
                                className={fieldClass}
                              />
                            </Field>
                            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={inventoryFilters.onlyAvailable}
                                onChange={(event) => setInventoryFilters((prev) => ({ ...prev, onlyAvailable: event.target.checked }))}
                              />
                              Only available
                            </label>
                            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={inventoryFilters.onlyAdjusted}
                                onChange={(event) => setInventoryFilters((prev) => ({ ...prev, onlyAdjusted: event.target.checked }))}
                              />
                              Only adjusted
                            </label>
                          </div>
                          <div className="border-b border-slate-100 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
                            Inventory date range is capped at {maxInventoryRangeDays} days to keep the table readable.
                          </div>

                          {inventoryError && (
                            <div className="m-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                              {inventoryError}
                            </div>
                          )}

                          <InventorySummary inventory={selectedInventory} isLoading={inventoryStatus === 'loading'} />
                          <InventoryTable rows={selectedInventory?.rows ?? []} isLoading={inventoryStatus === 'loading'} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        open={Boolean(packageRemovalTarget)}
        title="Remove Package"
        description={`This will remove "${packageRemovalTarget?.name ?? 'this package'}" from the contract.`}
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

function GenerationResultPanel({ result }: { result?: GenerateCorporateInventoryResponse }) {
  if (!result) {
    return (
      <div className="flex min-h-[360px] flex-col justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-slate-300" />
        <h4 className="text-base font-bold text-slate-800">Generation result</h4>
        <p className="mt-2 text-sm text-slate-500">Generate inventory to see the generated days, existing days, and warnings.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">Generation Result</h4>
          <p className="text-sm text-slate-500">{formatDate(result.fromDate)} - {formatDate(result.toDate)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.hotelAvailabilityImpact ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {result.hotelAvailabilityImpact ? 'Availability impacted' : 'No availability impact'}
        </span>
      </div>

      <div className="space-y-3">
        {result.roomTypes.map((roomType) => (
          <div key={roomType.roomTypeId} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">{roomType.roomTypeName}</p>
              <p className="text-sm font-semibold text-[#004bb4]">{roomType.roomsPerDay} rooms/day</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <InventoryTinyMetric label="Generated Days" value={String(roomType.generatedDays)} />
              <InventoryTinyMetric label="Existing Days" value={String(roomType.existingDays)} />
            </div>
          </div>
        ))}
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-700">Warnings</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700">
            {result.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function InventorySummary({ inventory, isLoading }: { inventory?: { totalRows: number; totalAllocatedRoomNights: number; totalConsumedRoomNights: number; totalReleasedRoomNights: number; totalRemainingRoomNights: number }; isLoading: boolean }) {
  const items = [
    ['Rows', inventory?.totalRows ?? 0],
    ['Allocated', inventory?.totalAllocatedRoomNights ?? 0],
    ['Consumed', inventory?.totalConsumedRoomNights ?? 0],
    ['Released', inventory?.totalReleasedRoomNights ?? 0],
    ['Remaining', inventory?.totalRemainingRoomNights ?? 0],
  ] as const

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{isLoading ? '...' : value}</p>
        </div>
      ))}
    </div>
  )
}

function InventoryTable({ rows, isLoading }: { rows: CorporateInventoryRow[]; isLoading: boolean }) {
  return (
    <div className="overflow-hidden border-t border-slate-200">
      <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        <div>Stay Date</div>
        <div>Room Type</div>
        <div>Allocated</div>
        <div>Consumed</div>
        <div>Released</div>
        <div>Adjustment</div>
        <div>Remaining</div>
      </div>
      <div className="min-h-[220px] divide-y divide-slate-100">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">
            Loading inventory...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-slate-500">
            No inventory rows found.
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.8fr_1fr_1fr] px-5 py-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-800">{formatDate(row.stayDate)}</div>
              <div>{row.roomTypeName}</div>
              <div>{row.allocatedRooms}</div>
              <div>{row.consumedRooms}</div>
              <div>{row.releasedRooms}</div>
              <div>{row.manualAdjustmentRooms}</div>
              <div className="font-bold text-[#004bb4]">{row.remainingCorporateRooms}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function InventoryTinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function RateBuilderHeader({ title, addLabel = 'Add Row', onAdd }: { title: string; addLabel?: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-5">
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  )
}

function PackageMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-base font-bold text-slate-800">{value}</p>
    </div>
  )
}

function RateSummary({
  title,
  icon,
  rows,
}: {
  title: string
  icon: ReactNode
  rows: Array<{ title: string; meta: string; value: string }>
}) {
  if (rows.length === 0) return null
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[#004bb4]">
        {icon}
        <p className="text-sm font-bold uppercase tracking-wide text-slate-600">{title}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <div key={`${row.title}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-base font-semibold text-slate-800">{row.title}</p>
              <p className="text-xs text-slate-500">{row.meta}</p>
            </div>
            <p className="text-base font-bold text-slate-800">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

