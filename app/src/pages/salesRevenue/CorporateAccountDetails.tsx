import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, Mail, Phone, Plus, ShieldCheck, Users } from 'lucide-react'
import { AddCorporateContractPopup } from './popups/corporateAccount/AddCorporateContractPopup'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCorporateAccountById } from '../../features/corporateAccounts/corporateAccountsSlice'
import { fetchCorporateContractsByAccount } from '../../features/corporateContracts/corporateContractSlice'
import { routes } from '../../shared/lib/routes'
import type { CorporateContract } from '../../models/CorporateContract'

interface CorporateAccountDetailsProps {
  onBack: () => void
  accountId: string
}

function formatDate(value?: string | null) {
  if (!value) return '---'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.split(' ')[0] || value
  return parsed.toLocaleDateString()
}

function formatCurrency(value?: number | null, currency = 'EUR') {
  if (value === null || value === undefined) return '---'
  return `${value.toLocaleString()} ${currency}`
}

function getAccountPeriod(contracts: Array<{ startDate?: string | null; endDate?: string | null }>) {
  const starts = contracts
    .map((contract) => contract.startDate ? new Date(contract.startDate).getTime() : Number.NaN)
    .filter((value) => Number.isFinite(value))
  const ends = contracts
    .map((contract) => contract.endDate ? new Date(contract.endDate).getTime() : Number.NaN)
    .filter((value) => Number.isFinite(value))

  if (starts.length === 0 || ends.length === 0) return '---'
  return `${formatDate(new Date(Math.min(...starts)).toISOString())} - ${formatDate(new Date(Math.max(...ends)).toISOString())}`
}

type SectionKey = 'Company Details' | 'Corporate Contracts'
const sections: SectionKey[] = ['Company Details', 'Corporate Contracts']

export function CorporateAccountDetails({ onBack, accountId }: CorporateAccountDetailsProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selected, status, error } = useAppSelector((state) => state.corporateAccounts)
  const { items: contracts, status: contractsStatus } = useAppSelector((state) => state.corporateContract)
  const [activeSection, setActiveSection] = useState<SectionKey>('Corporate Contracts')
  const [isAddContractPopupOpen, setIsAddContractPopupOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchCorporateAccountById(accountId))
    dispatch(fetchCorporateContractsByAccount(accountId))
  }, [dispatch, accountId])

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.isActive || String(contract.status ?? contract.contractStatus ?? '').toLowerCase() === 'active'),
    [contracts]
  )

  if (status === 'loading' && (!selected || selected.id !== accountId)) {
    return <div className="p-8 text-center text-slate-500">Loading account details...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 font-medium text-red-500">Error loading account: {error}</p>
        <button onClick={onBack} className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-800">
          Back to Accounts
        </button>
      </div>
    )
  }

  if (!selected || selected.id !== accountId) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Account not found.</div>
  }

  const companyName = selected.companyName || '---'
  const accountPeriod = getAccountPeriod(contracts.length > 0 ? contracts : selected.contracts ?? [])
  const openContract = (contract: CorporateContract) => {
    navigate(routes.salesRevenue.corporateContractDetails, {
      state: {
        contractId: contract.id,
      },
    })
  }

  return (
    <div className="space-y-6 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{companyName}</h1>
          <p className="mt-1 text-sm text-slate-500">Corporate account workspace</p>
        </div>
        <button
          onClick={() => setIsAddContractPopupOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Add Contract
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Users className="h-5 w-5" />} label="Company" value={companyName} />
        <SummaryCard icon={<Calendar className="h-5 w-5" />} label="Account Period" value={accountPeriod} />
        <SummaryCard icon={<ShieldCheck className="h-5 w-5" />} label="Active Contracts" value={String(activeContracts.length)} />
        <SummaryCard icon={<FileText className="h-5 w-5" />} label="Total Contracts" value={String(contracts.length)} />
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <InfoBlock label="Contact Person" value={selected.contactPerson || '---'} />
        <InfoBlock label="Email" value={selected.email || '---'} icon={<Mail className="h-4 w-4" />} />
        <InfoBlock label="Phone" value={selected.phone || '---'} icon={<Phone className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
              activeSection === section ? 'text-[#004bb4]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {section}
            {activeSection === section && <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-t bg-[#004bb4]" />}
          </button>
        ))}
      </div>

      {activeSection === 'Company Details' && (
        <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-base font-bold text-slate-800">Company Details</h2>
            <div className="mt-5 grid gap-5">
              <InfoBlock label="Company Name" value={companyName} />
              <InfoBlock label="Contact Person" value={selected.contactPerson || '---'} />
              <InfoBlock label="Email" value={selected.email || '---'} icon={<Mail className="h-4 w-4" />} />
              <InfoBlock label="Phone" value={selected.phone || '---'} icon={<Phone className="h-4 w-4" />} />
              <InfoBlock label="Address" value={selected.address || '---'} />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Account Summary</h2>
            <div className="mt-5 grid gap-5">
              <InfoBlock label="Account Period" value={accountPeriod} />
              <InfoBlock label="Status" value={selected.isActive ? 'Active' : 'Inactive'} />
              <InfoBlock label="Created At" value={formatDate(selected.createdAt)} />
              <InfoBlock label="Active Contracts" value={String(activeContracts.length)} />
              <InfoBlock label="Total Contracts" value={String(contracts.length)} />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'Corporate Contracts' && (
        <ContractsSection
          contracts={contracts}
          contractsStatus={contractsStatus}
          onAddContract={() => setIsAddContractPopupOpen(true)}
          onOpenContract={openContract}
        />
      )}

      {isAddContractPopupOpen && (
        <AddCorporateContractPopup
          accountId={accountId}
          onClose={() => setIsAddContractPopupOpen(false)}
        />
      )}

    </div>
  )
}

function ContractsSection({
  contracts,
  contractsStatus,
  onAddContract,
  onOpenContract,
}: {
  contracts: CorporateContract[]
  contractsStatus: string
  onAddContract: () => void
  onOpenContract: (contract: CorporateContract) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Corporate Contracts</h2>
          <p className="text-sm text-slate-500">Open a contract to view details, packages, and inventory.</p>
        </div>
        <button
          onClick={onAddContract}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add Contract
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contract Number</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dates</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Credit Limit</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Packages</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {contractsStatus === 'loading' && contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Loading contracts...</td>
              </tr>
            ) : contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No contracts found for this account.</td>
              </tr>
            ) : (
              contracts.map((contract) => {
                const statusText = contract.status ?? contract.contractStatus ?? '---'
                return (
                  <tr key={contract.id} className="cursor-pointer transition-colors hover:bg-slate-50" onClick={() => onOpenContract(contract)}>
                    <td className="px-6 py-4 text-sm font-semibold text-[#004bb4]">{contract.contractNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{contract.contractType}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{String(statusText)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="font-medium">{formatDate(contract.startDate)}</div>
                      <div className="text-xs text-slate-400">{formatDate(contract.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatCurrency(contract.creditLimit ?? contract.credit?.creditLimit, contract.currency)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{contract.packages?.length ?? 0}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenContract(contract)
                        }}
                        className="flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800"
                      >
                        <FileText className="h-4 w-4" />
                        View Contract
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#004bb4]">{icon}</div>
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
      </div>
      <p className="mt-4 truncate text-[22px] font-bold text-slate-800">{value}</p>
    </div>
  )
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  )
}
