import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Coins,
  FileText,
  Package2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
  Wrench,
  X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  addPackageToContract,
  buildCorporateInventoryKey,
  fetchCorporateContractById,
  fetchCorporateContractSummary,
  fetchCorporateInventory,
  fetchCorporatePackagesByContract,
  generateCorporateInventory,
} from '../../features/corporateContracts/corporateContractSlice'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { fetchMealPlans } from '../../features/admin/mealPlansSlice'
import { fetchAdditionalServices } from '../../features/admin/additionalServicesSlice'
import { fetchRatePlans } from '../../features/ratePlans/ratePlansSlice'
import { routes } from '../../shared/lib/routes'
import { appAlert } from '../../shared/ui/AppAlert'
import { Modal } from '../../shared/ui/Modal'
import type {
  CorporateContractPackage,
  CorporateContractSummary,
  CorporateInventoryRow,
  CorporatePackageRoomRate,
  CorporatePackageVersion,
  GenerateCorporateInventoryResponse,
} from '../../models/CorporateContract'

type SectionKey = 'Overview' | 'Packages' | 'Inventory' | 'Summary'
type InventoryGenerationRow = {
  id: string
  roomTypeId: string
  adults: string
  children: string
  allocatedRooms: string
}
type PackageRoomRateFormRow = {
  id: string
  roomTypeId: string
  adults: string
  children: string
  childAges: string
  ratePlanCode: string
  pricePerNight: string
}
type PackageFormState = {
  code: string
  name: string
  description: string
  effectiveFrom: string
  effectiveTo: string
  taxPercentage: string
  discountPercentage: string
  currencyCode: string
  adultExtraPrice: string
  childExtraPrice: string
  notes: string
  roomRates: PackageRoomRateFormRow[]
}
type ContractDetailsLocationState = {
  contractId?: string
}

const sections: SectionKey[] = ['Overview', 'Packages', 'Inventory', 'Summary']
const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#004bb4] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
const maxInventoryRangeDays = 21

function formatDate(value?: string | null) {
  if (!value) return '---'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
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

function formatMoney(value?: number | null, currency = 'EUR') {
  if (value === null || value === undefined) return '---'
  return `${value.toLocaleString()} ${currency}`
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return '---'
  return `${value.toLocaleString()}%`
}

function getVersion(pkg: CorporateContractPackage): CorporatePackageVersion | null {
  return pkg.currentVersion ?? pkg.versions?.[0] ?? null
}

function createGenerationRow(index = 0): InventoryGenerationRow {
  return {
    id: `${Date.now()}-${index}`,
    roomTypeId: '',
    adults: '0',
    children: '0',
    allocatedRooms: '0',
  }
}

function createPackageRoomRate(index = 0): PackageRoomRateFormRow {
  return {
    id: `${Date.now()}-${index}`,
    roomTypeId: '',
    adults: '1',
    children: '0',
    childAges: '',
    ratePlanCode: '',
    pricePerNight: '',
  }
}

function createPackageForm(currency = 'EUR'): PackageFormState {
  return {
    code: '',
    name: '',
    description: '',
    effectiveFrom: '',
    effectiveTo: '',
    taxPercentage: '0',
    discountPercentage: '0',
    currencyCode: currency || 'EUR',
    adultExtraPrice: '0',
    childExtraPrice: '0',
    notes: '',
    roomRates: [createPackageRoomRate()],
  }
}

function parseChildAges(value: string): number[] {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0)
}

