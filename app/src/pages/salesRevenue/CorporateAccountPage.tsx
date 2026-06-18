import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Plus, Search, ChevronDown, Download, MoreVertical, FileText, Edit, RefreshCw, Pause, Trash2 } from 'lucide-react'
import { CorporateAccountDetails } from './CorporateAccountDetails'
import { AddCorporateAccountPopup } from './popups/corporateAccount/AddCorporateAccountPopup'
import { EditCorporateAccountPopup } from './popups/corporateAccount/EditCorporateAccountPopup'
import { RenewContractPopup } from './popups/corporateAccount/RenewContractPopup'
import { AnimatedCounter } from './components/AnimatedCounter'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCorporateAccounts, removeCorporateAccount } from '../../features/corporateAccounts/corporateAccountsSlice'
import Swal from 'sweetalert2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  },
}

export function CorporateAccountPage() {
  const dispatch = useAppDispatch();
  const { items: accounts, status, error } = useAppSelector((state) => state.corporateAccounts);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [renewingAccountId, setRenewingAccountId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchCorporateAccounts());
  }, [dispatch]);

  const handleDeleteAccount = (id: string, name: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the corporate account "${name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeCorporateAccount(id))
          .unwrap()
          .then(() => {
            Swal.fire(
              'Deleted!',
              'The corporate account has been deleted.',
              'success'
            );
          })
          .catch((err) => {
            Swal.fire(
              'Failed!',
              err || 'Could not delete corporate account.',
              'error'
            );
          });
      }
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="px-3 py-1 font-semibold text-emerald-600 bg-emerald-100/50 rounded-full">active</span>;
    } else {
      return <span className="px-3 py-1 font-semibold text-slate-600 bg-slate-100 rounded-full">inactive</span>;
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = (account.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mappedStatus = account.isActive ? 'Active' : 'Inactive';
    const matchesStatus = statusFilter === 'All status' || mappedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedAccountId) {
    return (
      <motion.div 
        className="space-y-8 pb-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <TabNav />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CorporateAccountDetails 
            accountId={selectedAccountId} 
            onBack={() => setSelectedAccountId(null)} 
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <TabNav />
      </motion.div>
      
      {/* Search and Actions */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex-1 relative max-w-xl">
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative min-w-[140px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm font-medium"
            >
              <option>All status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>

          <button 
            onClick={() => setIsAddPopupOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Corporate Account
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Accounts</h3>
          <p className="text-[28px] leading-tight font-bold text-slate-800 mt-2">
            <AnimatedCounter valueStr={accounts.length.toString()} />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Active Contracts</h3>
          <p className="text-[28px] leading-tight font-bold text-emerald-500 mt-2">
            <AnimatedCounter valueStr={accounts.filter(a => a.isActive).length.toString()} />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Production</h3>
          <p className="text-[28px] leading-tight font-bold text-[#004bb4] mt-2">
            <AnimatedCounter valueStr="-------" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Active Reservations</h3>
          <p className="text-[28px] leading-tight font-bold text-orange-500 mt-2">
            <AnimatedCounter valueStr="-------" />
          </p>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl overflow-visible shadow-sm">
        {status === 'loading' && accounts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Loading corporate accounts...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error loading corporate accounts: {error}</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No corporate accounts found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f4f7fb]">
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm rounded-tl-xl w-[20%]">Company Name</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Contract Period</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Negotiated Rate</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Active Reservations</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Production</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-center rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => {
                const contractPeriod = account.contractStartDate && account.contractEndDate 
                  ? `${account.contractStartDate.split(' ')[0]} - ${account.contractEndDate.split(' ')[0]}` 
                  : '-------';
                const rate = account.negotiatedRate !== null && account.negotiatedRate !== undefined
                  ? `€${account.negotiatedRate}/night`
                  : '-------';
                return (
                  <tr 
                    key={account.id} 
                    onClick={() => setSelectedAccountId(account.id)}
                    className="hover:bg-slate-50/50 transition-colors bg-white cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-800 break-words line-clamp-2 leading-tight pr-4">
                        {account.companyName || '-------'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500 text-sm font-medium w-32">
                      <div className="break-words leading-snug">
                        {contractPeriod === '-------' ? '-------' : contractPeriod.split(' - ').map((item, i) => (
                          <div key={i}>{item}{i === 0 ? ' -' : ''}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#004bb4]">{rate}</td>
                    <td className="px-6 py-5 text-slate-500 text-sm">
                      <AnimatedCounter valueStr="-------" />
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">
                      <AnimatedCounter valueStr="-------" />
                    </td>
                    <td className="px-6 py-5 text-xs">
                      {getStatusBadge(account.isActive)}
                    </td>
                    <td className="px-6 py-5 text-center relative">
                      <button 
                        onClick={(e) => toggleDropdown(account.id, e)}
                        className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors inline-block"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Actions Dropdown */}
                      {openDropdownId === account.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-8 top-12 w-[180px] bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-10 py-2 text-left"
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedAccountId(account.id); }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            View Details
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setEditingAccountId(account.id);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Contract
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setRenewingAccountId(account.id);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-sm font-medium text-[#004bb4] transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Renew Contract
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-orange-50 text-sm font-medium text-orange-600 transition-colors"
                          >
                            <Pause className="w-4 h-4" />
                            Suspend Account
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              handleDeleteAccount(account.id, account.companyName || '-------');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {isAddPopupOpen && (
        <AddCorporateAccountPopup onClose={() => setIsAddPopupOpen(false)} />
      )}
      {editingAccountId && (
        <EditCorporateAccountPopup 
          account={accounts.find(a => a.id === editingAccountId)!} 
          onClose={() => setEditingAccountId(null)} 
        />
      )}
      {renewingAccountId && (
        <RenewContractPopup 
          account={accounts.find(a => a.id === renewingAccountId)!} 
          onClose={() => setRenewingAccountId(null)} 
        />
      )}
    </motion.div>
  )
}
