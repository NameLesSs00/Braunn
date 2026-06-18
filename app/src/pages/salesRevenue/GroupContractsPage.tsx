import { useState, useEffect } from 'react'
import { motion, Variants } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Search, Plus, Edit2, Trash2, CalendarClock } from 'lucide-react'
import { CreateGroupContractPopup } from './popups/groupContracts/CreateGroupContractPopup'
import { EditGroupContractPopup } from './popups/groupContracts/EditGroupContractPopup'
import { AnimatedCounter } from './components/AnimatedCounter'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchGroupContracts, removeGroupContract, releaseGroupContractAction } from '../../features/GroupContract/GroupContractSlice'
import Swal from 'sweetalert2'


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  },
}

export function GroupContractsPage() {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.groupContract);

  useEffect(() => {
    dispatch(fetchGroupContracts());
  }, [dispatch]);

  const groupContractsData = items.map((item) => {
    const picked = item.pickupRooms || 0;
    const total = item.blockedRooms || 0;
    const percentage = total > 0 ? Math.round((picked / total) * 100) : 0;
    
    const formatDateSafe = (dateStr?: string) => {
      if (!dateStr) return '';
      const cleanStr = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(cleanStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
    };

    return {
      id: item.id,
      name: item.groupName,
      arrival: formatDateSafe(item.arrivalDate),
      departure: formatDateSafe(item.departureDate),
      blockedRooms: `${total} rooms`,
      pickup: { picked, total, percentage },
      releaseDate: formatDateSafe(item.departureDate), 
      status: (item.status || 'pending').toLowerCase(),
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">Confirmed</span>;
      case 'active':
        return <span className="px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-full border border-blue-100">Active</span>;
      case 'pending':
        return <span className="px-3 py-1 text-[11px] font-bold text-amber-600 bg-amber-50 rounded-full border border-amber-100">Pending</span>;
      case 'tentative':
        return <span className="px-3 py-1 text-[11px] font-bold text-purple-600 bg-purple-50 rounded-full border border-purple-100">Tentative</span>;
      case 'cancelled':
        return <span className="px-3 py-1 text-[11px] font-bold text-red-500 bg-red-50 rounded-full border border-red-100">Cancelled</span>;
      case 'completed':
        return <span className="px-3 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">Completed</span>;
      default:
        return <span className="px-3 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">{status}</span>;
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 50) return 'text-orange-500';
    return 'text-blue-500';
  };

  const handleDeleteContract = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeGroupContract(id)).unwrap()
          .then(() => {
            Swal.fire('Deleted!', 'The group contract has been deleted.', 'success');
          })
          .catch((err) => {
            Swal.fire('Error!', err || 'Failed to delete contract', 'error');
          });
      }
    });
  };

  const handleReleaseContract = (id: string) => {
    Swal.fire({
      title: 'Release Group Contract?',
      text: 'This will release all remaining blocked rooms that have not been picked up.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, release it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(releaseGroupContractAction(id)).unwrap()
          .then(() => {
            Swal.fire('Released!', 'The group contract has been released.', 'success');
          })
          .catch((err) => {
            Swal.fire('Error!', err || 'Failed to release contract', 'error');
          });
      }
    });
  };

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
      
      {/* Search and Action */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 justify-between">
        <div className="relative max-w-2xl w-full">
          <input 
            type="text" 
            placeholder="Search group contracts..." 
            className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
        
        <button 
          onClick={() => setIsCreatePopupOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Group Contract
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Groups</h3>
          <p className="text-[28px] leading-tight font-bold text-slate-800 mt-2">
            <AnimatedCounter valueStr="15" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Blocked Rooms</h3>
          <p className="text-[28px] leading-tight font-bold text-slate-800 mt-2">
            <AnimatedCounter valueStr="245" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Rooms Picked Up</h3>
          <p className="text-[28px] leading-tight font-bold text-slate-800 mt-2">
            <AnimatedCounter valueStr="198" />
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Average Pickup %</h3>
          <p className="text-[28px] leading-tight font-bold text-slate-800 mt-2">
            <AnimatedCounter valueStr="80.8%" />
          </p>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f4f7fb]">
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm rounded-tl-xl">Group Name</th>
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Arrival Date</th>
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Departure Date</th>
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Blocked Rooms</th>
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm w-48">Pickup</th>
              <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Release Date</th>
              <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Status</th>
              <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groupContractsData.map((group) => (
              <tr key={group.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-5">
                  <span className="font-semibold text-slate-800 block w-40 break-words leading-snug">
                    {group.name}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-500 text-sm">{group.arrival}</td>
                <td className="px-6 py-5 text-slate-500 text-sm">{group.departure}</td>
                <td className="px-6 py-5 text-slate-600 text-sm">{group.blockedRooms}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-800 text-sm">
                        <AnimatedCounter valueStr={group.pickup.picked.toString()} />/<AnimatedCounter valueStr={group.pickup.total.toString()} />
                      </span>
                      <span className={`text-xs font-bold ${getProgressTextColor(group.pickup.percentage)}`}>
                        (<AnimatedCounter valueStr={`${group.pickup.percentage}%`} />)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${getProgressBarColor(group.pickup.percentage)}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${group.pickup.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, type: 'spring', bounce: 0 }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-sm">{group.releaseDate}</td>
                <td className="px-5 py-5">
                  {getStatusBadge(group.status)}
                </td>
                <td className="px-5 py-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedContractId(group.id); }}
                      className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 focus:outline-none"
                      title="Edit Contract"
                    >
                      <Edit2 className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                    {group.status !== 'released' && group.status !== 'cancelled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReleaseContract(group.id); }}
                        className="text-amber-500 hover:text-amber-700 transition-colors p-1.5 focus:outline-none"
                        title="Release Contract"
                      >
                        <CalendarClock className="w-[18px] h-[18px]" strokeWidth={2} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteContract(group.id); }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 focus:outline-none"
                      title="Delete Contract"
                    >
                      <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {isCreatePopupOpen && (
        <CreateGroupContractPopup onClose={() => setIsCreatePopupOpen(false)} />
      )}
      
      {selectedContractId && (
        <EditGroupContractPopup 
          contractId={selectedContractId} 
          onClose={() => setSelectedContractId(null)} 
        />
      )}
    </motion.div>
  )
}

