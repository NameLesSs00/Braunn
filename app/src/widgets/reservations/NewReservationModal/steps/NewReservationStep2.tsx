import { IconImage } from '../../../../shared/ui/IconImage'
import { useMemo, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { fetchFinancialServices, fetchFinancialDiscounts } from '../../../../features/adminFinancialSettings/financialSettingsSlice'
import { fetchLocalARIRates } from '../../../../features/localAri/localAriSlice'
import { fetchRatePlans } from '../../../../features/ratePlans/ratePlansSlice'
import { fetchRoomsAvailability } from '../../../../features/rooms/roomsSlice'
import { fetchMealPlans } from '../../../../features/admin/mealPlansSlice'
import { MdDateRange } from "react-icons/md";
import type { IconType } from "react-icons";




import { Trash2, RefreshCw } from 'lucide-react'

import type { ReservationDraft } from '../../../../features/reservations/draftSlice'

type LabeledProps = {
  label: string
  required?: boolean
  children: React.ReactNode
}

function Labeled({ label, required, children }: LabeledProps) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </div>
      {children}
    </label>
  )
}

type ControlProps = {
  placeholder?: string
  leftIconSrc?: string | IconType
  right?: 'caret' | 'none'
  type?: 'text' | 'date'
  value?: string
  disabled?: boolean
  min?: string
  max?: string
  onChange?: (value: string) => void
}

