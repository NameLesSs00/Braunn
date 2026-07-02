import { useState, useEffect } from 'react'
import { ArrowLeft, Euro, Calendar, TrendingUp, Users, Plus, FileText, CalendarDays, BadgePercent, Coins, UserCircle2 } from 'lucide-react'
import { EditContractPopup } from './popups/corporateAccount/EditContractPopup'
import { AddCorporateContractPopup } from './popups/corporateAccount/AddCorporateContractPopup'
import { CorporateContractDetailsPopup } from './popups/corporateAccount/CorporateContractDetailsPopup'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCorporateAccountById } from '../../features/corporateAccounts/corporateAccountsSlice'
import { fetchCorporateContractsByAccount } from '../../features/corporateContracts/corporateContractSlice'
import type { CorporateContract } from '../../models/CorporateContract'

interface CorporateAccountDetailsProps {
  onBack: () => void;
  accountId: string;
}

export function CorporateAccountDetails({ onBack, accountId }: CorporateAccountDetailsProps) {
  const dispatch = useAppDispatch();
  const { selected, status, error } = useAppSelector((state) => state.corporateAccounts);
  const { items: contracts } = useAppSelector((state) => state.corporateContract);

  const tabs = [
    "Company Details",
    "Corporate Contracts",
    "Active Reservations",
    "Production Report",
    "Billing & Payment"
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddContractPopupOpen, setIsAddContractPopupOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<CorporateContract | null>(null);

  useEffect(() => {
    dispatch(fetchCorporateAccountById(accountId));
    dispatch(fetchCorporateContractsByAccount(accountId));
  }, [dispatch, accountId]);

  if (status === 'loading' && (!selected || selected.id !== accountId)) {
    return <div className="p-8 text-center text-slate-500">Loading account details...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium mb-4">Error loading account: {error}</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Back to Accounts
        </button>
      </div>
    );
  }

  if (!selected || selected.id !== accountId) {
    return <div className="p-8 text-center text-slate-500 text-sm font-semibold">Account not found.</div>;
  }

  const period = selected.contractStartDate && selected.contractEndDate
    ? `${selected.contractStartDate.split(' ')[0]} - ${selected.contractEndDate.split(' ')[0]}`
    : '-------';
  
  const discount = selected.discountPercentage !== null && selected.discountPercentage !== undefined
    ? `${selected.discountPercentage}% off BAR`
    : '-------';

  const negotiatedRate = selected.negotiatedRate !== null && selected.negotiatedRate !== undefined
    ? `€${selected.negotiatedRate}/night`
    : '-------';

  const creditLimit = selected.creditLimit !== null && selected.creditLimit !== undefined
    ? `€${selected.creditLimit}`
    : '-------';

  const account = {
    id: accountId,
    name: selected.companyName || '-------',
    period,
    revenue: "€0",
    activeReservations: 0,
    negotiatedRate,
    totalBookings: 0,
    contactPerson: selected.contactPerson || '-------',
    email: selected.email || '-------',
    phone: selected.phone || '-------',
    creditLimit,
    paymentTerms: selected.paymentTerms || '-------',
    discount,
  };


  // Mock Data for Active Reservations
  const activeReservations = Array.from({ length: 11 }, (_, i) => ({
    id: `R100${i}`,
    guest: "John Doe",
    checkIn: "12/18/2025",
    checkOut: "12/21/2025",
    roomType: "Deluxe",
    total: "$408"
  }));

  // Mock Data for Production Report
  const productionData = [
    { month: "December 2025", adr: "$150", roomNights: 45, total: "$6,750" },
    { month: "November 2025", adr: "$150", roomNights: 38, total: "$5,700" },
    { month: "October 2025", adr: "$150", roomNights: 52, total: "$7,800" },
  ];

  // Mock Data for Invoices
  const invoicesData = [
    { id: "INV-2025-001", date: "Dec 1, 2025", amount: "$6,750", status: "Paid" },
    { id: "INV-2025-002", date: "Nov 1, 2025", amount: "$5,700", status: "Paid" },
    { id: "INV-2025-003", date: "Oct 1, 2025", amount: "$7,800", status: "Paid" },
  ];
  return (
    <div className="space-y-6 pb-10 fade-in">
      {/* Top Nav */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Accounts
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{account.name}</h1>
          <p className="text-slate-500 mt-1">Contract Period: {account.period}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditPopupOpen(true)}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"
          >
            Edit Contract
          </button>
          <button className="px-4 py-2 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm">
            New Reservation
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                <Euro className="w-5 h-5" />
              </div>
              <h3 className="text-slate-500 font-medium text-sm">Total Revenue</h3>
            </div>
            <p className="text-[22px] font-bold text-slate-800 mt-4">{account.revenue}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-slate-500 font-medium text-sm">Active Reservations</h3>
            </div>
            <p className="text-[22px] font-bold text-slate-800 mt-4">{account.activeReservations}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-slate-500 font-medium text-sm">Negotiated Rate</h3>
            </div>
            <p className="text-[22px] font-bold text-slate-800 mt-4">{account.negotiatedRate}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-slate-500 font-medium text-sm">Total Bookings</h3>
            </div>
            <p className="text-[22px] font-bold text-slate-800 mt-4">{account.totalBookings}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-8 mt-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-600 rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm mt-6">
        {activeTab === "Company Details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Company Information */}
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800">Company Information</h2>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Company Name</p>
                <p className="font-medium text-slate-800">{account.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Contact Person</p>
                <p className="font-medium text-slate-800">{account.contactPerson}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-800">{account.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Phone</p>
                <p className="font-medium text-slate-800">{account.phone}</p>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-800">Contract Terms</h2>

              <div>
                <p className="text-sm text-slate-500 mb-1">Contract Period</p>
                <p className="font-medium text-slate-800">{account.period}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Credit Limit</p>
                <p className="font-medium text-slate-800">{account.creditLimit}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Payment Terms</p>
                <p className="font-medium text-slate-800">{account.paymentTerms}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Discount</p>
                <p className="font-bold text-emerald-600">{account.discount}</p>
              </div>
            </div>

          </div>
        )}

        {activeTab === "Corporate Contracts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Corporate Contracts</h2>
                <p className="text-sm text-slate-500">Manage all contracts created for this corporate account.</p>
              </div>
              <button
                onClick={() => setIsAddContractPopupOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#004bb4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Add Contract
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f8fafc]">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contract Number</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contract Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contract Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Deposit</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No contracts found for this account.</td>
                    </tr>
                  ) : (
                    contracts.map((contract) => (
                      <tr key={contract.id} className="cursor-pointer transition-colors hover:bg-slate-50" onClick={() => setSelectedContract(contract)}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#004bb4]">{contract.contractNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{contract.contractType}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{contract.contractStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{contract.depositAmount} {contract.currency}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          <button className="flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-800" onClick={(e) => { e.stopPropagation(); setSelectedContract(contract) }}>
                            <FileText className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Active Reservations" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-800">Active Reservations (12)</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Booking ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Guest Name</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Check-in</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Check-out</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Room Type</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-blue-600 hover:text-blue-800 cursor-pointer text-sm transition-colors">
                        {reservation.id}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm">{reservation.guest}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{reservation.checkIn}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{reservation.checkOut}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{reservation.roomType}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{reservation.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Production Report" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 mb-6">Monthly Production Report</h2>
            <div className="space-y-4">
              {productionData.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div>
                    <h3 className="font-semibold text-slate-800">{data.month}</h3>
                    <p className="text-sm text-slate-500 mt-1">ADR: {data.adr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">{data.roomNights} room nights</p>
                    <p className="text-lg font-bold text-[#004bb4]">{data.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Billing & Payment" && (
          <div className="space-y-8">
            {/* Payment Terms Section */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800">Payment Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Billing Method</p>
                  <p className="font-medium text-slate-800">Monthly Invoice</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payment Terms</p>
                  <p className="font-medium text-slate-800">Net 30 days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Credit Limit</p>
                  <p className="font-medium text-slate-800">$50,000</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                  <p className="font-bold text-emerald-500">$0.00</p>
                </div>
              </div>
            </div>

            {/* Recent Invoices Section */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800">Recent Invoices</h2>
              <div className="space-y-4">
                {invoicesData.map((invoice, index) => (
                  <div key={index} className="flex justify-between items-center p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">{invoice.id}</h3>
                      <p className="text-sm text-slate-500 mt-1">{invoice.date}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-slate-800 mb-1">{invoice.amount}</p>
                      <span className="px-3 py-1 font-semibold text-emerald-600 bg-emerald-100/50 rounded-full text-xs">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== "Company Details" && activeTab !== "Corporate Contracts" && activeTab !== "Active Reservations" && activeTab !== "Production Report" && activeTab !== "Billing & Payment" && (
          <div className="py-20 text-center">
            <h3 className="text-lg font-medium text-slate-800 mb-2">{activeTab}</h3>
            <p className="text-slate-500">This section is under construction.</p>
          </div>
        )}
      </div>

      {isEditPopupOpen && (
        <EditContractPopup 
          companyName={account.name}
          onClose={() => setIsEditPopupOpen(false)} 
        />
      )}
      {isAddContractPopupOpen && (
        <AddCorporateContractPopup
          accountId={accountId}
          onClose={() => setIsAddContractPopupOpen(false)}
        />
      )}
      {selectedContract && (
        <CorporateContractDetailsPopup
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  )
}
