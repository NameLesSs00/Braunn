import { useState, useEffect, useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Plus, Search, ChevronDown, Eye, Edit2, BedDouble, Users, Image as ImageIcon, DollarSign } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { AddRoomTypePopup } from './popups/AddRoomTypePopup'
import { EditRoomTypePopup } from './popups/EditRoomTypePopup'
import { ViewRoomTypePopup } from './popups/ViewRoomTypePopup'

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

// Map viewType integers to readable strings
const getViewTypeName = (viewType: number) => {
  switch (viewType) {
    case 1: return 'Sea View'
    case 2: return 'Garden View'
    case 3: return 'City View'
    case 4: return 'Pool View'
    default: return 'Standard View'
  }
}

export function RoomTypesPage() {
  const dispatch = useAppDispatch()
  const { items: roomTypes, status } = useAppSelector(s => s.roomTypes)

  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRoomTypes())
    }
  }, [dispatch, status])

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter(rt => rt.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [roomTypes, searchQuery])

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
      
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Room Categories</h1>
          <p className="text-slate-500 mt-1">Manage room categories, pricing, and availability</p>
        </div>
        <button 
          onClick={() => setIsAddPopupOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by category name..." 
            className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:border-[#004bb4] transition-all shadow-sm placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <select className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl px-5 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:border-[#004bb4] transition-all shadow-sm cursor-pointer">
            <option>All Views</option>
            <option>Sea View</option>
            <option>Garden View</option>
            <option>City View</option>
            <option>Pool View</option>
          </select>
          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full translate-x-8 -translate-y-8 opacity-50 pointer-events-none"></div>
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 z-10">
            <BedDouble className="w-7 h-7 text-[#004bb4]" />
          </div>
          <div className="z-10">
            <p className="text-3xl font-bold text-slate-800">{roomTypes.length}</p>
            <h3 className="text-slate-500 font-medium text-sm mt-0.5">Total Categories</h3>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 opacity-50 pointer-events-none"></div>
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 z-10">
            <Users className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="z-10">
            <p className="text-3xl font-bold text-slate-800">
              {roomTypes.reduce((acc, rt) => acc + rt.maxGuests, 0)}
            </p>
            <h3 className="text-slate-500 font-medium text-sm mt-0.5">Total Guest Capacity</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full translate-x-8 -translate-y-8 opacity-50 pointer-events-none"></div>
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 z-10">
            <DollarSign className="w-7 h-7 text-purple-600" />
          </div>
          <div className="z-10">
            <p className="text-3xl font-bold text-slate-800">
              ${roomTypes.reduce((acc, rt) => acc + rt.basePrice, 0)}
            </p>
            <h3 className="text-slate-500 font-medium text-sm mt-0.5">Base Revenue Potential</h3>
          </div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <svg className="animate-spin h-8 w-8 mb-4 text-[#004bb4]" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
             </svg>
             <p>Loading categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Max Occupancy</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">View Type</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Base Price</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoomTypes.length > 0 ? (
                  filteredRoomTypes.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#004bb4]/5 flex items-center justify-center border border-[#004bb4]/10">
                            <BedDouble className="w-5 h-5 text-[#004bb4]" />
                          </div>
                          <span className="font-bold text-slate-800 text-[14px]">{room.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          <Users className="w-3.5 h-3.5" />
                          {room.maxGuests} Guests
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                          {getViewTypeName(room.viewType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#004bb4] text-[15px]">${room.basePrice}</span>
                        <span className="text-slate-400 text-[11px] ml-1 uppercase">/night</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded-md">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button 
                            onClick={() => setIsViewPopupOpen(true)}
                            className="p-1.5 hover:text-[#004bb4] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
                          </button>
                          <button 
                            onClick={() => setIsEditPopupOpen(true)}
                            className="p-1.5 hover:text-[#004bb4] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-[18px] h-[18px]" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No categories found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Popups */}
      {isAddPopupOpen && <AddRoomTypePopup onClose={() => setIsAddPopupOpen(false)} />}
      {isEditPopupOpen && <EditRoomTypePopup onClose={() => setIsEditPopupOpen(false)} />}
      {isViewPopupOpen && <ViewRoomTypePopup onClose={() => setIsViewPopupOpen(false)} />}
    </motion.div>
  )
}
