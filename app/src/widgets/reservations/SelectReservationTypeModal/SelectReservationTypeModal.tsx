import { X, Building2, Globe, User, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface SelectReservationTypeModalProps {
  open: boolean
  onClose: () => void
  onSelectIndividual: () => void
  onSelectCorporate?: () => void
  onSelectOta?: () => void
  onSelectGroup?: () => void
}

export function SelectReservationTypeModal({ open, onClose, onSelectIndividual, onSelectCorporate, onSelectOta, onSelectGroup }: SelectReservationTypeModalProps) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-[700px] rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="pt-8 px-8 pb-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-[#004bb4] mb-2">Select Reservation Type</h2>
            <p className="text-slate-500 text-sm">Choose the type of reservation you want to create</p>
          </div>

          {/* Body */}
          <div className="p-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Corporate account */}
              <button
                onClick={() => {
                  onClose();
                  onSelectCorporate?.();
                }}
                className="flex flex-col items-center text-center p-8 border border-indigo-100 rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all group bg-white"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-indigo-700" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Corporate account</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Book for companies and business accounts</p>
              </button>

              {/* OTA */}
              <button 
                onClick={() => {
                  onClose();
                  onSelectOta?.();
                }}
                className="flex flex-col items-center text-center p-8 border border-rose-100 rounded-2xl hover:shadow-md hover:border-rose-300 transition-all group bg-white"
              >
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-rose-800" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">OTA</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Online travel Agency reservations</p>
              </button>

              {/* Individual */}
              <button 
                onClick={() => {
                  onClose();
                  onSelectIndividual();
                }}
                className="flex flex-col items-center text-center p-8 border border-emerald-100 rounded-2xl hover:shadow-md hover:border-emerald-300 transition-all group bg-white"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Individual</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Book for individual customers</p>
              </button>

              {/* Group reservation */}
              <button
                onClick={() => {
                  onClose();
                  onSelectGroup?.();
                }}
                className="flex flex-col items-center text-center p-8 border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all group bg-white"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Group reservation</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">Book for groups and multiple rooms</p>
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