export function CorporateContractDetailsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const navigationState = location.state as ContractDetailsLocationState | null
  const contractId = navigationState?.contractId

  const selectedContract = useAppSelector((state) => state.corporateContract.selected)
  const contractStatus = useAppSelector((state) => state.corporateContract.status)
  const contractError = useAppSelector((state) => state.corporateContract.error)
  const packagesByContractId = useAppSelector((state) => state.corporateContract.packagesByContractId)
  const packagesStatus = useAppSelector((state) => state.corporateContract.packagesStatus)
  const packagesError = useAppSelector((state) => state.corporateContract.packagesError)
  const inventoryByKey = useAppSelector((state) => state.corporateContract.inventoryByKey)
  const inventoryStatus = useAppSelector((state) => state.corporateContract.inventoryStatus)
  const inventoryError = useAppSelector((state) => state.corporateContract.inventoryError)
  const summaryByContractId = useAppSelector((state) => state.corporateContract.summaryByContractId)
  const summaryStatus = useAppSelector((state) => state.corporateContract.summaryStatus)
  const summaryError = useAppSelector((state) => state.corporateContract.summaryError)
  const generateInventoryStatus = useAppSelector((state) => state.corporateContract.generateInventoryStatus)
  const generateInventoryError = useAppSelector((state) => state.corporateContract.generateInventoryError)
  const lastGeneratedInventory = useAppSelector((state) => state.corporateContract.lastGeneratedInventory)
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  const mealPlans = useAppSelector((state) => state.mealPlans.items)
  const additionalServices = useAppSelector((state) => state.additionalServices.items)
  const ratePlans = useAppSelector((state) => state.ratePlans.items)

  const [activeSection, setActiveSection] = useState<SectionKey>('Overview')
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [generationRows, setGenerationRows] = useState<InventoryGenerationRow[]>([])
  const [isGenerateInventoryOpen, setIsGenerateInventoryOpen] = useState(false)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false)
  const [packageForm, setPackageForm] = useState<PackageFormState>(() => createPackageForm())
  const [reason, setReason] = useState('')
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    roomTypeId: '',
    onlyAvailable: false,
    onlyAdjusted: false,
  })

  useEffect(() => {
    if (!contractId) return
    dispatch(fetchCorporateContractById(contractId))
    dispatch(fetchCorporatePackagesByContract({ contractId }))
    dispatch(fetchRoomTypes())
    dispatch(fetchMealPlans())
    dispatch(fetchAdditionalServices())
    dispatch(fetchRatePlans({ isActive: true }))
  }, [contractId, dispatch])

  const activeContract = selectedContract?.id === contractId ? selectedContract : undefined
  const contractPackages = contractId ? packagesByContractId[contractId] ?? activeContract?.packages ?? [] : []
  const packageLoading = packagesStatus === 'loading'
  const selectedPackage = useMemo(
    () => contractPackages.find((pkg) => pkg.id === selectedPackageId) ?? contractPackages[0] ?? null,
    [contractPackages, selectedPackageId]
  )
  const selectedVersion = selectedPackage ? getVersion(selectedPackage) : null
  const roomTypeLookup = useMemo(() => new Map(roomTypes.map((item) => [item.id, item.name])), [roomTypes])
  const mealPlanLookup = useMemo(() => new Map(mealPlans.map((item) => [item.id, item.name])), [mealPlans])
  const serviceLookup = useMemo(() => new Map(additionalServices.map((item) => [item.id, item.name])), [additionalServices])
  const versionRoomRates = useMemo(() => {
    const seen = new Set<string>()
    return (selectedVersion?.roomRates ?? []).filter((rate) => {
      if (seen.has(rate.roomTypeId)) return false
      seen.add(rate.roomTypeId)
      return true
    })
  }, [selectedVersion])
  const inventoryKey = activeContract && selectedPackage && selectedVersion
    ? buildCorporateInventoryKey(activeContract.id, selectedPackage.id, selectedVersion.id)
    : ''
  const inventory = inventoryKey ? inventoryByKey[inventoryKey] : undefined
  const summary = contractId ? summaryByContractId[contractId] : undefined

  useEffect(() => {
    if (selectedPackageId && contractPackages.some((pkg) => pkg.id === selectedPackageId)) return
    setSelectedPackageId(contractPackages[0]?.id ?? '')
  }, [contractPackages, selectedPackageId])

  useEffect(() => {
    if (!selectedVersion) {
      setFilters((prev) => ({ ...prev, fromDate: '', toDate: '', roomTypeId: '' }))
      setGenerationRows([])
      return
    }
    setFilters((prev) => ({
      ...prev,
      ...clampInventoryRange(
        selectedVersion.effectiveFrom?.slice(0, 10) || '',
        selectedVersion.effectiveTo?.slice(0, 10) || '',
        selectedVersion.effectiveTo,
      ),
      roomTypeId: '',
    }))
    setGenerationRows([createGenerationRow()])
  }, [selectedVersion, versionRoomRates])

  useEffect(() => {
    if (activeSection !== 'Inventory' || !activeContract || !selectedPackage || !selectedVersion) return
    const request = dispatch(fetchCorporateInventory({
      contractId: activeContract.id,
      params: {
        roomTypeId: filters.roomTypeId || undefined,
        fromDate: filters.fromDate || selectedVersion.effectiveFrom?.slice(0, 10),
        toDate: filters.toDate || selectedVersion.effectiveTo?.slice(0, 10) || undefined,
        packageId: selectedPackage.id,
        versionId: selectedVersion.id,
        onlyAvailable: filters.onlyAvailable,
        onlyAdjusted: filters.onlyAdjusted,
      },
    }))
    return () => request.abort()
  }, [activeContract, activeSection, dispatch, filters, selectedPackage, selectedVersion])

  useEffect(() => {
    if (activeSection !== 'Summary' || !activeContract) return
    const request = dispatch(fetchCorporateContractSummary(activeContract.id))
    return () => request.abort()
  }, [activeContract, activeSection, dispatch])

  const handleGenerateInventory = async () => {
    if (!activeContract || !selectedPackage || !selectedVersion) {
      appAlert.fire('Error', 'Select a package with a current version first.', 'error')
      return
    }

    const allocationByRoomType = new Map<string, number>()
    generationRows.forEach((row) => {
      const allocatedRooms = Number(row.allocatedRooms || 0)
      if (!row.roomTypeId || !Number.isFinite(allocatedRooms) || allocatedRooms <= 0) return
      allocationByRoomType.set(row.roomTypeId, (allocationByRoomType.get(row.roomTypeId) ?? 0) + allocatedRooms)
    })

    const requestRows = Array.from(allocationByRoomType.entries()).map(([roomTypeId, allocatedRooms]) => ({
      roomTypeId,
      allocatedRooms,
    }))

    if (requestRows.length === 0) {
      appAlert.fire('Error', 'Add at least one room type with rooms per day greater than zero.', 'error')
      return
    }

    try {
      await dispatch(generateCorporateInventory({
        packageId: selectedPackage.id,
        versionId: selectedVersion.id,
        payload: {
          roomAllocations: requestRows,
          regenerateFutureUnusedRows: true,
          reason: reason.trim(),
        },
      })).unwrap()

      await dispatch(fetchCorporateInventory({
        contractId: activeContract.id,
        params: {
          roomTypeId: filters.roomTypeId || undefined,
          fromDate: filters.fromDate || selectedVersion.effectiveFrom?.slice(0, 10),
          toDate: filters.toDate || selectedVersion.effectiveTo?.slice(0, 10) || undefined,
          packageId: selectedPackage.id,
          versionId: selectedVersion.id,
          onlyAvailable: filters.onlyAvailable,
          onlyAdjusted: filters.onlyAdjusted,
        },
      })).unwrap()

      void dispatch(fetchCorporateContractSummary(activeContract.id))

      appAlert.fire('Success', 'Inventory generated successfully.', 'success')
      setIsGenerateInventoryOpen(false)
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not generate inventory.', 'error')
    }
  }

  const openPackageModal = () => {
    setPackageForm(createPackageForm(activeContract?.currency ?? 'EUR'))
    setIsPackageModalOpen(true)
  }

  const validatePackageForm = () => {
    if (!packageForm.code.trim()) return 'Package code is required.'
    if (!packageForm.name.trim()) return 'Package name is required.'
    if (!packageForm.effectiveFrom) return 'Effective from date is required.'
    if (packageForm.effectiveTo && new Date(packageForm.effectiveTo).getTime() < new Date(packageForm.effectiveFrom).getTime()) {
      return 'Effective to date must be after effective from date.'
    }
    const numericFields = [
      ['Tax percentage', packageForm.taxPercentage],
      ['Discount percentage', packageForm.discountPercentage],
      ['Adult extra price', packageForm.adultExtraPrice],
      ['Child extra price', packageForm.childExtraPrice],
    ]
    const invalidNumber = numericFields.find(([, value]) => Number(value) < 0 || Number.isNaN(Number(value)))
    if (invalidNumber) return `${invalidNumber[0]} must be zero or more.`

    if (packageForm.roomRates.length === 0) return 'At least one room rate is required.'
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
    return null
  }

  const handleCreatePackage = async () => {
    if (!activeContract) return
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

    setIsSubmittingPackage(true)
    try {
      await dispatch(addPackageToContract({
        contractId: activeContract.id,
        payload: {
          code: packageForm.code.trim().toUpperCase(),
          name: packageForm.name.trim(),
          description: packageForm.description.trim(),
          isActive: true,
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
            mealRates: [],
            serviceRates: [],
          },
        },
      })).unwrap()

      await dispatch(fetchCorporatePackagesByContract({ contractId: activeContract.id })).unwrap()
      await dispatch(fetchCorporateContractById(activeContract.id)).unwrap()
      void dispatch(fetchCorporateContractSummary(activeContract.id))
      setIsPackageModalOpen(false)
      appAlert.fire('Success', 'Package created successfully.', 'success')
    } catch (err: any) {
      appAlert.fire('Error', err?.message || 'Could not create package.', 'error')
    } finally {
      setIsSubmittingPackage(false)
    }
  }

  if (!contractId) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-sm font-semibold text-slate-500">Open a contract from the corporate account list to view its details.</p>
        <button onClick={() => navigate(routes.salesRevenue.corporateAccount)} className="rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-semibold text-white">
          Back to Corporate Accounts
        </button>
      </div>
    )
  }

  if (contractStatus === 'loading' && !activeContract) {
    return <div className="p-8 text-center text-slate-500">Loading contract details...</div>
  }

  if (!activeContract) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-sm font-semibold text-slate-500">{contractError || 'Contract not found.'}</p>
        <button onClick={() => navigate(routes.salesRevenue.corporateAccount)} className="rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-semibold text-white">
          Back to Corporate Accounts
        </button>
      </div>
    )
  }

  const statusText = activeContract.status ?? activeContract.contractStatus ?? '---'
  const backToAccountHref = routes.salesRevenue.corporateAccount

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={backToAccountHref} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Corporate Account
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[#004bb4] px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{activeContract.contractNumber}</h1>
              <p className="mt-1 text-sm text-blue-100">{activeContract.companyName || 'Corporate contract'} - {activeContract.contractType} - {String(statusText)}</p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white">{activeContract.currency}</span>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
          <TopMetric icon={<CalendarDays className="h-5 w-5" />} label="Start Date" value={formatDate(activeContract.startDate)} />
          <TopMetric icon={<CalendarDays className="h-5 w-5" />} label="End Date" value={formatDate(activeContract.endDate)} />
          <TopMetric icon={<Coins className="h-5 w-5" />} label="Credit Limit" value={formatMoney(activeContract.creditLimit ?? activeContract.credit?.creditLimit, activeContract.currency)} />
          <TopMetric icon={<Package2 className="h-5 w-5" />} label="Packages" value={String(contractPackages.length)} />
          <TopMetric icon={<ShieldCheck className="h-5 w-5" />} label="Status" value={String(statusText)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${activeSection === section ? 'text-[#004bb4]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {section}
            {activeSection === section && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-t bg-[#004bb4]" />}
          </button>
        ))}
      </div>

      {activeSection === 'Overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionPanel title="Contract Summary" icon={<FileText className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoTile label="Contract Number" value={activeContract.contractNumber} />
              <InfoTile label="Contract Type" value={activeContract.contractType} />
              <InfoTile label="Currency" value={activeContract.currency} />
              <InfoTile label="Release Days" value={activeContract.contractType === 'Commitment' ? 'N/A' : String(activeContract.releaseDaysBefore ?? '---')} />
              <InfoTile label="Credit Limit" value={formatMoney(activeContract.creditLimit ?? activeContract.credit?.creditLimit, activeContract.currency)} />
              <InfoTile label="Remaining Credit" value={formatMoney(activeContract.credit?.remainingCredit ?? activeContract.creditLimit, activeContract.currency)} />
            </div>
          </SectionPanel>
          <SectionPanel title="Policies & Dates" icon={<CalendarDays className="h-5 w-5" />}>
            <div className="grid gap-4">
              <InfoTile label="Cancellation Policy" value={activeContract.corporateCancellationPolicy?.name ?? activeContract.cancellationPolicy ?? '---'} />
              <InfoTile label="Cancellation Penalty" value={`${activeContract.corporateCancellationPolicy?.liquidatedDamagesPenaltyPercentage ?? activeContract.penaltyPercentage ?? 0}%`} />
              <InfoTile label="Contract Period" value={`${formatDate(activeContract.startDate)} - ${formatDate(activeContract.endDate)}`} />
              <InfoTile label="Notes" value={activeContract.notes || 'No notes provided.'} />
            </div>
          </SectionPanel>
        </div>
      )}

      {activeSection === 'Packages' && (
        <PackagesSection
          packages={contractPackages}
          packageLoading={packageLoading}
          packagesError={packagesError}
          currency={activeContract.currency}
          roomTypeLookup={roomTypeLookup}
          mealPlanLookup={mealPlanLookup}
          serviceLookup={serviceLookup}
          onAddPackage={openPackageModal}
        />
      )}

      {activeSection === 'Inventory' && (
        <InventorySection
          packages={contractPackages}
          selectedPackage={selectedPackage}
          selectedVersion={selectedVersion}
          selectedPackageId={selectedPackageId}
          setSelectedPackageId={setSelectedPackageId}
          roomTypeLookup={roomTypeLookup}
          versionRoomRates={versionRoomRates}
          generationRows={generationRows}
          setGenerationRows={setGenerationRows}
          isGenerateInventoryOpen={isGenerateInventoryOpen}
          setIsGenerateInventoryOpen={setIsGenerateInventoryOpen}
          reason={reason}
          setReason={setReason}
          filters={filters}
          setFilters={setFilters}
          inventory={inventory}
          inventoryStatus={inventoryStatus}
          inventoryError={inventoryError}
          generateInventoryStatus={generateInventoryStatus}
          generateInventoryError={generateInventoryError}
          lastGeneratedInventory={lastGeneratedInventory}
          onGenerate={handleGenerateInventory}
        />
      )}

      {activeSection === 'Summary' && (
        <SummarySection
          summary={summary}
          status={summaryStatus}
          error={summaryError}
        />
      )}

      {isPackageModalOpen && (
        <PackageCreateModal
          open={isPackageModalOpen}
          form={packageForm}
          setForm={setPackageForm}
          roomTypes={roomTypes}
          ratePlans={ratePlans}
          isSubmitting={isSubmittingPackage}
          onClose={() => setIsPackageModalOpen(false)}
          onSubmit={handleCreatePackage}
        />
      )}
    </div>
  )
}

