import { useState } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Plus, Search, ChevronDown, Eye, Edit2 } from 'lucide-react'
import { AddRoomTypePopup } from './popups/AddRoomTypePopup'
import { EditRoomTypePopup } from './popups/EditRoomTypePopup'
import { ViewRoomTypePopup } from './popups/ViewRoomTypePopup'

const tableData = [
  { name: 'Standard Room', code: 'STD', occupancy: '2 Adults', isActive: true },
  { name: 'Deluxe Room', code: 'DLX', occupancy: '2 Adults', isActive: true },
  { name: 'Suite', code: 'STE', occupancy: '2 Adults', isActive: true },
  { name: 'Family Room', code: 'FAM', occupancy: '2 Adults + 2 Children', isActive: true },
];

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

export function RoomTypesPage() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);

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
          <h1 className="text-3xl font-bold text-slate-800">Room Types</h1>
          <p className="text-slate-500 mt-1">Manage room categories, pricing, and availability</p>
        </div>
        <button 
          onClick={() => setIsAddPopupOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Room Type
        </button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search by room type" 
            className="w-full bg-[#f4f3f8] text-slate-700 rounded-xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        <div className="relative min-w-[200px]">
          <select className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl px-5 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-slate-500 font-medium">Total Room Types</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">5</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-slate-500 font-medium">Active</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">4</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-slate-500 font-medium">Inactive</h3>
          <p className="text-3xl font-bold text-slate-600 mt-2">1</p>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl mt-6 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-[#fbfcfd]">
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Room Type</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Room Type Code</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Max Occupancy</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tableData.map((room, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white">
                <td className="px-6 py-4 font-semibold text-slate-800 text-sm">{room.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
                    {room.code}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm font-medium">{room.occupancy}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Fake Toggle Switch */}
                    <div className={`w-10 h-[22px] rounded-full flex items-center p-1 cursor-pointer transition-colors ${room.isActive ? 'bg-[#004bb4]' : 'bg-slate-300'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${room.isActive ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                    </div>
                    {room.isActive && (
                      <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-md">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-5 text-slate-500">
                    <button 
                      onClick={() => setIsViewPopupOpen(true)}
                      className="hover:text-slate-800 transition-colors"
                    >
                      <Eye className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => setIsEditPopupOpen(true)}
                      className="hover:text-slate-800 transition-colors"
                    >
                      <Edit2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Popups */}
      {isAddPopupOpen && <AddRoomTypePopup onClose={() => setIsAddPopupOpen(false)} />}
      {isEditPopupOpen && <EditRoomTypePopup onClose={() => setIsEditPopupOpen(false)} />}
      {isViewPopupOpen && <ViewRoomTypePopup onClose={() => setIsViewPopupOpen(false)} />}
    </motion.div>
  )
}
