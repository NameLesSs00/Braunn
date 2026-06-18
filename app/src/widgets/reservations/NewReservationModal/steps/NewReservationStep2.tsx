import { IconImage } from '../../../../shared/ui/IconImage'
import { useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { fetchFinancialServices, fetchFinancialDiscounts, createFinancialDiscount, createFinancialService } from '../../../../features/adminFinancialSettings/financialSettingsSlice'
import { RoomViewEnum } from '../../../../shared/Enums/roomViewEnum'
import { fetchARIRates } from '../../../../features/ari/ariSlice'
import { fetchMealPlans } from '../../../../features/admin/mealPlansSlice'
import { MdDateRange } from "react-icons/md";
import type { IconType } from "react-icons";




import { Trash2, Minus, RefreshCw, Edit3, RotateCcw } from 'lucide-react'

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
  onChange?: (value: string) => void
}

function InputControl({
  placeholder,
  leftIconSrc,
  right = 'none',
  type = 'text',
  value,
  disabled,
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
  priceText: string
  onIncrease: () => void
  onDecrease: () => void
}

function Counter({ label, value, priceText, onIncrease, onDecrease }: CounterProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
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
        <div className="text-sm font-semibold text-slate-700">{priceText}</div>
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
  const ariState = useAppSelector((state) => state.ari)
  const financialSettings = useAppSelector((state) => state.financialSettings)
  const mealPlansState = useAppSelector((state) => state.mealPlans)


  useEffect(() => {
    if (roomTypesState.status === 'idle') {
      dispatch(fetchRoomTypes())
    }
  }, [dispatch, roomTypesState.status])

  useEffect(() => {
    if (financialSettings.status === 'idle') {
      dispatch(fetchFinancialServices())
      dispatch(fetchFinancialDiscounts())
    }
    if (mealPlansState.status === 'idle' || mealPlansState.status === 'failed') {
      dispatch(fetchMealPlans())
    }
  }, [dispatch, financialSettings.status, mealPlansState.status])




  useEffect(() => {
    if (value.checkInDate && value.checkOutDate) {
      dispatch(fetchARIRates({ startDate: value.checkInDate, endDate: value.checkOutDate }))
    }
  }, [dispatch, value.checkInDate, value.checkOutDate])



  const roomRates = useMemo(() => {
    const type = value.rooms[0]?.roomType || 'single'
    const rates: Record<string, { adult: number; child: number; infant: number }> = {
      single: { adult: 100, child: 50, infant: 25 },
      double: { adult: 150, child: 75, infant: 35 },
      suit: { adult: 250, child: 120, infant: 60 },
      doublex: { adult: 350, child: 170, infant: 80 },
    }
    return rates[type] || rates.single
  }, [value.rooms])

  const adultTotalText = useMemo(() => `$ ${(value.adultCount * roomRates.adult).toFixed(2)}`, [value.adultCount, roomRates])
  const childTotalText = useMemo(() => `$ ${(value.childCount * roomRates.child).toFixed(2)}`, [value.childCount, roomRates])
  const infantTotalText = useMemo(() => `$ ${(value.infantCount * roomRates.infant).toFixed(2)}`, [value.infantCount, roomRates])

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



  const roomViewOptions: SelectOption[] = [
    { value: 'SeaView', label: 'Sea View' },
    { value: 'PoolView', label: 'Pool View' },
    { value: 'CityView', label: 'City View' },
    { value: 'GardenView', label: 'Garden View' },
  ]


  const roomNumberOptions: SelectOption[] = [
    { value: '101', label: '101' },
    { value: '102', label: '102' },
    { value: '103', label: '103' },
    { value: '104', label: '104' },
    { value: '105', label: '105' },
  ]

  const discountTypeOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = [{ value: 'none', label: 'No Discount' }]

    financialSettings.discounts.forEach((d) => {
      options.push({ value: d.id, label: d.name })
    })

    options.push({ value: 'custom', label: 'Custom Discount' })
    return options
  }, [financialSettings.discounts])

  const rateCodeOptions: SelectOption[] = [
    { value: 'restricted-roots', label: 'Restricted Roots' },
    { value: 'group-reservation', label: 'Groub reservation' },
    { value: 'pseudo-roots', label: 'pseudo roots' },
    { value: 'room-type-conservation', label: 'room type conservation' },
  ]

  const ratePlanOptions: SelectOption[] = useMemo(() => {
    if (ariState.rates.length > 0) {
      // Use unique invTypeCodes for options
      const uniqueCodes = Array.from(new Set(ariState.rates.map((r) => r.invTypeCode)))
      return uniqueCodes.map((code) => ({
        value: code,
        label: code,
      }))
    }
    return [
      { value: 'room-only', label: 'Room only' },
      { value: 'bed-breakfast', label: 'Bed& Breakfast' },
      { value: 'half-board', label: 'Half board' },
      { value: 'full-board', label: 'Full board' },
      { value: 'all-inclusive', label: 'All inclusive' },
      { value: 'ultra-all-inclusive', label: 'ultra all inclusive' },
    ]
  }, [ariState.rates])

  const mealPlanOptions: SelectOption[] = useMemo(() => {
    if (mealPlansState.items.length > 0) {
      return mealPlansState.items.map((item) => ({
        value: item.code,
        label: item.name,
      }))
    }
    return [
      { value: 'room-only', label: 'Room only' },
      { value: 'bed-breakfast', label: 'Bed& Breakfast' },
      { value: 'half-board', label: 'Half board' },
      { value: 'full-board', label: 'Full board' },
      { value: 'all-inclusive', label: 'All inclusive' },
      { value: 'ultra-all-inclusive', label: 'ultra all inclusive' },
    ]
  }, [mealPlansState.items])




  const extraItemOptions: SelectOption[] = useMemo(() => {
    const options = financialSettings.services.map((s) => ({
      value: s.name,
      label: s.name,
    }))
    options.push({ value: 'custom', label: 'Custom' })
    return options
  }, [financialSettings.services])

  const addRoom = () => {
    const nextId = Date.now()
    onChange({
      rooms: [...value.rooms, { id: nextId, roomType: '', roomView: '', roomCount: 1, roomNumbers: [] }],
    })
  }

  const addExtraRow = () => {
    onChange({ extras: [...value.extras, { id: Date.now(), item: '', qty: 0, price: 0 }] })
  }

  const updateExtra = (id: number, patch: Partial<{ item: string; qty: number; customName?: string; price?: number }>) => {
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
                    const viewLabel = selectedType !== undefined ? RoomViewEnum[selectedType.viewType] : ''
                    onChange({
                      rooms: value.rooms.map((r) =>
                        r.id === room.id ? { ...r, roomType: v, roomView: viewLabel } : r,
                      ),
                    })
                  }}

                />
              </Labeled>
            </div>
            <div className="md:col-span-2">
              <Labeled label="Room view" required>
                <SelectControlWithOptions
                  options={roomViewOptions}
                  value={room.roomView}
                  onChange={(v) =>
                    onChange({
                      rooms: value.rooms.map((r) => (r.id === room.id ? { ...r, roomView: v } : r)),
                    })
                  }
                />
              </Labeled>
            </div>
            <div className="md:col-span-2">
              <Labeled label="Room Count" required>
                <div className="flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-full border border-[#0B4EA2] text-[#0B4EA2] hover:bg-blue-50"
                    onClick={() => {
                      const nextCount = room.roomCount + 1
                      onChange({
                        rooms: value.rooms.map((r) => (r.id === room.id ? { ...r, roomCount: nextCount } : r)),
                      })
                    }}
                  >
                    +
                  </button>
                  <div className="min-w-5 text-center text-sm font-semibold text-slate-800">
                    {room.roomCount}
                  </div>
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-full border border-rose-400 text-rose-500 hover:bg-rose-50"
                    onClick={() => {
                      const nextCount = Math.max(1, room.roomCount - 1)
                      onChange({
                        rooms: value.rooms.map((r) => {
                          if (r.id === room.id) {
                            const nextNumbers = r.roomNumbers.slice(0, nextCount)
                            return { ...r, roomCount: nextCount, roomNumbers: nextNumbers }
                          }
                          return r
                        }),
                      })
                    }}
                  >
                    −
                  </button>
                </div>
              </Labeled>
            </div>

            <div className="md:col-span-3">
              {value.isVip && (
                <div className="flex items-end gap-3">
                  <div className="w-28 shrink-0">
                    <Labeled label="Room Num" required>
                      <SelectControlWithOptions
                        options={roomNumberOptions.filter((opt) => !room.roomNumbers.includes(opt.value))}
                        value=""
                        onChange={(v) => {
                          if (v && room.roomNumbers.length < room.roomCount) {
                            onChange({
                              rooms: value.rooms.map((r) =>
                                r.id === room.id ? { ...r, roomNumbers: [...r.roomNumbers, v] } : r,
                              ),
                            })
                          }
                        }}
                      />
                    </Labeled>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {room.roomNumbers.map((num, idx) => {
                      const colors = ['bg-[#0B4EA2]', 'bg-amber-400', 'bg-emerald-500', 'bg-rose-500']
                      const colorClass = colors[idx % colors.length]
                      return (
                        <div
                          key={num}
                          className={`group relative flex h-8 min-w-[32px] w-fit px-2 items-center justify-center rounded-full ${colorClass} text-[10px] font-bold text-white shadow-sm transition-all`}
                        >
                          {num}
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800/80 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() =>
                              onChange({
                                rooms: value.rooms.map((r) =>
                                  r.id === room.id
                                    ? { ...r, roomNumbers: r.roomNumbers.filter((n) => n !== num) }
                                    : r,
                                ),
                              })
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Counter
          label="Adult"
          value={value.adultCount}
          priceText={adultTotalText}
          onIncrease={() => onChange({ adultCount: value.adultCount + 1 })}
          onDecrease={() => onChange({ adultCount: Math.max(0, value.adultCount - 1) })}
        />
        <Counter
          label="child"
          value={value.childCount}
          priceText={childTotalText}
          onIncrease={() => onChange({ childCount: value.childCount + 1 })}
          onDecrease={() => onChange({ childCount: Math.max(0, value.childCount - 1) })}
        />
        <Counter
          label="Infant"
          value={value.infantCount}
          priceText={infantTotalText}
          onIncrease={() => onChange({ infantCount: value.infantCount + 1 })}
          onDecrease={() => onChange({ infantCount: Math.max(0, value.infantCount - 1) })}
        />
      </div>



      <div className="flex justify-end">
        <button
          type="button"
          className="h-11 rounded-xl border border-[#0B4EA2] px-10 text-sm font-semibold text-[#0B4EA2]"
          onClick={addRoom}
        >
          Add Room
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Labeled label="Discount Type">
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                value={value.discountId || value.discountType}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'none') {
                    onChange({ discountType: 'none', discountId: '', discountPercentage: '', discountFixed: '' })
                  } else if (val === 'custom') {
                    onChange({ discountType: 'custom', discountId: '' })
                  } else {
                    const discount = financialSettings.discounts.find((d) => d.id === val)
                    if (discount) {
                      onChange({
                        discountType: discount.type === 'Percentage' ? 'percentage' : 'fixed',
                        discountId: discount.id,
                        discountPercentage: discount.type === 'Percentage' ? discount.value.toString() : '',
                        discountFixed: discount.type === 'FixedAmount' ? discount.value.toString() : '',
                      })
                    }
                  }
                }}
              >
                {discountTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </span>
            </div>
          </Labeled>

          {value.discountType === 'custom' ? (
            <>
              <Labeled label="Discount Name">
                <InputControl
                  placeholder="Enter name"
                  value={value.customDiscountName}
                  onChange={(v) => onChange({ customDiscountName: v })}
                />
              </Labeled>
              <div className="grid grid-cols-2 gap-3">
                <Labeled label="Value">
                  <InputControl
                    placeholder="0"
                    value={value.customDiscountValue}
                    onChange={(v) => onChange({ customDiscountValue: v })}
                  />
                </Labeled>
                <Labeled label="Discount Type">
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-8 text-sm text-slate-500 outline-none focus:border-[#0B4EA2]"
                      value={value.customDiscountType}
                      onChange={(e) => onChange({ customDiscountType: e.target.value as 'FixedAmount' | 'Percentage' })}
                    >
                      <option value="Percentage">%</option>
                      <option value="FixedAmount">$</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                  </div>
                </Labeled>
              </div>
            </>
          ) : value.discountId ? (
            <Labeled label={value.discountType === 'percentage' ? 'Percentage' : 'Fixed amount'}>
              <InputControl
                value={value.discountType === 'percentage' ? `${value.discountPercentage}%` : `${value.discountFixed}$`}
                disabled
              />
            </Labeled>
          ) : value.discountType === 'percentage' ? (
            <Labeled label="Percentage">
              <InputControl
                placeholder="0%"
                value={value.discountPercentage}
                onChange={(v) => onChange({ discountPercentage: v })}
              />
            </Labeled>
          ) : value.discountType === 'fixed' ? (
            <Labeled label="Fixed amount">
              <InputControl
                placeholder="0$"
                value={value.discountFixed}
                onChange={(v) => onChange({ discountFixed: v })}
              />
            </Labeled>
          ) : (
            <div />
          )}

          {value.discountType !== 'none' && (
            <Labeled label="Comment">
              <div className="flex gap-3">
                <div className="flex-1">
                  <InputControl
                    placeholder="Write Reason"
                    value={value.discountComment}
                    onChange={(v) => onChange({ discountComment: v })}
                  />
                </div>
                {value.discountType === 'custom' && (
                  <button
                    type="button"
                    disabled={financialSettings.status === 'loading' || !value.customDiscountName || !value.customDiscountValue}
                    className="h-11 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={() => {
                      if (!value.customDiscountName || !value.customDiscountValue) return
                      dispatch(createFinancialDiscount({
                        name: value.customDiscountName,
                        value: Number(value.customDiscountValue),
                        type: value.customDiscountType || 'Percentage'
                      })).unwrap().then((newDiscount) => {
                        onChange({
                          discountType: newDiscount.type === 'Percentage' ? 'percentage' : 'fixed',
                          discountId: newDiscount.id,
                          discountPercentage: newDiscount.type === 'Percentage' ? newDiscount.value.toString() : '',
                          discountFixed: newDiscount.type === 'FixedAmount' ? newDiscount.value.toString() : '',
                          customDiscountName: '',
                          customDiscountValue: '',
                        })
                      })
                    }}
                  >
                    {financialSettings.status === 'loading' && <RotateCcw className="w-4 h-4 animate-spin" />}
                    {financialSettings.status === 'loading' ? 'Adding...' : 'Add Discount'}
                  </button>
                )}
              </div>
            </Labeled>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_1fr_220px]">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:col-span-3">
            <Labeled label="Rate code">
              <SelectControlWithOptions
                options={ariState.rates.length > 0
                  ? Array.from(new Set(ariState.rates.map(r => r.ratePlanCode))).map(code => ({ value: code, label: code }))
                  : rateCodeOptions
                }
                value={value.rateCode}
                onChange={(v) =>
                  onChange({
                    rateCode: v,
                    isGroupReservation: v === 'group-reservation',
                  })
                }
              />
            </Labeled>
            <Labeled label="Rate Plan">
              <SelectControlWithOptions
                options={ratePlanOptions}
                value={value.ratePlan}
                onChange={(v) => {
                  const rate = ariState.rates.find(r => r.invTypeCode === v)
                  onChange({
                    ratePlan: v,
                    rateCode: rate?.ratePlanCode ?? value.rateCode
                  })
                }}
              />
            </Labeled>
            <Labeled label="Meal Code">
              <SelectControlWithOptions
                options={mealPlanOptions}
                value={value.mealPlan}
                onChange={(v) => onChange({ mealPlan: v })}
              />
            </Labeled>
          </div>
        </div>


        {/* Nightly Rates Table */}
        {value.checkInDate && value.checkOutDate && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-[#1e293b]">Nightly Rates</h3>
                <span className="px-3 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full uppercase tracking-wider">Editable</span>
              </div>
              <div className="flex items-center gap-6">
                <button type="button" className="flex items-center gap-2 text-sm font-bold text-[#004bb4] hover:text-blue-800 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Recalculate
                </button>
                <button type="button" className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Edit3 className="w-4 h-4 text-[#004bb4]" />
                  Edit Multiple
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium italic">Prices are per night. You can edit any night if needed.</p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Rate (USD)</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tax (%)</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total (USD)</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const rows = []
                    const start = new Date(value.checkInDate)
                    const end = new Date(value.checkOutDate)

                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

                    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                      const dateStr = d.toISOString().split('T')[0]
                      const dayName = dayNames[d.getDay()]

                      // Find rate for this specific date and selected plan/code
                      const rateMatch = ariState.rates.find(r => {
                        if (!r.date) return false
                        const rDateStr = r.date.split(' ')[0]
                        return (
                          r.invTypeCode === value.ratePlan &&
                          r.ratePlanCode === value.rateCode &&
                          rDateStr === dateStr
                        )
                      })

                      const rate = rateMatch?.additionalGuestAmounts[0]?.amount ?? 0
                      const total = rateMatch?.baseGuestAmounts[0]?.amountAfterTax ?? 0
                      const taxAmount = Math.max(0, total - rate)
                      const taxPercent = rate > 0 ? ((taxAmount / rate) * 100).toFixed(0) : '0'

                      rows.push(
                        <tr key={dateStr} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                            {d.toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-500">
                            {dayName}
                          </td>
                          <td className="px-6 py-5">
                            <div className="relative w-32">
                              <input
                                type="number"
                                value={rate.toFixed(2)}
                                readOnly
                                className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 outline-none text-right"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-500">
                            {taxAmount.toFixed(2)} ({taxPercent}%)
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-800">
                            {total.toFixed(2)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button type="button" className="p-2 border border-slate-200 rounded-full text-slate-400 hover:text-[#004bb4] hover:border-blue-200 transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button type="button" className="p-2 border border-slate-200 rounded-full text-slate-400 hover:text-[#004bb4] hover:border-blue-200 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    if (rows.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium italic">
                            Select stay dates and a rate plan to view nightly rates.
                          </td>
                        </tr>
                      )
                    }

                    return rows
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {value.extras.length > 0 ? (
          <div className="space-y-5">
            {value.extras.map((extra, idx) => {
              const unitPrice = extra.price ?? 0
              const totalPrice = extra.qty * unitPrice

              return (
                <div key={extra.id} className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                  <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-[1fr_220px_240px_44px_220px]">
                    <Labeled label="Extra item">
                      <SelectControlWithOptions
                        options={extraItemOptions}
                        value={extra.item}
                        onChange={(value) => updateExtra(extra.id, { item: value })}
                      />
                    </Labeled>

                    <Labeled label="Quantity">
                      <div className="flex h-11 items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-4">
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center rounded-full border border-[#0B4EA2] text-[#0B4EA2] hover:bg-blue-50"
                          onClick={() => updateExtra(extra.id, { qty: extra.qty + 1 })}
                        >
                          +
                        </button>
                        <div className="min-w-6 text-center text-sm font-semibold text-slate-800">
                          {extra.qty}
                        </div>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center rounded-full border border-rose-400 text-rose-500 hover:bg-rose-50"
                          onClick={() => updateExtra(extra.id, { qty: Math.max(0, extra.qty - 1) })}
                        >
                          −
                        </button>
                      </div>
                    </Labeled>

                    <Labeled label="Price">
                      <InputControl value={`${totalPrice.toFixed(2)}$`} disabled />
                    </Labeled>

                    <div className="flex h-11 items-center justify-end">
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        aria-label="Delete"
                        onClick={() => deleteExtra(extra.id)}
                      >
                        <Trash2 className="h-[18px] w-[18px]" />
                      </button>
                    </div>

                    <div className="flex items-end justify-end">
                      {idx === 0 ? (
                        <button
                          type="button"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-10 text-sm font-semibold text-white shadow-sm hover:bg-[#093d81] transition-all"
                          onClick={addExtraRow}
                        >
                          <span className="text-lg leading-none">+</span>
                          Extras
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {extra.item === 'custom' && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px_240px_44px_220px] items-end animate-in fade-in slide-in-from-top-2 duration-300">
                      <Labeled label="Service Name" required>
                        <InputControl
                          placeholder="Enter service name"
                          value={extra.customName}
                          onChange={(v) => updateExtra(extra.id, { customName: v })}
                        />
                      </Labeled>
                      <Labeled label="Service Price" required>
                        <InputControl
                          placeholder="0.00"
                          value={extra.price?.toString()}
                          onChange={(v) => updateExtra(extra.id, { price: parseFloat(v) || 0 })}
                        />
                      </Labeled>
                      <div className="md:col-span-3">
                        <button
                          type="button"
                          className="h-11 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                          onClick={() => {
                            if (!extra.customName || !extra.price) return
                            dispatch(createFinancialService({
                              name: extra.customName,
                              price: extra.price
                            })).unwrap().then((newService) => {
                              updateExtra(extra.id, {
                                item: newService.name,
                                price: newService.price,
                                customName: ''
                              })
                            })
                          }}
                        >
                          Add service
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-10 text-sm font-semibold text-white"
              onClick={addExtraRow}
            >
              <span className="text-lg leading-none">+</span>
              Extras
            </button>
          </div>
        )}
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