function PackagesSection({
  packages,
  packageLoading,
  packagesError,
  currency,
  roomTypeLookup,
  mealPlanLookup,
  serviceLookup,
  onAddPackage,
}: {
  packages: CorporateContractPackage[]
  packageLoading: boolean
  packagesError?: string
  currency: string
  roomTypeLookup: Map<string, string>
  mealPlanLookup: Map<string, string>
  serviceLookup: Map<string, string>
  onAddPackage: () => void
}) {
  if (packageLoading && packages.length === 0) {
    return <EmptyPanel icon={<Package2 className="h-10 w-10 animate-pulse" />} title="Loading packages" body="Checking packages for this contract..." />
  }

  if (packagesError && packages.length === 0) {
    return <EmptyPanel icon={<Package2 className="h-10 w-10" />} title="Could not load packages" body={packagesError} />
  }

  if (packages.length === 0) {
    return (
      <EmptyPanel
        icon={<Package2 className="h-10 w-10" />}
        title="No packages yet"
        body="Create a package for this contract before generating inventory."
        action={
          <button type="button" onClick={onAddPackage} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
            <Plus className="h-4 w-4" />
            Add Package
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Packages</h2>
          <p className="text-sm text-slate-500">Create and review contract packages.</p>
        </div>
        <button type="button" onClick={onAddPackage} className="inline-flex items-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
          <Plus className="h-4 w-4" />
          Add Package
        </button>
      </div>
      {packageLoading && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#004bb4]">Refreshing package list...</div>
      )}
      {packages.map((pkg) => {
        const version = getVersion(pkg)
        const versionCurrency = version?.currencyCode ?? currency
        return (
          <div key={pkg.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#004bb4]">{pkg.code}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {version && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Version {version.versionNumber}</span>}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{pkg.description || 'No description provided.'}</p>
              </div>
            </div>

            {version ? (
              <div className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <PackageMetric icon={<CalendarDays className="h-4 w-4" />} label="Effective" value={`${formatDate(version.effectiveFrom)} - ${formatDate(version.effectiveTo)}`} />
                  <PackageMetric icon={<BadgePercent className="h-4 w-4" />} label="Tax" value={`${version.taxPercentage}%`} />
                  <PackageMetric icon={<BadgePercent className="h-4 w-4" />} label="Discount" value={`${version.discountPercentage}%`} />
                  <PackageMetric icon={<Coins className="h-4 w-4" />} label="Adult Extra" value={formatMoney(version.adultExtraPrice, versionCurrency)} />
                  <PackageMetric icon={<Coins className="h-4 w-4" />} label="Child Extra" value={formatMoney(version.childExtraPrice, versionCurrency)} />
                  <PackageMetric icon={<FileText className="h-4 w-4" />} label="Versions" value={String(pkg.versionCount ?? pkg.versions?.length ?? 1)} />
                </div>
                <RateSummary title="Room Rates" icon={<BedDouble className="h-4 w-4" />} rows={version.roomRates.map((rate) => ({
                  title: roomTypeLookup.get(rate.roomTypeId) ?? 'Unknown room type',
                  meta: `${rate.adults} adult(s), ${rate.children} child(ren) - ${rate.ratePlanCode}`,
                  value: formatMoney(rate.pricePerNight, versionCurrency),
                }))} />
                <RateSummary title="Meal Rates" icon={<UtensilsCrossed className="h-4 w-4" />} rows={version.mealRates.map((rate) => ({
                  title: mealPlanLookup.get(rate.mealPlanId) ?? 'Unknown meal plan',
                  meta: 'Per night',
                  value: formatMoney(rate.pricePerNight, versionCurrency),
                }))} />
                <RateSummary title="Service Rates" icon={<Wrench className="h-4 w-4" />} rows={version.serviceRates.map((rate) => ({
                  title: serviceLookup.get(rate.additionalServiceId) ?? 'Unknown service',
                  meta: 'Per night',
                  value: formatMoney(rate.pricePerNight, versionCurrency),
                }))} />
              </div>
            ) : (
              <div className="p-6 text-sm font-semibold text-slate-500">This package has no current version.</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PackageCreateModal({
  open,
  form,
  setForm,
  roomTypes,
  ratePlans,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  open: boolean
  form: PackageFormState
  setForm: Dispatch<SetStateAction<PackageFormState>>
  roomTypes: Array<{ id: string; name: string }>
  ratePlans: Array<{ id: string; code: string; name: string; isActive: boolean }>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}) {
  const updateRoomRate = (id: string, patch: Partial<PackageRoomRateFormRow>) => {
    setForm((prev) => ({
      ...prev,
      roomRates: prev.roomRates.map((row) => row.id === id ? { ...row, ...patch } : row),
    }))
  }

  const addRoomRate = () => {
    setForm((prev) => ({ ...prev, roomRates: [...prev.roomRates, createPackageRoomRate(prev.roomRates.length)] }))
  }

  const removeRoomRate = (id: string) => {
    setForm((prev) => ({ ...prev, roomRates: prev.roomRates.length > 1 ? prev.roomRates.filter((row) => row.id !== id) : prev.roomRates }))
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex max-h-[92vh] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#004bb4] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Add Package</h2>
            <p className="mt-1 text-sm text-blue-100">Create a package and initial room rates for this contract.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Code">
              <input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))} className={fieldClass} placeholder="CORP-PKG" />
            </Field>
            <Field label="Name">
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={fieldClass} placeholder="Corporate Package" />
            </Field>
            <Field label="Currency">
              <select value={form.currencyCode} onChange={(event) => setForm((prev) => ({ ...prev, currencyCode: event.target.value }))} className={fieldClass}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="EGP">EGP</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={2} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className={fieldClass} />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Effective From">
              <input type="date" value={form.effectiveFrom} onChange={(event) => setForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Effective To">
              <input type="date" value={form.effectiveTo} onChange={(event) => setForm((prev) => ({ ...prev, effectiveTo: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Tax %">
              <input type="number" min="0" value={form.taxPercentage} onChange={(event) => setForm((prev) => ({ ...prev, taxPercentage: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Discount %">
              <input type="number" min="0" value={form.discountPercentage} onChange={(event) => setForm((prev) => ({ ...prev, discountPercentage: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Adult Extra">
              <input type="number" min="0" value={form.adultExtraPrice} onChange={(event) => setForm((prev) => ({ ...prev, adultExtraPrice: event.target.value }))} className={fieldClass} />
            </Field>
            <Field label="Child Extra">
              <input type="number" min="0" value={form.childExtraPrice} onChange={(event) => setForm((prev) => ({ ...prev, childExtraPrice: event.target.value }))} className={fieldClass} />
            </Field>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Room Rates</h3>
                <p className="text-sm text-slate-500">At least one room rate is required.</p>
              </div>
              <button type="button" onClick={addRoomRate} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                <Plus className="h-4 w-4" />
                Add Room Rate
              </button>
            </div>

            {form.roomRates.map((row, index) => (
              <div key={row.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-800">Room Rate {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeRoomRate(row.id)}
                    disabled={form.roomRates.length === 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Room Type">
                    <select value={row.roomTypeId} onChange={(event) => updateRoomRate(row.id, { roomTypeId: event.target.value })} className={fieldClass}>
                      <option value="">Select room type</option>
                      {roomTypes.map((roomType) => <option key={roomType.id} value={roomType.id}>{roomType.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Adults">
                    <input type="number" min="0" value={row.adults} onChange={(event) => updateRoomRate(row.id, { adults: event.target.value })} className={fieldClass} />
                  </Field>
                  <Field label="Children">
                    <input type="number" min="0" value={row.children} onChange={(event) => updateRoomRate(row.id, { children: event.target.value })} className={fieldClass} />
                  </Field>
                  <Field label="Child Ages">
                    <input value={row.childAges} onChange={(event) => updateRoomRate(row.id, { childAges: event.target.value })} className={fieldClass} placeholder="Example: 4, 8" />
                  </Field>
                  <Field label="Rate Plan">
                    <select value={row.ratePlanCode} onChange={(event) => updateRoomRate(row.id, { ratePlanCode: event.target.value })} className={fieldClass}>
                      <option value="">{ratePlans.length ? 'Select rate plan' : 'No active rate plans'}</option>
                      {ratePlans.filter((ratePlan) => ratePlan.isActive).map((ratePlan) => (
                        <option key={ratePlan.id} value={ratePlan.code}>
                          {ratePlan.code} - {ratePlan.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Price / Night">
                    <input type="number" min="0" value={row.pricePerNight} onChange={(event) => updateRoomRate(row.id, { pricePerNight: event.target.value })} className={fieldClass} />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <Field label="Version Notes">
            <textarea rows={2} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} className={fieldClass} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={isSubmitting} className="rounded-lg bg-[#004bb4] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function InventorySection({
  packages,
  selectedPackage,
  selectedVersion,
  selectedPackageId,
  setSelectedPackageId,
  roomTypeLookup,
  versionRoomRates,
  generationRows,
  setGenerationRows,
  isGenerateInventoryOpen,
  setIsGenerateInventoryOpen,
  reason,
  setReason,
  filters,
  setFilters,
  inventory,
  inventoryStatus,
  inventoryError,
  generateInventoryStatus,
  generateInventoryError,
  lastGeneratedInventory,
  onGenerate,
}: {
  packages: CorporateContractPackage[]
  selectedPackage: CorporateContractPackage | null
  selectedVersion: CorporatePackageVersion | null
  selectedPackageId: string
  setSelectedPackageId: (value: string) => void
  roomTypeLookup: Map<string, string>
  versionRoomRates: NonNullable<CorporatePackageVersion['roomRates']>
  generationRows: InventoryGenerationRow[]
  setGenerationRows: Dispatch<SetStateAction<InventoryGenerationRow[]>>
  isGenerateInventoryOpen: boolean
  setIsGenerateInventoryOpen: (value: boolean) => void
  reason: string
  setReason: (value: string) => void
  filters: { fromDate: string; toDate: string; roomTypeId: string; onlyAvailable: boolean; onlyAdjusted: boolean }
  setFilters: Dispatch<SetStateAction<{ fromDate: string; toDate: string; roomTypeId: string; onlyAvailable: boolean; onlyAdjusted: boolean }>>
  inventory?: { totalRows: number; totalAllocatedRoomNights: number; totalConsumedRoomNights: number; totalReleasedRoomNights: number; totalRemainingRoomNights: number; rows: CorporateInventoryRow[] }
  inventoryStatus: string
  inventoryError?: string
  generateInventoryStatus: string
  generateInventoryError?: string
  lastGeneratedInventory?: GenerateCorporateInventoryResponse
  onGenerate: () => void
}) {
  if (packages.length === 0) {
    return <EmptyPanel icon={<Package2 className="h-10 w-10" />} title="No packages available" body="Create a package before generating corporate inventory." />
  }

  const maxToDate = filters.fromDate
    ? minDate(addDays(filters.fromDate, maxInventoryRangeDays - 1), selectedVersion?.effectiveTo?.slice(0, 10))
    : selectedVersion?.effectiveTo?.slice(0, 10) || undefined

  return (
    <div className="space-y-6">
      <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
        <Field label="Package">
          <select value={selectedPackageId} onChange={(event) => setSelectedPackageId(event.target.value)} className={fieldClass}>
            {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.code})</option>)}
          </select>
        </Field>
        <InfoTile label="Current Version" value={selectedVersion ? `Version ${selectedVersion.versionNumber}` : 'No current version'} />
        <InfoTile label="Effective Period" value={selectedVersion ? `${formatDate(selectedVersion.effectiveFrom)} - ${formatDate(selectedVersion.effectiveTo)}` : '---'} />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setGenerationRows([createGenerationRow()])
              setReason('')
              setIsGenerateInventoryOpen(true)
            }}
            disabled={!selectedVersion}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#004bb4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Generate Inventory
          </button>
        </div>
      </div>

      {!selectedVersion ? (
        <EmptyPanel icon={<Package2 className="h-10 w-10" />} title="No current version" body="Inventory requires a package with an active current version." />
      ) : (
        <>
          {lastGeneratedInventory && (
            <GenerationResultPanel result={lastGeneratedInventory} />
          )}

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Room Type">
                <select value={filters.roomTypeId} onChange={(event) => setFilters((prev) => ({ ...prev, roomTypeId: event.target.value }))} className={fieldClass}>
                  <option value="">All room types</option>
                  {versionRoomRates.map((rate) => <option key={rate.roomTypeId} value={rate.roomTypeId}>{roomTypeLookup.get(rate.roomTypeId) ?? 'Unknown room type'}</option>)}
                </select>
              </Field>
              <Field label="From Date">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) => {
                    const fromDate = event.target.value
                    setFilters((prev) => ({ ...prev, ...clampInventoryRange(fromDate, prev.toDate, selectedVersion.effectiveTo) }))
                  }}
                  className={fieldClass}
                />
              </Field>
              <Field label="To Date">
                <input
                  type="date"
                  value={filters.toDate}
                  min={filters.fromDate}
                  max={maxToDate}
                  onChange={(event) => {
                    const next = clampInventoryRange(filters.fromDate, event.target.value, selectedVersion.effectiveTo)
                    setFilters((prev) => ({ ...prev, ...next }))
                  }}
                  className={fieldClass}
                />
              </Field>
              <FilterToggle
                label="Only Available"
                checked={filters.onlyAvailable}
                onChange={(checked) => setFilters((prev) => ({ ...prev, onlyAvailable: checked }))}
              />
              <FilterToggle
                label="Only Adjusted"
                checked={filters.onlyAdjusted}
                onChange={(checked) => setFilters((prev) => ({ ...prev, onlyAdjusted: checked }))}
              />
            </div>
            <div className="border-b border-slate-100 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
              Inventory date range is capped at {maxInventoryRangeDays} days to keep the table readable.
            </div>
            {inventoryError && <div className="m-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{inventoryError}</div>}
            <InventorySummary inventory={inventory} isLoading={inventoryStatus === 'loading'} />
            <InventoryTable rows={inventory?.rows ?? []} isLoading={inventoryStatus === 'loading'} />
          </div>

          <GenerateInventoryDialog
            open={isGenerateInventoryOpen}
            onClose={() => setIsGenerateInventoryOpen(false)}
            roomTypeLookup={roomTypeLookup}
            versionRoomRates={versionRoomRates}
            generationRows={generationRows}
            setGenerationRows={setGenerationRows}
            reason={reason}
            setReason={setReason}
            generateInventoryStatus={generateInventoryStatus}
            generateInventoryError={generateInventoryError}
            onGenerate={onGenerate}
          />
        </>
      )}
    </div>
  )
}

function SummarySection({
  summary,
  status,
  error,
}: {
  summary?: CorporateContractSummary
  status: string
  error?: string
}) {
  if (status === 'loading' && !summary) {
    return <EmptyPanel icon={<FileText className="h-10 w-10 animate-pulse" />} title="Loading summary" body="Checking the latest contract summary..." />
  }

  if (error && !summary) {
    return <EmptyPanel icon={<FileText className="h-10 w-10" />} title="Could not load summary" body={error} />
  }

  if (!summary) {
    return <EmptyPanel icon={<FileText className="h-10 w-10" />} title="No summary available" body="Open this section again after the contract summary endpoint returns data." />
  }

  const currency = summary.contract.currency || 'EUR'
  const inventoryRows = summary.inventory.byRoomType.length > 0 ? summary.inventory.byRoomType : summary.inventory.roomTypes

  return (
    <div className="space-y-6">
      {status === 'loading' && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#004bb4]">Refreshing summary...</div>
      )}

      {summary.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          {summary.warnings.join(', ')}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionPanel title="Contract Snapshot" icon={<FileText className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Contract Number" value={summary.contract.contractNumber || '---'} />
            <InfoTile label="Company" value={summary.contract.companyName || '---'} />
            <InfoTile label="Contract Type" value={String(summary.contract.contractType || '---')} />
            <InfoTile label="Currency" value={currency} />
          </div>
        </SectionPanel>

        <SectionPanel title="Pricing" icon={<BadgePercent className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Package Code" value={summary.pricing.packageCode || '---'} />
            <InfoTile label="Package Version" value={summary.pricing.packageVersionNumber ? `Version ${summary.pricing.packageVersionNumber}` : '---'} />
            <InfoTile label="Discount" value={formatPercent(summary.pricing.discountPercentage)} />
            <InfoTile label="Tax" value={formatPercent(summary.pricing.taxPercentage)} />
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryValueCard label="Allocated Nights" value={String(summary.inventory.allocatedRoomNights ?? 0)} />
        <SummaryValueCard label="Consumed Nights" value={String(summary.inventory.consumedRoomNights ?? 0)} />
        <SummaryValueCard label="Released Nights" value={String(summary.inventory.releasedRoomNights ?? 0)} />
        <SummaryValueCard label="Remaining Nights" value={String(summary.inventory.remainingRoomNights ?? 0)} />
        <SummaryValueCard label="Pickup" value={formatPercent(summary.inventory.pickupPercentage)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionPanel title="Commercial Value" icon={<Coins className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Guaranteed Liability" value={summary.commercialValue.guaranteedCommitmentLiability ? 'Yes' : 'No'} />
            <InfoTile label="Gross Room Value" value={formatMoney(summary.commercialValue.grossRoomValue, currency)} />
            <InfoTile label="Discount Amount" value={formatMoney(summary.commercialValue.discountAmount, currency)} />
            <InfoTile label="Tax Amount" value={formatMoney(summary.commercialValue.taxAmount, currency)} />
            <InfoTile label="Net Contract Value" value={formatMoney(summary.commercialValue.netContractValue, currency)} />
            <InfoTile label="Consumed Reservation Value" value={formatMoney(summary.commercialValue.consumedReservationValue, currency)} />
          </div>
        </SectionPanel>

        <SectionPanel title="Credit & Consumption" icon={<ShieldCheck className="h-5 w-5" />}>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Credit Limit" value={formatMoney(summary.credit.creditLimit, currency)} />
            <InfoTile label="Current Exposure" value={formatMoney(summary.credit.currentExposure, currency)} />
            <InfoTile label="Remaining Credit" value={formatMoney(summary.credit.remainingCredit, currency)} />
            <InfoTile label="Above Credit Limit" value={formatMoney(summary.credit.contractValueAboveCreditLimit, currency)} />
            <InfoTile label="Consumed Value" value={formatMoney(summary.consumption.consumedValue, currency)} />
            <InfoTile label="Remaining Committed Value" value={formatMoney(summary.consumption.remainingCommittedValue, currency)} />
          </div>
        </SectionPanel>
      </div>

      <SectionPanel title="Reservations" icon={<CalendarDays className="h-5 w-5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <InfoTile label="Total" value={String(summary.reservations.total ?? 0)} />
          <InfoTile label="Future" value={String(summary.reservations.future ?? 0)} />
          <InfoTile label="Reserved" value={String(summary.reservations.reserved ?? 0)} />
          <InfoTile label="Checked In" value={String(summary.reservations.checkedIn ?? 0)} />
          <InfoTile label="Checked Out" value={String(summary.reservations.checkedOut ?? 0)} />
          <InfoTile label="Cancelled" value={String(summary.reservations.cancelled ?? 0)} />
          <InfoTile label="No Show" value={String(summary.reservations.noShow ?? 0)} />
        </div>
      </SectionPanel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SummaryRoomTypesTable rows={inventoryRows} />
        <SummaryPackageVersionsTable rows={summary.byPackageVersion} currency={currency} />
      </div>
    </div>
  )
}

function SummaryValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function SummaryRoomTypesTable({ rows }: { rows: NonNullable<CorporateContractSummary['inventory']['byRoomType']> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-bold text-slate-800">Inventory By Room Type</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Room Type</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Per Day</th>
              <th className="px-5 py-3">Allocated</th>
              <th className="px-5 py-3">Consumed</th>
              <th className="px-5 py-3">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center font-semibold text-slate-500">No room type summary found.</td></tr>
            ) : rows.map((row, index) => (
              <tr key={`${row.roomTypeName}-${index}`}>
                <td className="px-5 py-3 font-semibold text-slate-800">{row.roomTypeName || 'Unknown room type'}</td>
                <td className="px-5 py-3 text-slate-700">{formatDate(row.fromDate)} - {formatDate(row.toDate)}</td>
                <td className="px-5 py-3 text-slate-700">{row.allocatedRoomsPerDay}</td>
                <td className="px-5 py-3 text-slate-700">{row.allocatedRoomNights}</td>
                <td className="px-5 py-3 text-slate-700">{row.consumedRoomNights}</td>
                <td className="px-5 py-3 font-bold text-[#004bb4]">{row.remainingRoomNights}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryPackageVersionsTable({ rows, currency }: { rows: CorporateContractSummary['byPackageVersion']; currency: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-bold text-slate-800">Package Version Value</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Version</th>
              <th className="px-5 py-3">Gross</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Tax</th>
              <th className="px-5 py-3">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center font-semibold text-slate-500">No package version value found.</td></tr>
            ) : rows.map((row, index) => (
              <tr key={`${row.versionNumber}-${index}`}>
                <td className="px-5 py-3 font-semibold text-slate-800">Version {row.versionNumber}</td>
                <td className="px-5 py-3 text-slate-700">{formatMoney(row.grossRoomValue, currency)}</td>
                <td className="px-5 py-3 text-slate-700">{formatMoney(row.discountAmount, currency)}</td>
                <td className="px-5 py-3 text-slate-700">{formatMoney(row.taxAmount, currency)}</td>
                <td className="px-5 py-3 font-bold text-[#004bb4]">{formatMoney(row.netValue, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GenerateInventoryDialog({
  open,
  onClose,
  roomTypeLookup,
  versionRoomRates,
  generationRows,
  setGenerationRows,
  reason,
  setReason,
  generateInventoryStatus,
  generateInventoryError,
  onGenerate,
}: {
  open: boolean
  onClose: () => void
  roomTypeLookup: Map<string, string>
  versionRoomRates: NonNullable<CorporatePackageVersion['roomRates']>
  generationRows: InventoryGenerationRow[]
  setGenerationRows: Dispatch<SetStateAction<InventoryGenerationRow[]>>
  reason: string
  setReason: (value: string) => void
  generateInventoryStatus: string
  generateInventoryError?: string
  onGenerate: () => void
}) {
  if (!open) return null

  const availableRoomTypes = Array.from(
    new Map(versionRoomRates.map((rate) => [rate.roomTypeId, roomTypeLookup.get(rate.roomTypeId) ?? 'Unknown room type'])).entries()
  )

  const updateRow = (id: string, patch: Partial<InventoryGenerationRow>) => {
    setGenerationRows((prev) => prev.map((row) => row.id === id ? { ...row, ...patch } : row))
  }

  const addRow = () => {
    setGenerationRows((prev) => [...prev, createGenerationRow(prev.length)])
  }

  const removeRow = (id: string) => {
    setGenerationRows((prev) => prev.length > 1 ? prev.filter((row) => row.id !== id) : prev)
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex max-h-[92vh] w-[92vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#004bb4] px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Generate Inventory</h2>
            <p className="mt-1 text-sm text-blue-100">Create room inventory from the selected package version.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {versionRoomRates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-500">
              This version has no room rates to allocate.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr_44px] gap-3 px-1 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
                <span>Room Type</span>
                <span>Adults</span>
                <span>Children</span>
                <span>Rooms / Day</span>
                <span />
              </div>
              {generationRows.map((row) => (
                <div key={row.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr_44px]">
                  <Field label="Room Type">
                    <select value={row.roomTypeId} onChange={(event) => updateRow(row.id, { roomTypeId: event.target.value })} className={fieldClass}>
                      <option value="">Select room type</option>
                      {availableRoomTypes.map(([roomTypeId, roomTypeName]) => (
                        <option key={roomTypeId} value={roomTypeId}>
                          {roomTypeName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Adults">
                    <input type="number" min="0" value={row.adults} onChange={(event) => updateRow(row.id, { adults: event.target.value })} className={fieldClass} />
                  </Field>
                  <Field label="Children">
                    <input type="number" min="0" value={row.children} onChange={(event) => updateRow(row.id, { children: event.target.value })} className={fieldClass} />
                  </Field>
                  <Field label="Rooms / Day">
                    <input type="number" min="0" value={row.allocatedRooms} onChange={(event) => updateRow(row.id, { allocatedRooms: event.target.value })} className={fieldClass} placeholder="0" />
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={generationRows.length === 1}
                      className="inline-flex h-[42px] w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <Plus className="h-4 w-4" />
            Add Row
          </button>

          <Field label="Reason">
            <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className={fieldClass} placeholder="Reason" />
          </Field>

          {generateInventoryError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{generateInventoryError}</div>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
            Cancel
          </button>
          <button type="button" onClick={onGenerate} disabled={generateInventoryStatus === 'loading' || versionRoomRates.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-[#004bb4] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70">
            {generateInventoryStatus === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {generateInventoryStatus === 'loading' ? 'Generating...' : 'Generate Inventory'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function SectionPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 text-slate-800">
        <span className="text-[#004bb4]">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function TopMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#004bb4]">{icon}<span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span></div>
      <p className="text-base font-bold text-slate-800">{value}</p>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}

function PackageMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <InfoTile label={label} value={value} />
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-[42px] w-full min-w-[160px] items-center justify-between gap-3 self-end rounded-lg border px-3 text-sm font-semibold transition-colors ${
        checked
          ? 'border-[#004bb4] bg-blue-50 text-[#004bb4]'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-pressed={checked}
    >
      <span>{label}</span>
      <span className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#004bb4]' : 'bg-slate-300'}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

function RateSummary({ title, icon, rows }: { title: string; icon: ReactNode; rows: Array<{ title: string; meta: string; value: string }> }) {
  if (rows.length === 0) return null
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[#004bb4]">{icon}<p className="text-sm font-bold uppercase tracking-wide text-slate-600">{title}</p></div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <div key={`${row.title}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4">
            <div><p className="text-sm font-semibold text-slate-800">{row.title}</p><p className="text-xs text-slate-500">{row.meta}</p></div>
            <p className="text-sm font-bold text-slate-800">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyPanel({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
      {icon}
      <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-slate-500">{body}</p>
      {action}
    </div>
  )
}

function GenerationResultPanel({ result }: { result?: GenerateCorporateInventoryResponse }) {
  if (!result) return <EmptyPanel icon={<CheckCircle2 className="h-10 w-10" />} title="Generation result" body="Generate inventory to see generated days, existing days, and warnings." />
  return (
    <SectionPanel title="Generation Result" icon={<CheckCircle2 className="h-5 w-5" />}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{formatDate(result.fromDate)} - {formatDate(result.toDate)}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.hotelAvailabilityImpact ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{result.hotelAvailabilityImpact ? 'Availability impacted' : 'No availability impact'}</span>
      </div>
      <div className="space-y-3">
        {result.roomTypes.map((roomType) => (
          <div key={roomType.roomTypeId} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between gap-3"><p className="text-sm font-bold text-slate-800">{roomType.roomTypeName}</p><p className="text-sm font-semibold text-[#004bb4]">{roomType.roomsPerDay} rooms/day</p></div>
            <div className="mt-3 grid grid-cols-2 gap-3"><InfoTile label="Generated Days" value={String(roomType.generatedDays)} /><InfoTile label="Existing Days" value={String(roomType.existingDays)} /></div>
          </div>
        ))}
      </div>
      {result.warnings.length > 0 && <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">{result.warnings.join(', ')}</div>}
    </SectionPanel>
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
  return <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">{items.map(([label, value]) => <InfoTile key={label} label={label} value={isLoading ? '...' : String(value)} />)}</div>
}

function InventoryTable({ rows, isLoading }: { rows: CorporateInventoryRow[]; isLoading: boolean }) {
  return (
    <div className="overflow-x-auto border-t border-slate-200">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
          <tr><th className="px-5 py-3">Stay Date</th><th className="px-5 py-3">Room Type</th><th className="px-5 py-3">Allocated</th><th className="px-5 py-3">Consumed</th><th className="px-5 py-3">Released</th><th className="px-5 py-3">Adjustment</th><th className="px-5 py-3">Remaining</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr><td colSpan={7} className="px-5 py-14 text-center font-semibold text-slate-500">Loading inventory...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={7} className="px-5 py-14 text-center font-semibold text-slate-500">No inventory rows found.</td></tr>
          ) : rows.map((row) => (
            <tr key={row.id}>
              <td className="px-5 py-3 font-semibold text-slate-800">{formatDate(row.stayDate)}</td>
              <td className="px-5 py-3 text-slate-700">{row.roomTypeName}</td>
              <td className="px-5 py-3 text-slate-700">{row.allocatedRooms}</td>
              <td className="px-5 py-3 text-slate-700">{row.consumedRooms}</td>
              <td className="px-5 py-3 text-slate-700">{row.releasedRooms}</td>
              <td className="px-5 py-3 text-slate-700">{row.manualAdjustmentRooms}</td>
              <td className="px-5 py-3 font-bold text-[#004bb4]">{row.remainingCorporateRooms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
