import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Edit2, Copy, CalendarPlus, ChevronLeft, ChevronRight, Edit3, EyeOff, Eye, Calendar, TrendingUp, Check } from 'lucide-react'
import { AddSeasonalPricingPopup } from './popups/RateCalendarPage/AddSeasonalPricingPopup'
import { CopyWeekRatesPopup } from './popups/RateCalendarPage/CopyWeekRatesPopup'
import { EditRatePopup } from './popups/RateCalendarPage/EditRatePopup'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { getLocalARIRates } from '../../shared/apis/LocalAri'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths } from 'date-fns'

function cellKey(roomIdx: number, dateIdx: number) {
  return `${roomIdx}:${dateIdx}`
}

export type { LocalARIRate } from '../../models/LocalAri'

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

export function RateCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [ratesByRoom, setRatesByRoom] = useState<Record<string, LocalARIRate[]>>({})
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [isRulesVisible, setIsRulesVisible] = useState(true)
  const [isAddPricingOpen, setIsAddPricingOpen] = useState(false)
  const [isCopyWeekOpen, setIsCopyWeekOpen] = useState(false)
  const [isEditRateOpen, setIsEditRateOpen] = useState(false)

  const [editingSingleDay, setEditingSingleDay] = useState<{
    roomTypeId: string;
    roomTypeName: string;
    date: string;
    ratePlanCode: string;
    currentBaseRate?: number;
  } | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const refetchRates = () => setRefreshTrigger(prev => prev + 1)

  const dispatch = useAppDispatch()
  const { items: roomTypesData } = useAppSelector(state => state.roomTypes)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('')

  useEffect(() => {
    dispatch(fetchRoomTypes())
  }, [dispatch])

  // Set default selected room type when roomTypesData is loaded
  useEffect(() => {
    if (roomTypesData.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(roomTypesData[0].id)
    }
  }, [roomTypesData, selectedRoomTypeId])

  // Clear selections when room type changes
  useEffect(() => {
    setSelectedCells(new Set())
  }, [selectedRoomTypeId])

  const selectedRoom = useMemo(() => {
    return roomTypesData.find(room => room.id === selectedRoomTypeId)
  }, [roomTypesData, selectedRoomTypeId])

  const displayedRoomTypes = useMemo(() => {
    return selectedRoom ? [selectedRoom] : []
  }, [selectedRoom])

  const dates = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      day: date.getDate(),
      name: format(date, 'EEE'),
      dateStr: format(date, 'MMM d'),
      isWeekend: isWeekend(date),
      formattedDate: format(date, 'yyyy-MM-dd')
    }))
  }, [currentDate])

  useEffect(() => {
    const fetchSelectedRates = async () => {
      if (!selectedRoomTypeId) return
      
      setIsLoadingRates(true)
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      
      try {
        const rates = await getLocalARIRates({
          roomTypeId: selectedRoomTypeId,
          ratePlanCode: 'BAR',
          startDate: start,
          endDate: end,
          roomCount: 1,
          adults: 1,
          children: 0,
          extraBeds: 0
        })
        setRatesByRoom({ [selectedRoomTypeId]: rates })
      } catch (error) {
        console.error('Failed to fetch rates', error)
        setRatesByRoom({})
      } finally {
        setIsLoadingRates(false)
      }
    }
    
    fetchSelectedRates()
  }, [currentDate, selectedRoomTypeId, refreshTrigger])

  const [selectedCells, setSelectedCells] = useState<Set<string>>(() => new Set())
  const selectedCount = selectedCells.size

  const toggleCellSelection = (roomIdx: number, dateIdx: number) => {
    setSelectedCells((prev) => {
      const next = new Set(prev)
      const key = cellKey(roomIdx, dateIdx)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleColumnSelection = (dateIdx: number) => {
    setSelectedCells((prev) => {
      const next = new Set(prev)
      const columnKeys = displayedRoomTypes.map((_, roomIdx) => cellKey(roomIdx, dateIdx))
      const isColumnFullySelected = columnKeys.every((k) => next.has(k))
      for (const k of columnKeys) {
        if (isColumnFullySelected) next.delete(k)
        else next.add(k)
      }
      return next
    })
  }

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1))

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="space-y-6">
        <motion.div variants={itemVariants}>
          <TabNav />
        </motion.div>
        
        {/* Top Actions */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-semibold text-sm">Room Type:</span>
            <div className="relative inline-block">
              <select
                value={selectedRoomTypeId}
                onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#004bb4] shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[200px]"
              >
                {roomTypesData.length === 0 ? (
                  <option value="">Loading room types...</option>
                ) : (
                  roomTypesData.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={() => setIsEditRateOpen(true)}
              disabled={selectedCount === 0}
              className={[
                'flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg transition-colors font-medium',
                selectedCount === 0
                  ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <Edit2 className="w-4 h-4" />
              Bulk Edit ({selectedCount})
            </button>
            <button 
              onClick={() => setIsCopyWeekOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy Week
            </button>
            <button 
              onClick={() => setIsAddPricingOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#004bb4] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              <CalendarPlus className="w-4 h-4" />
              Add Seasonal Pricing
            </button>
          </div>
        </motion.div>

        {/* Date Navigation & Legend */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={handleNextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              Legend:
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <div className="w-4 h-4 rounded bg-[#f0f4f8]"></div>
              Weekend
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium text-xs">
                -15%
              </span>
              Active Discount
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div variants={itemVariants} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header Row */}
              <div className="flex border-b border-slate-200 divide-x divide-slate-200 text-center">
                <div className="p-4 bg-[#f8fafc] font-semibold text-slate-700 flex items-center justify-center w-40 flex-shrink-0 sticky left-0 z-10 border-r border-slate-200">
                  Room Type
                </div>
                {dates.map((date, idx) => (
                  <div 
                    key={idx} 
                    className={[
                      'p-3 cursor-pointer select-none w-28 flex-shrink-0',
                      date.isWeekend ? 'bg-[#f0f4f8]' : 'bg-white',
                    ].join(' ')}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select column ${date.dateStr}`}
                    onClick={() => toggleColumnSelection(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggleColumnSelection(idx)
                    }}
                  >
                    <div className="font-semibold text-slate-800">{date.dateStr}</div>
                    <div className="text-sm text-slate-400">{date.name}</div>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-slate-200 relative">
                {isLoadingRates && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#004bb4] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {displayedRoomTypes.map((room, idx) => (
                  <div key={room.id} className="flex divide-x divide-slate-200">
                    <div className="p-4 flex items-center font-semibold text-slate-800 bg-white w-40 flex-shrink-0 sticky left-0 z-10 border-r border-slate-200">
                      {room.name}
                    </div>
                    
                    {dates.map((date, rIdx) => {
                      const isWeekend = date.isWeekend;
                      const isSelected = selectedCells.has(cellKey(idx, rIdx))
                      const rateData = ratesByRoom[room.id]?.find(r => r.date && r.date.substring(0, 10) === date.formattedDate)
                      
                      return (
                        <div 
                          key={rIdx} 
                          onClick={() => toggleCellSelection(idx, rIdx)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Select ${room.name} ${date.dateStr}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') toggleCellSelection(idx, rIdx)
                          }}
                          className={[
                            'p-4 relative group transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-28 flex-shrink-0 flex flex-col justify-between',
                            isWeekend ? 'bg-[#f0f4f8]/50' : 'bg-white',
                            isSelected
                              ? 'bg-blue-50/70 ring-2 ring-[#004bb4]/35 shadow-[inset_0_0_0_1px_rgba(0,75,180,0.12)]'
                              : 'hover:ring-1 hover:ring-blue-400',
                          ].join(' ')}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {isSelected ? <Check className="w-4 h-4 text-[#004bb4]" aria-hidden="true" /> : null}
                              <div className="font-bold text-slate-800">
                                {rateData ? `${rateData.amountAfterTax}$` : '-----$'}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSingleDay({
                                  roomTypeId: room.id,
                                  roomTypeName: room.name,
                                  date: date.formattedDate,
                                  ratePlanCode: 'BAR',
                                  currentBaseRate: rateData?.originalBaseRate || rateData?.amountAfterTax || 0
                                });
                                setIsEditRateOpen(true);
                              }}
                              className="hover:bg-slate-100 p-1 -m-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                          <div className="text-sm text-slate-500 mt-1 truncate">
                            {rateData?.finalRateAfterTax ? `Corp: ${rateData.finalRateAfterTax}$` : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seasonal Pricing Rules Section */}
      <motion.div variants={itemVariants} className="mt-12">
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-800">Seasonal Pricing Rules</h3>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
              1 Active
            </span>
          </div>
          <button 
            onClick={() => setIsRulesVisible(!isRulesVisible)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            {isRulesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isRulesVisible ? 'Hide' : 'show'}
          </button>
        </div>

        {isRulesVisible && (
          <div className="space-y-6 mt-6">

            <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h4 className="text-xl font-bold text-slate-800">Christmas & New Year 2025</h4>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                    Holiday/Event
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-slate-500 mt-2 text-sm">
                Premium pricing for holiday season with increased demand
              </p>
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 p-4 bg-[#f8fafc] rounded-lg flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Calendar className="w-5 h-5 text-slate-400" />
              2025-12-20 - 2026-01-05
            </div>
            <div className="text-slate-500 text-sm font-medium">All Days</div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            {[
              { type: 'Standard', old: '€120', new: '€162', increase: '+35%' },
              { type: 'Deluxe', old: '€160', new: '€216', increase: '+35%' },
              { type: 'Suite', old: '€240', new: '€336', increase: '+40%' }
            ].map((rule, idx) => (
              <div key={idx} className="border border-slate-100/80 rounded-xl p-5 bg-[#fbfcfd]">
                <h5 className="text-slate-500 font-medium mb-4">{rule.type}</h5>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-slate-400 line-through text-lg">{rule.old}</span>
                  <span className="text-3xl font-bold text-slate-800 leading-none">{rule.new}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-3">
                  <TrendingUp className="w-4 h-4" /> {rule.increase}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
              <span>Min Stay: 3N</span>
              <span>Policy: Strict</span>
              <span>Priority: 9</span>
            </div>
            <button className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold">
              Deactivate
            </button>
          </div>
        </div>

            {/* Summer Peak Rule Card */}
            <div className="border border-slate-200 rounded-xl bg-white p-6 shadow-sm opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h4 className="text-xl font-bold text-slate-800">Summer Peak 2026</h4>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    High Season
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                    Upcoming
                  </span>
                </div>
              </div>
              <p className="text-slate-500 mt-2 text-sm">
                High season pricing for summer vacation period
              </p>
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 p-4 bg-[#f8fafc] rounded-lg flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <Calendar className="w-5 h-5 text-slate-400" />
              2026-06-15 - 2026-08-31
            </div>
            <div className="text-slate-500 text-sm font-medium">All Days</div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            {[
              { type: 'Standard', old: '€120', new: '€150', increase: '+25%' },
              { type: 'Deluxe', old: '€160', new: '€200', increase: '+25%' },
              { type: 'Suite', old: '€240', new: '€312', increase: '+30%' }
            ].map((rule, idx) => (
              <div key={idx} className="border border-slate-100/80 rounded-xl p-5 bg-[#fbfcfd]">
                <h5 className="text-slate-500 font-medium mb-4">{rule.type}</h5>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-slate-400 line-through text-lg">{rule.old}</span>
                  <span className="text-3xl font-bold text-slate-800 leading-none">{rule.new}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-3">
                  <TrendingUp className="w-4 h-4" /> {rule.increase}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
              <span>Min Stay: 2N</span>
              <span>Policy: Moderate</span>
              <span>Priority: 7</span>
            </div>
            <button className="px-5 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold">
              Activate
            </button>
          </div>
            </div>
          </div>
        )}
      </motion.div>

      <AddSeasonalPricingPopup 
        isOpen={isAddPricingOpen} 
        onClose={() => setIsAddPricingOpen(false)} 
      />
      <CopyWeekRatesPopup 
        isOpen={isCopyWeekOpen} 
        onClose={() => setIsCopyWeekOpen(false)} 
      />
      <EditRatePopup
        isOpen={isEditRateOpen}
        onClose={() => {
          setIsEditRateOpen(false)
          setEditingSingleDay(undefined)
          // Keep selections by default; uncomment if you want bulk edit to clear selection on close.
          // setSelectedCells(new Set())
        }}
        singleDayData={editingSingleDay}
        onSaveSuccess={refetchRates}
      />
    </motion.div>
  )
}