function InputControl({
  placeholder,
  leftIconSrc,
  right = 'none',
  type = 'text',
  value,
  disabled,
  min,
  max,
  onChange,
}: ControlProps) {
  return (
    <div className="relative">
      {leftIconSrc ? (
        <IconImage
          src={leftIconSrc}
          alt=""
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
        />
      ) : null}
      <input
        className={[
          'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]',
          type === 'date' ? '[&::-webkit-calendar-picker-indicator]:opacity-0' : '',
          leftIconSrc ? 'pl-11' : '',
          right !== 'none' ? 'pr-11' : '',
          disabled ? 'bg-slate-50 text-slate-500' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        placeholder={placeholder}
        type={type}
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={(e) => {
          if (type !== 'date') return
          if ('showPicker' in e.currentTarget) {
            ; (e.currentTarget as HTMLInputElement & { showPicker: () => void }).showPicker()
          }
        }}
      />
      {right === 'caret' ? (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      ) : null}
    </div>
  )
}

type SelectOption = {
  value: string
  label: string
}

function SelectControlWithOptions({
  options,
  value,
  onChange,
}: {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="">select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </span>
    </div>
  )
}

type CounterProps = {
  label: string
  value: number
  priceText?: string
  onIncrease: () => void
  onDecrease: () => void
}

function Counter({ label, value, priceText, onIncrease, onDecrease }: CounterProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full border border-[#0B4EA2] text-[#0B4EA2]"
          onClick={onIncrease}
        >
          +
        </button>
        <div className="min-w-6 text-center text-sm font-semibold text-slate-800">{value}</div>
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-full border border-rose-400 text-rose-500"
          onClick={onDecrease}
        >
          −
        </button>
        {priceText !== undefined && (
          <div className="text-sm font-semibold text-slate-700 min-w-[60px] text-right">{priceText}</div>
        )}
      </div>
    </div>
  )
}
type Props = {
  value: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
}

export function NewReservationStep2({ value, onChange }: Props) {
  const dispatch = useAppDispatch()
  const roomTypesState = useAppSelector((state) => state.roomTypes)
  const localAriState = useAppSelector((state) => state.localAri)
  const roomsState = useAppSelector((state) => state.rooms)
  const ratePlansState = useAppSelector((state) => state.ratePlans)
  const financialSettings = useAppSelector((state) => state.financialSettings)
  const mealPlansState = useAppSelector((state) => state.mealPlans)
  const hasFetchedMealPlans = useRef(false)


  useEffect(() => {
    if (roomTypesState.status === 'idle') {
      dispatch(fetchRoomTypes())
    }
    if (ratePlansState.status === 'idle') {
      dispatch(fetchRatePlans())
    }
  }, [dispatch, roomTypesState.status, ratePlansState.status])

  useEffect(() => {
    if (financialSettings.status === 'idle') {
      dispatch(fetchFinancialServices())
      dispatch(fetchFinancialDiscounts())
    }
    if (mealPlansState.status === 'idle' || (mealPlansState.status === 'failed' && !hasFetchedMealPlans.current)) {
      hasFetchedMealPlans.current = true
      dispatch(fetchMealPlans())
    }
  }, [dispatch, financialSettings.status, mealPlansState.status])

  useEffect(() => {
    const roomTypeId = value.rooms[0]?.roomTypeId
    if (value.checkInDate && value.checkOutDate && roomTypeId && value.rateCode) {
      dispatch(fetchLocalARIRates({
        roomTypeId,
        ratePlanCode: value.rateCode,
        startDate: value.checkInDate,
        endDate: value.checkOutDate,
        roomCount: value.rooms[0]?.roomCount || 1,
        adults: value.adultCount || 1,
        children: value.childCount || 0,
        extraBeds: 0,
      }))
      dispatch(fetchRoomsAvailability({
        StartDate: value.checkInDate,
        EndDate: value.checkOutDate,
        RoomTypeId: roomTypeId,
      }))
    }
  }, [dispatch, value.checkInDate, value.checkOutDate, value.rooms, value.rateCode, value.adultCount, value.childCount])

  const roomRates = useMemo(() => {
    const baseRate = localAriState.rates[0]?.amountBeforeTax || 0
    return { adult: baseRate, child: baseRate }
  }, [localAriState.rates])

  const adultTotalText = useMemo(() => `$ ${(value.adultCount * roomRates.adult).toFixed(2)}`, [value.adultCount, roomRates])
  const childTotalText = useMemo(() => `$ ${(value.childCount * roomRates.child).toFixed(2)}`, [value.childCount, roomRates])

  const roomTypeOptions: SelectOption[] = useMemo(() => {
    const options = roomTypesState.items.map((item) => ({
      value: item.name,
      label: item.name,
    }))

    if (options.length === 0) {
      return [
        { value: 'single', label: 'single' },
        { value: 'double', label: 'double' },
        { value: 'suit', label: 'suit' },
        { value: 'doublex', label: 'doublex' },
      ]
    }
    return options
  }, [roomTypesState.items])



  const ratePlanOptions: SelectOption[] = useMemo(() => {
    return ratePlansState.items
      .filter((rp) => rp.isActive)
      .map((rp) => ({
        value: rp.code,
        label: rp.code,
      }))
  }, [ratePlansState.items])

  const mealPlanOptions: SelectOption[] = useMemo(() => {
    return mealPlansState.items.map((item) => ({
      value: item.id,
      label: item.name,
    }))
  }, [mealPlansState.items])




  const extraItemOptions: SelectOption[] = useMemo(() => {
    return financialSettings.services.map((s) => ({
      value: s.name,
      label: s.name,
    }))
  }, [financialSettings.services])

  const addMealPlan = () => {
    const newId = value.mealPlans.length > 0 ? Math.max(...value.mealPlans.map((r) => r.id)) + 1 : 1
    onChange({
      mealPlans: [
        ...value.mealPlans,
        { id: newId, mealPlanId: '', serviceDateStart: value.checkInDate || '', serviceDateEnd: value.checkOutDate || '', price: 0 },
      ],
    })
  }

  const updateMealPlan = (id: number, patch: Partial<(typeof value.mealPlans)[0]>) => {
    onChange({
      mealPlans: value.mealPlans.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  const deleteMealPlan = (id: number) => {
    onChange({
      mealPlans: value.mealPlans.filter((r) => r.id !== id),
    })
  }

  const addExtraRow = () => {
    const newId = value.extras.length > 0 ? Math.max(...value.extras.map((r) => r.id)) + 1 : 1
    onChange({
      extras: [
        ...value.extras,
        { id: newId, item: '', qty: 1, serviceDate: value.checkInDate || '' },
      ],
    })
  }

  const updateExtra = (id: number, patch: Partial<{ item: string; qty: number; customName?: string; price?: number; serviceDate?: string }>) => {
    const nextExtras = value.extras.map((x) => {
      if (x.id !== id) return x

      const nextItem = patch.item ?? x.item
      const nextQtyRaw = patch.qty ?? x.qty
      const nextQty = nextItem ? Math.max(1, nextQtyRaw) : Math.max(0, nextQtyRaw)

      let nextPrice = patch.price ?? x.price
      if (patch.item !== undefined) {
        if (patch.item === 'custom') {
          nextPrice = 0
        } else if (patch.item === '') {
          nextPrice = 0
        } else {
          const service = financialSettings.services.find((s) => s.name === patch.item)
          if (service) {
            nextPrice = service.price
          }
        }
      }

      return {
        ...x,
        ...patch,
        item: nextItem,
        qty: nextQty,
        price: nextPrice,
      }
    })

    onChange({ extras: nextExtras })
  }

  const deleteExtra = (id: number) => {
    onChange({ extras: value.extras.filter((x) => x.id !== id) })
  }

  useEffect(() => {
    if (value.checkInDate && value.checkOutDate) {
      const start = new Date(value.checkInDate)
      const end = new Date(value.checkOutDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && value.nights !== diffDays.toString()) {
          onChange({ nights: diffDays.toString() })
        }
      }
    }
  }, [value.checkInDate, value.checkOutDate, value.nights, onChange])

  const removeRoom = (id: number) => {
    if (value.rooms.length > 1) {
      onChange({ rooms: value.rooms.filter((r) => r.id !== id) })
    }
  }


  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Labeled label="Check-in Date" required>
          <InputControl
            placeholder="MM/DD/YY"
            leftIconSrc={MdDateRange}
            right="caret"
            type="date"
            value={value.checkInDate}
            onChange={(v) => onChange({ checkInDate: v })}
          />
        </Labeled>
        <Labeled label="Check-out Date" required>
          <InputControl
            placeholder="MM/DD/YY"
            leftIconSrc={MdDateRange}
            right="caret"
            type="date"
            value={value.checkOutDate}
            onChange={(v) => onChange({ checkOutDate: v })}
          />
        </Labeled>
        <Labeled label="Nights" required>
          <InputControl placeholder="0" value={value.nights} onChange={(v) => onChange({ nights: v })} />
        </Labeled>
      </div>
      <div className="space-y-5">
        {value.rooms.map((room, index) => (
          <div key={room.id} className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-12 items-end">
            <div className="md:col-span-2">
              <Labeled label="Room Type" required>
                <SelectControlWithOptions
                  options={roomTypeOptions}
                  value={room.roomType}
                  onChange={(v) => {
                    const selectedType = roomTypesState.items.find((t) => t.name === v)
                    onChange({
                      rooms: value.rooms.map((r) =>
                        r.id === room.id ? { ...r, roomType: v, roomTypeId: selectedType?.id || '' } : r,
                      ),
                    })
                  }}

                />
              </Labeled>
            </div>
            <div className="md:col-span-2 h-11 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer appearance-none rounded-lg border-[1.5px] border-[#0B4EA2] bg-white bg-center bg-no-repeat checked:border-[#4F6EF7] checked:bg-[#4F6EF7] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=')] checked:bg-[size:12px_12px]"
                checked={value.isVip}
                onChange={(e) => onChange({ isVip: e.target.checked })}
              />
              <span className="select-none text-[11px] font-semibold text-slate-700 whitespace-nowrap">VIP Guest</span>
            </div>
            <div className="md:col-span-12">
              <Counter
                label="Room Count *"
                value={room.roomCount}
                onIncrease={() => {
                  const nextCount = room.roomCount + 1
                  onChange({
                    rooms: value.rooms.map((r) => (r.id === room.id ? { ...r, roomCount: nextCount } : r)),
                  })
                }}
                onDecrease={() => {
                  const nextCount = Math.max(1, room.roomCount - 1)
                  onChange({
                    rooms: value.rooms.map((r) => {
                      if (r.id === room.id) {
                        return { ...r, roomCount: nextCount }
                      }
                      return r
                    }),
                  })
                }}
              />
            </div>

            <div className="md:col-span-11">
            </div>

            <div className="md:col-span-1 h-11 flex items-center justify-end">
              {index > 0 && (
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
                  onClick={() => removeRoom(room.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Counter
          label="Adult"
          value={value.adultCount}
          priceText={adultTotalText}
          onIncrease={() => onChange({ adultCount: value.adultCount + 1 })}
          onDecrease={() => onChange({ adultCount: Math.max(0, value.adultCount - 1) })}
        />
        <Counter
          label="Child"
          value={value.childCount}
          priceText={childTotalText}
          onIncrease={() => {
            const newCount = value.childCount + 1;
            onChange({ 
              childCount: newCount,
              childAges: [...(value.childAges || []), 0]
            });
          }}
          onDecrease={() => {
            const newCount = Math.max(0, value.childCount - 1);
            onChange({ 
              childCount: newCount,
              childAges: (value.childAges || []).slice(0, newCount)
            });
          }}
        />
      </div>

      {value.childCount > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-[12px] font-semibold text-slate-700">Children's Ages</div>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: value.childCount }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Child {idx + 1}</span>
                <input
                  type="number"
                  min="0"
                  className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm outline-none focus:border-[#0B4EA2]"
                  value={value.childAges?.[idx] ?? ''}
                  onChange={(e) => {
                    const newAges = [...(value.childAges || Array(value.childCount).fill(0))];
                    newAges[idx] = parseInt(e.target.value) || 0;
                    onChange({ childAges: newAges });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">

        <Labeled label="Rate Code (e.g. BAR)">
          <SelectControlWithOptions
            options={ratePlanOptions}
            value={value.rateCode}
            onChange={(v) => onChange({ rateCode: v })}
          />
        </Labeled>


        {/* Invalid rate code warning */}
        {localAriState.status === 'succeeded' && localAriState.rates.length === 0 && value.rateCode.trim() !== '' && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-800">Invalid Rate Code</p>
              <p className="text-xs text-amber-600 mt-0.5">No rates were found for code <span className="font-mono font-bold">"{value.rateCode}"</span>. Please check and try again.</p>
            </div>
          </div>
        )}

        {/* Nightly Rates Table */}
        {localAriState.rates.length > 0 && (() => {
          const allZero = localAriState.rates.every(r => r.amountBeforeTax === 0 && r.finalRateAfterTax === 0)
          return (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-bold text-[#1e293b]">Nightly Rates</h3>
                  {localAriState.status === 'loading' && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full uppercase tracking-wider animate-pulse">Loading…</span>
                  )}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4EA2] hover:text-blue-800 transition-colors"
                  onClick={() => {
                    const roomTypeId = value.rooms[0]?.roomTypeId
                    if (value.checkInDate && value.checkOutDate && roomTypeId && value.rateCode) {
                      dispatch(fetchLocalARIRates({
                        roomTypeId,
                        ratePlanCode: value.rateCode,
                        startDate: value.checkInDate,
                        endDate: value.checkOutDate,
                        roomCount: value.rooms[0]?.roomCount || 1,
                        adults: value.adultCount || 1,
                        children: value.childCount || 0,
                        extraBeds: 0,
                      }))
                      dispatch(fetchRoomsAvailability({
                        StartDate: value.checkInDate,
                        EndDate: value.checkOutDate,
                        RoomTypeId: roomTypeId,
                      }))
                    }
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recalculate
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {allZero ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-6">
                    <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm font-bold text-slate-700">No rate data available for this period</p>
                    <p className="text-xs text-slate-400 max-w-xs">The rate plan code <span className="font-mono font-semibold text-slate-600">"{value.rateCode}"</span> has not been configured for this room type and date range yet. Please verify the rate plan exists or contact your revenue manager.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base Rate</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">After Tax</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Rate</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {localAriState.rates.map((rate) => {
                        const dateObj = new Date(rate.date)
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        return (
                          <tr key={rate.date} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                              {dateObj.toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {dayNames[dateObj.getDay()]}
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {rate.amountBeforeTax.toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {rate.amountAfterTax.toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                              {rate.finalRateAfterTax.toFixed(2)}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {rate.numberOfGuests}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )
        })()}

        {/* Room Availability Table */}
        {roomsState.availabilityStatus !== 'idle' && (() => {
          const isLoading = roomsState.availabilityStatus === 'loading';
          const hasRooms = roomsState.availability.length > 0;
          return (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-bold text-[#1e293b]">Room Availability</h3>
                {isLoading && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full uppercase tracking-wider animate-pulse">Loading…</span>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {!isLoading && !hasRooms ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-6">
                    <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm font-bold text-slate-700">No rooms available for the selected dates and room type.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Room Type</th>
                        <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Available Rooms</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(
                        roomsState.availability.reduce<Record<string, number>>((acc, room) => {
                          acc[room.roomTypeName] = (acc[room.roomTypeName] || 0) + 1
                          return acc
                        }, {})
                      ).map(([roomType, count]) => (
                        <tr key={roomType} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{roomType}</td>
                          <td className="px-5 py-4 text-sm text-right">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )
        })()}

        {/* Meal Plans Table */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1e293b]">Meal Plans</h3>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B4EA2] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#093d81] transition-all"
              onClick={addMealPlan}
            >
              <span className="text-sm leading-none">+</span> Add Meal Plan
            </button>
          </div>

          {value.mealPlans.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">End Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meal Plan</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Price / Day</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {value.mealPlans.map((mp) => (
                    <tr key={mp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2 w-48">
                        <InputControl
                          type="date"
                          value={mp.serviceDateStart ? mp.serviceDateStart.split('T')[0] : ''}
                          onChange={(v) => updateMealPlan(mp.id, { serviceDateStart: v })}
                          min={value.checkInDate || undefined}
                          max={value.checkOutDate || undefined}
                        />
                      </td>
                      <td className="px-3 py-2 w-48">
                        <InputControl
                          type="date"
                          value={mp.serviceDateEnd ? mp.serviceDateEnd.split('T')[0] : ''}
                          onChange={(v) => updateMealPlan(mp.id, { serviceDateEnd: v })}
                          min={value.checkInDate || undefined}
                          max={value.checkOutDate || undefined}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <SelectControlWithOptions
                          options={mealPlanOptions}
                          value={mp.mealPlanId}
                          onChange={(v) => {
                            const plan = mealPlansState.items.find((i) => i.id === v)
                            updateMealPlan(mp.id, { mealPlanId: v, price: plan?.pricePerDay || 0 })
                          }}
                        />
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-right">
                        {mp.price ? mp.price.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                          aria-label="Delete"
                          onClick={() => deleteMealPlan(mp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">No meal plans added.</p>
            </div>
          )}
        </div>

        {/* Services Table */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1e293b]">Additional Services</h3>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0B4EA2] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#093d81] transition-all"
              onClick={addExtraRow}
            >
              <span className="text-sm leading-none">+</span> Add Service
            </button>
          </div>

          {value.extras.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-32">Qty</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Price</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {value.extras.map((extra) => {
                    const unitPrice = extra.price ?? 0
                    const totalPrice = extra.qty * unitPrice

                    return (
                      <tr key={extra.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2 w-48 align-top">
                        <InputControl
                            type="date"
                            value={extra.serviceDate ? extra.serviceDate.split('T')[0] : ''}
                            onChange={(v) => updateExtra(extra.id, { serviceDate: v })}
                            min={value.checkInDate || undefined}
                            max={value.checkOutDate || undefined}
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <SelectControlWithOptions
                            options={extraItemOptions}
                            value={extra.item}
                            onChange={(v) => {
                              const svc = financialSettings.services.find((s) => s.name === v)
                              updateExtra(extra.id, { item: v, price: svc?.price || 0 })
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 align-top pt-3">
                          <div className="flex h-9 mx-auto items-center justify-between rounded-lg border border-slate-200 bg-white px-2">
                            <button
                              type="button"
                              className="grid h-6 w-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                              onClick={() => updateExtra(extra.id, { qty: Math.max(1, extra.qty - 1) })}
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-slate-800">{extra.qty}</span>
                            <button
                              type="button"
                              className="grid h-6 w-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                              onClick={() => updateExtra(extra.id, { qty: extra.qty + 1 })}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-right align-top pt-4">
                          ${totalPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right align-top pt-3">
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                            aria-label="Delete"
                            onClick={() => deleteExtra(extra.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">No services added.</p>
            </div>
          )}
        </div>
      </div>

      <Labeled label="Special Requests">
        <textarea
          className="min-h-[90px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
          placeholder="Any special requirements..."
          value={value.specialRequests}
          onChange={(e) => onChange({ specialRequests: e.target.value })}
        />
      </Labeled>
    </div>
  )
}
