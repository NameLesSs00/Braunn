import { useMemo, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  CakeSlice,
  ChevronDown,
  CirclePlus,
  CheckCircle2,
  Clock,
  ConciergeBell,
  CreditCard,
  Coffee,
  DollarSign,
  Filter,
  Hotel,
  MoreVertical,
  Minus,
  Pause,
  Plus,
  Receipt,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Salad,
  Search,
  Send,
  ShoppingCart,
  Soup,
  Table2,
  Trash2,
  User,
  UserRound,
  Users,
  Utensils,
  Pencil,
  Phone,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { routes } from '../../../../shared/lib/routes'
import {
  menuCategories,
  menuItems,
  restaurantTables,
  type CartLine,
  type MenuItem,
  type RestaurantTable,
  type TableStatus,
} from '../data/restaurantPOSData'

const sidebarItems = [
  { label: 'Menu', icon: ConciergeBell, to: routes.pos.menu },
  { label: 'Orders', icon: ShoppingCart, to: routes.pos.orders },
  { label: 'Table Reservation', icon: Table2, to: routes.pos.tableReservation },
  { label: 'Guest Meals', icon: Hotel, to: routes.pos.guestMeals },
] as const

type PosSection = (typeof sidebarItems)[number]['label']
type PaymentMethod = 'Cash' | 'Card' | 'Charge to Room'

const pendingOrder = {
  id: 'ORD-1781684945310',
  shortId: 'ORD-178168494\n5310',
  type: 'Dine In',
  table: 'Table 3',
  item: 'Ribeye Steak',
  quantity: 1,
  items: '1 items',
  subtotal: 36.99,
  tax: 3.7,
  total: 40.69,
  status: 'Preparing',
  payment: 'Pending',
  time: '11:29 AM',
}

const paidOrder = {
  id: 'ORD-1781684964598',
  shortId: 'ORD-178168496\n4598',
  type: 'Dine In',
  table: 'Table 10',
  items: '1 items',
  total: 20.89,
  status: 'Ready',
  payment: 'Paid',
  time: '11:29 AM',
}

type ReservationTableStatus = 'available' | 'reserved' | 'occupied'

const reservationTables: Array<{
  id: number
  name: string
  seats: number
  status: ReservationTableStatus
  guestName?: string
  phone?: string
  guests?: number
  time?: string
}> = [
  { id: 1, name: 'Table 1', seats: 2, status: 'available' },
  { id: 2, name: 'Table 2', seats: 4, status: 'occupied' },
  {
    id: 3,
    name: 'Table 3',
    seats: 6,
    status: 'reserved',
    guestName: 'James Wilson',
    phone: '+1 555-0101',
    guests: 5,
    time: '7:30 PM',
  },
  { id: 4, name: 'Table 4', seats: 2, status: 'available' },
]

const reservationStatusMeta: Record<ReservationTableStatus, { label: string; card: string; badge: string; count: number }> = {
  available: {
    label: 'Available',
    card: 'border-emerald-300 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    count: 5,
  },
  reserved: {
    label: 'Reserved',
    card: 'border-yellow-300 bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    count: 3,
  },
  occupied: {
    label: 'Occupied',
    card: 'border-rose-300 bg-rose-50',
    badge: 'bg-rose-100 text-rose-700',
    count: 4,
  },
}

type MealGuestStatus = 'Eligible' | 'Redeemed' | 'Expired' | 'Not Available'

const guestMealRows: Array<{
  initials: string
  name: string
  party: string
  room: string
  reservation: string
  checkout: string
  mealTime: string
  packageName: string
  status: MealGuestStatus
  action: 'Redeem' | 'View' | 'None'
}> = [
  {
    initials: 'AM',
    name: 'Ahmed Mohamed',
    party: '2 Adults',
    room: '305',
    reservation: 'RES-1023',
    checkout: '24 Jul',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Bed & Breakfast',
    status: 'Eligible',
    action: 'Redeem',
  },
  {
    initials: 'SA',
    name: 'Sara Ali',
    party: '2 Adults',
    room: '212',
    reservation: 'RES-1045',
    checkout: '22 Jul',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Half Board',
    status: 'Redeemed',
    action: 'View',
  },
  {
    initials: 'JS',
    name: 'John Smith',
    party: '1 Adult',
    room: '118',
    reservation: 'RES-1090',
    checkout: '23 Jul',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Full Board',
    status: 'Expired',
    action: 'View',
  },
  {
    initials: 'MA',
    name: 'Mariam Adel',
    party: '2 Adults, 1 Child',
    room: '410',
    reservation: 'RES-1112',
    checkout: '25 Jul',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Full Board',
    status: 'Not Available',
    action: 'None',
  },
]

const categoryIcons: Record<string, LucideIcon> = {
  drink: Coffee,
  'main-course': Soup,
  salad: Salad,
  desert: CakeSlice,
}

const statusStyles: Record<TableStatus, { card: string; text: string; dot: string }> = {
  available: {
    card: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    text: 'Available',
    dot: 'bg-emerald-500',
  },
  reserved: {
    card: 'border-amber-300 bg-amber-50 text-amber-700',
    text: 'Reserved',
    dot: 'bg-amber-400',
  },
  occupied: {
    card: 'border-rose-300 bg-rose-50 text-rose-700',
    text: 'Occupied',
    dot: 'bg-rose-500',
  },
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function PosSidebar({ search }: { search: string }) {
  const pathWithSearch = (path: string) => `${path}${search}`

  return (
    <aside
      className="flex h-full w-[260px] flex-col shadow-sm"
      style={{
        background: 'linear-gradient(to right, #0B4EA2 0 44px, #ffffff 44px 100%)',
      }}
    >
      <div className="grid flex-shrink-0 grid-cols-[44px_1fr]">
        <div className="bg-transparent" />
        <div className="flex items-center border-b border-transparent px-6 py-6">
          <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-10 w-auto" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={pathWithSearch(item.to)}
              className={({ isActive }) =>
                [
                  'relative grid grid-cols-[44px_1fr] items-center',
                  isActive ? 'text-[#0B4EA2]' : 'text-slate-700',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative grid h-14 w-11 place-items-center bg-[#0B4EA2]">
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <div
                    className={[
                      'relative flex h-14 items-center px-5 text-[15px] transition-colors',
                      isActive ? 'font-medium' : 'bg-white hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {isActive ? <span className="absolute inset-y-2 left-0 right-0 rounded-lg bg-[#EEF4FF]" aria-hidden="true" /> : null}
                    {isActive ? (
                      <span
                        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
                        aria-hidden="true"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '8px solid transparent',
                          borderBottom: '8px solid transparent',
                          borderRight: '8px solid #EEF4FF',
                        }}
                      />
                    ) : null}
                    <span className="relative truncate">{item.label}</span>
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

function StatusLegend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-500">
      {(['available', 'reserved', 'occupied'] as TableStatus[]).map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <span className={['h-2 w-2 flex-shrink-0 rounded-full', statusStyles[status].dot].join(' ')} />
          {statusStyles[status].text}
        </span>
      ))}
    </div>
  )
}

function TableCard({
  table,
  selected,
  onSelect,
}: {
  table: RestaurantTable
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={[
        'h-[60px] w-full rounded-xl border px-3 text-left transition-all',
        statusStyles[table.status].card,
        selected ? 'bg-[#FFF9E8] ring-2 ring-amber-300/60' : 'hover:-translate-y-0.5 hover:shadow-sm',
      ].join(' ')}
      onClick={onSelect}
    >
      <div className="flex h-full items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold leading-5">{table.name}</div>
          <div className="text-xs leading-5">{statusStyles[table.status].text}</div>
        </div>
        <div className="text-xs text-current">{table.seats} seats</div>
      </div>
    </button>
  )
}

function OrderSummary({
  selectedTable,
  cart,
  onDecrease,
  onIncrease,
  onPay,
}: {
  selectedTable: RestaurantTable
  cart: CartLine[]
  onDecrease: (itemId: string) => void
  onIncrease: (item: MenuItem) => void
  onPay: () => void
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <aside className="mb-12 mt-5 flex flex-col rounded-md bg-[#F8FAFD] px-5 py-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Order&nbsp; T{selectedTable.id}</h2>
        <button type="button" className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
          <RefreshCw className="h-3 w-3" />
          Clear
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400">
          <ReceiptText className="mb-3 h-8 w-8" />
          <p className="text-sm">No items yet</p>
        </div>
      ) : (
        <>
          <div className="mt-9 space-y-3 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm shadow-slate-200/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.name}</div>
                    <div className="mt-1 text-sm font-bold text-[#0B4EA2]">{formatMoney(item.price)}</div>
                  </div>
                  <Trash2 className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    className="grid h-6 w-6 place-items-center rounded-lg bg-slate-200 text-slate-500 hover:bg-slate-300"
                    onClick={() => onDecrease(item.id)}
                    aria-label={`Decrease ${item.name}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium text-slate-600">{item.quantity}</span>
                  <button
                    type="button"
                    className="grid h-6 w-6 place-items-center rounded-lg bg-[#D8E7FA] text-[#0B4EA2] hover:bg-[#CBE0F8]"
                    onClick={() => onIncrease(item)}
                    aria-label={`Increase ${item.name}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (10%)</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="text-lg font-bold text-[#0B4EA2]">{formatMoney(total)}</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-20 flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <Send className="h-4 w-4" />
              Send to Kitchen
            </button>
            <div className="mt-5 grid grid-cols-[1fr_104px] gap-7">
              <button
                type="button"
                className="flex h-8 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] text-sm font-medium text-white hover:bg-[#093f82]"
                onClick={onPay}
              >
                <CreditCard className="h-4 w-4" />
                pay
              </button>
              <button
                type="button"
                className="flex h-8 items-center justify-center gap-2 rounded-lg border border-[#0B4EA2] bg-white text-sm font-medium text-[#0B4EA2] hover:bg-[#EEF4FF]"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                Pending
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="h-[146px] rounded-lg border border-slate-200 bg-white px-7 py-7 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-normal" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

function OrdersView({ onPay }: { onPay: () => void }) {
  return (
    <section className="min-h-0 overflow-y-auto px-16 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={2} color="#2563FF" />
        <StatCard label="Paid" value={1} color="#08A64B" />
        <StatCard label="Pending Payment" value={1} color="#F04B11" />
        <StatCard label="In Progress" value={0} color="#951BFF" />
      </div>

      <div className="mt-12 flex items-center gap-3">
        <div className="relative w-[544px]">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-4 pr-11 text-base outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Search by order ID, table number, room..."
          />
        </div>
        <Filter className="ml-auto h-5 w-5 text-slate-500" />
        <button className="flex h-10 w-48 items-center justify-between rounded-lg border border-slate-300 px-4 text-sm text-slate-700" type="button">
          All Status
          <ChevronDown className="h-4 w-4" />
        </button>
        <button className="flex h-10 w-48 items-center justify-between rounded-lg border border-slate-300 px-4 text-sm text-slate-700" type="button">
          All Type
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-12 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="grid h-[52px] grid-cols-[1.1fr_1fr_1.2fr_1fr_1fr_1.2fr_1.1fr_1fr_1fr] items-center bg-slate-50 px-6 text-sm font-semibold text-slate-600">
          <div>Order ID</div>
          <div>Type</div>
          <div>Location</div>
          <div>Items</div>
          <div>Total</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Time</div>
          <div>Actions</div>
        </div>
        {[
          { ...pendingOrder, action: 'Pay' },
          { ...paidOrder, action: 'Deliver' },
        ].map((order) => (
          <div
            key={order.id}
            className="grid min-h-[73px] grid-cols-[1.1fr_1fr_1.2fr_1fr_1fr_1.2fr_1.1fr_1fr_1fr] items-center border-t border-slate-100 px-6 text-sm text-slate-700"
          >
            <div className="whitespace-pre-line font-medium text-blue-600">{order.shortId}</div>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-slate-400" />
              {order.type}
            </div>
            <div>{order.table}</div>
            <div>{order.items}</div>
            <div>{formatMoney(order.total)}</div>
            <div>
              <span
                className={[
                  'rounded-full px-5 py-1 text-xs font-semibold',
                  order.status === 'Preparing' ? 'bg-blue-100 text-slate-700' : 'bg-orange-100 text-orange-700',
                ].join(' ')}
              >
                {order.status}
              </span>
            </div>
            <div>
              <span
                className={[
                  'rounded-full px-5 py-1 text-xs font-medium',
                  order.payment === 'Pending' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700',
                ].join(' ')}
              >
                {order.payment}
              </span>
            </div>
            <div>{order.time}</div>
            <div>
              {order.action === 'Pay' ? (
                <button className="h-6 rounded bg-[#0B4EA2] px-5 text-xs font-medium text-white" type="button" onClick={onPay}>
                  Pay
                </button>
              ) : (
                <button className="h-6 rounded bg-green-600 px-4 text-xs font-medium text-white" type="button">
                  Deliver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProcessPaymentModal({
  open,
  selectedMethod,
  onMethodChange,
  onConfirm,
  onClose,
}: {
  open: boolean
  selectedMethod: PaymentMethod | null
  onMethodChange: (method: PaymentMethod) => void
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null

  const methods: Array<{ label: PaymentMethod; icon: LucideIcon }> = [
    { label: 'Cash', icon: DollarSign },
    { label: 'Card', icon: CreditCard },
    { label: 'Charge to Room', icon: Hotel },
  ]
  const canConfirm = selectedMethod !== null

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/30 px-4">
      <div className="w-[448px] rounded-md bg-white px-6 py-6 shadow-2xl">
        <h2 className="text-base font-normal text-slate-900">Process Payment</h2>
        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between text-base text-slate-900">
            <span>Order ID:</span>
            <span>{pendingOrder.id}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-2xl text-slate-900">
            <span>Total:</span>
            <span className="text-blue-600">{formatMoney(pendingOrder.total)}</span>
          </div>
        </div>
        <div className="mt-5 text-base text-slate-900">Select Payment Method</div>
        <div className="mt-3 space-y-3">
          {methods.map((method) => {
            const Icon = method.icon
            const active = selectedMethod === method.label

            return (
              <button
                key={method.label}
                className={[
                  'flex h-[51px] w-full items-center justify-center gap-3 rounded-lg border text-base text-slate-700',
                  active ? 'border-[#0B4EA2] bg-[#EEF4FF]' : 'border-slate-200 bg-white',
                ].join(' ')}
                type="button"
                onClick={() => onMethodChange(method.label)}
              >
                <Icon className="h-5 w-5" />
                {method.label}
              </button>
            )
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className={[
              'h-12 rounded-lg text-base text-white transition-colors',
              canConfirm ? 'bg-[#0B4EA2] hover:bg-[#093f82]' : 'cursor-not-allowed bg-[#88ACD9]',
            ].join(' ')}
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            Confirm Payment
          </button>
          <button className="h-12 rounded-lg bg-slate-200 text-base text-slate-700" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentSuccessModal({
  open,
  method,
  onClose,
}: {
  open: boolean
  method: PaymentMethod | null
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/30 px-4">
      <div className="w-[448px] rounded-md bg-white px-8 py-8 shadow-2xl">
        <div className="flex flex-col items-center">
          <Receipt className="h-[58px] w-[58px] text-blue-600" strokeWidth={2.8} />
          <h2 className="mt-5 text-2xl font-normal text-slate-950">Payment Successful</h2>
          <p className="mt-2 text-sm text-slate-500">Thank you for your payment</p>
        </div>
        <div className="mt-7 border-t border-slate-200 pt-5 text-center">
          <div className="text-lg text-slate-950">Hotel Restaurant</div>
          <div className="mt-1 text-sm text-slate-500">Receipt</div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Order ID:</span><span>{pendingOrder.id}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Date:</span><span>6/17/2026, 11:29:05 AM</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Type:</span><span>Dine In</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Table:</span><span>3</span></div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-3 text-sm">
          <div className="mb-3 text-slate-900">Items:</div>
          <div className="flex justify-between"><span className="text-slate-700">Ribeye Steak x1</span><span>{formatMoney(pendingOrder.subtotal)}</span></div>
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal:</span><span>{formatMoney(pendingOrder.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax (10%):</span><span>{formatMoney(pendingOrder.tax)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-xl"><span>Total:</span><span className="text-blue-600">{formatMoney(pendingOrder.total)}</span></div>
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-sm">
          <span className="text-slate-500">Payment Method:</span>
          <span>{method ?? 'Cash'}</span>
        </div>
        <div className="mt-5 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">Thank you for dining with us!</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="h-12 rounded-lg bg-[#0B4EA2] text-base text-white" type="button">Print Bill</button>
          <button className="h-12 rounded-lg bg-slate-200 text-base text-slate-700" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function NewTableReservationModal({
  open,
  table,
  onClose,
}: {
  open: boolean
  table: (typeof reservationTables)[number] | null
  onClose: () => void
}) {
  if (!open) return null

  const hasTable = Boolean(table)

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/30 px-4">
      <div className="w-[448px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex h-[77px] items-center justify-between bg-[#0B4EA2] px-6 text-white">
          <h2 className="text-xl font-semibold">New Reservation</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {!hasTable ? (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Table</label>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-left text-sm text-slate-400"
              >
                Select Table
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          ) : null}

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <UserRound className="h-4 w-4 text-slate-400" />
            Customer Name
          </label>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Full name" />

          <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            Phone Number
          </label>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="+1 555-0000" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Users className="h-4 w-4 text-slate-400" />
                Guests
              </label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0B4EA2]" defaultValue="2" />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                Time
              </label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="--:--:--" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="h-[42px] rounded-lg border border-slate-200 bg-white text-slate-700" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="h-[42px] rounded-lg bg-[#0B4EA2] text-white" type="button" onClick={onClose}>
              Save Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReservationTableCard({
  table,
  onReserve,
}: {
  table: (typeof reservationTables)[number]
  onReserve: (table: (typeof reservationTables)[number]) => void
}) {
  const meta = reservationStatusMeta[table.status]

  return (
    <article className={['flex h-[235px] flex-col rounded-xl border-2 p-4', meta.card].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{table.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {table.seats} seats
          </div>
        </div>
        <span className={['rounded-full px-3 py-1 text-xs font-medium', meta.badge].join(' ')}>{meta.label}</span>
      </div>

      {table.status === 'reserved' ? (
        <>
          <div className="mt-3 rounded-lg bg-white/75 px-3 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" />
              {table.guestName}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              {table.phone}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                {table.guests} guests
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {table.time}
              </span>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button type="button" className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button type="button" className="flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 text-sm text-red-600">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </>
      ) : table.status === 'available' ? (
        <button
          type="button"
          className="mt-auto flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700"
          onClick={() => onReserve(table)}
        >
          <Pencil className="h-4 w-4" />
          Reserve
        </button>
      ) : null}
    </article>
  )
}

function TableReservationsView() {
  const [activeFilter, setActiveFilter] = useState<'all' | ReservationTableStatus>('all')
  const [reservationModalOpen, setReservationModalOpen] = useState(false)
  const [selectedReservationTable, setSelectedReservationTable] = useState<(typeof reservationTables)[number] | null>(null)

  const filteredReservationTables =
    activeFilter === 'all' ? reservationTables : reservationTables.filter((table) => table.status === activeFilter)

  const openReservationModal = (table: (typeof reservationTables)[number] | null) => {
    setSelectedReservationTable(table)
    setReservationModalOpen(true)
  }

  return (
    <section className="min-h-0 overflow-y-auto px-16 py-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Table Reservations</h2>
          <p className="mt-1 text-sm text-slate-500">Manage restaurant tables and reservations</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-[#0B4EA2] px-5 text-sm font-semibold text-white"
          onClick={() => openReservationModal(null)}
        >
          <Plus className="h-5 w-5" />
          New Reservation
        </button>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={[
            'flex h-10 items-center gap-3 rounded-lg border px-4 text-sm font-medium',
            activeFilter === 'all' ? 'border-[#0B4EA2] bg-[#0B4EA2] text-white' : 'border-slate-200 bg-white text-slate-600',
          ].join(' ')}
          onClick={() => setActiveFilter('all')}
        >
          All Tables
          <span className={['rounded-full px-2 py-0.5 text-xs', activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'].join(' ')}>
            12
          </span>
        </button>
        {(['available', 'reserved', 'occupied'] as ReservationTableStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            className={[
              'flex h-10 items-center gap-3 rounded-lg border px-4 text-sm font-medium',
              activeFilter === status ? 'border-[#0B4EA2] bg-[#EEF4FF] text-[#0B4EA2]' : 'border-slate-200 bg-white text-slate-600',
            ].join(' ')}
            onClick={() => setActiveFilter(status)}
          >
            <span
              className={[
                'h-2 w-2 rounded-full',
                status === 'available' ? 'bg-emerald-500' : status === 'reserved' ? 'bg-yellow-400' : 'bg-rose-400',
              ].join(' ')}
            />
            {reservationStatusMeta[status].label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{reservationStatusMeta[status].count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {filteredReservationTables.map((table) => (
          <ReservationTableCard key={table.id} table={table} onReserve={openReservationModal} />
        ))}
      </div>

      <NewTableReservationModal open={reservationModalOpen} table={selectedReservationTable} onClose={() => setReservationModalOpen(false)} />
    </section>
  )
}

function MealStatCard({
  label,
  value,
  sublabel,
  icon,
  tone,
}: {
  label: string
  value: number
  sublabel: string
  icon: LucideIcon
  tone: 'green' | 'yellow' | 'purple' | 'blue'
}) {
  const Icon = icon
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-700',
  }

  return (
    <article className="flex h-[114px] items-center gap-5 rounded-lg border border-slate-300 bg-white px-5 shadow-sm">
      <div className={['grid h-12 w-9 place-items-center rounded-full', tones[tone]].join(' ')}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="text-sm text-slate-700">{sublabel}</div>
        <div className="mt-1 text-3xl font-semibold leading-none text-slate-900">{value}</div>
        <div className="text-sm text-slate-600">{tone === 'blue' ? 'Meals' : 'Guests'}</div>
      </div>
    </article>
  )
}

function MealStatusBadge({ status }: { status: MealGuestStatus }) {
  const classes: Record<MealGuestStatus, string> = {
    Eligible: 'bg-emerald-100 text-emerald-700',
    Redeemed: 'bg-blue-100 text-blue-700',
    Expired: 'bg-rose-100 text-rose-700',
    'Not Available': 'bg-slate-200 text-slate-600',
  }

  return <span className={['rounded-full px-3 py-1 text-xs font-semibold', classes[status]].join(' ')}>{status}</span>
}

function GuestMealDetailsPanel({
  guest,
  onClose,
}: {
  guest: (typeof guestMealRows)[number]
  onClose: () => void
}) {
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[90] flex w-[400px] flex-col overflow-hidden bg-white shadow-2xl">
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{guest.name}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-50" onClick={onClose} aria-label="Close details">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-7 border-b border-slate-200 pb-5">
          <div>
            <div className="text-sm text-slate-500">Room</div>
            <div className="mt-1 text-lg text-slate-900">{guest.room}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Reservation No.</div>
            <div className="mt-1 text-lg text-slate-900">{guest.reservation}</div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mt-6 rounded-xl border border-slate-300 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base text-slate-900">Stay Information</h3>
          <CalendarIcon />
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Check-in</span><span>18 Jul 2026</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Check-out</span><span>24 Jul 2026</span></div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
            <div><div className="text-slate-500">Adults</div><div className="mt-3">2</div></div>
            <div><div className="text-slate-500">Children</div><div className="mt-3">0</div></div>
          </div>
          <div className="border-t border-slate-200 pt-4"><div className="text-slate-500">Package</div><div className="mt-3">{guest.packageName}</div></div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-300 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base text-slate-900">Meal Information</h3>
          <Utensils className="h-5 w-5 text-slate-500" />
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Meal</span><span>Breakfast</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Meal Time</span><span>07:00 AM - 10:00 AM</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Restaurant</span><span>Main Restaurant</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Date</span><span>21 Jul 2026</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Status</span><MealStatusBadge status="Eligible" /></div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-300 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base text-slate-900">Meal History</h3>
          <RotateCcw className="h-5 w-5 text-slate-500" />
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {['18 Jul', '19 Jul', '20 Jul'].map((date) => (
            <div key={date} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><CheckCircle2 className="h-4 w-4 fill-emerald-600 text-white" />Breakfast - {date}</span>
              <span className="text-xs text-emerald-600">Redeemed</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /><span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[10px] text-white">...</span>Breakfast - 21 Jul</span>
            <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-600">Pending</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full border border-slate-300" /><span className="h-4 w-4 rounded-full border border-slate-300" />Breakfast - 22 Jul</span>
            <span className="text-xs">Upcoming</span>
          </div>
        </div>
      </div>

      </div>

      <div className="px-8 pb-3 pt-2">
        <button type="button" className="h-12 w-full rounded-lg bg-[#0B4EA2] text-base text-white shadow-md">
          Redeem Meal
        </button>
      </div>
    </aside>
  )
}

function CalendarIcon() {
  return <CalendarDays className="h-5 w-5 text-slate-500" />
}

function GuestMealsView() {
  const [selectedGuest, setSelectedGuest] = useState<(typeof guestMealRows)[number] | null>(null)

  return (
    <section className="relative min-h-0 overflow-y-auto px-16 py-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-4 gap-5">
        <MealStatCard label="Breakfast" sublabel="Today" value={42} icon={Coffee} tone="green" />
        <MealStatCard label="Lunch" sublabel="Today" value={38} icon={ConciergeBell} tone="yellow" />
        <MealStatCard label="Dinner" sublabel="Today" value={35} icon={Utensils} tone="purple" />
        <MealStatCard label="Redeemed" sublabel="" value={24} icon={CheckCircle2} tone="blue" />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
        <div className="flex h-[58px] items-end gap-10 border-b border-slate-300 px-4 text-sm font-semibold text-slate-600">
          {['Breakfast (42)', 'Lunch (38)', 'Dinner (35)', 'All Meals'].map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={[
                'h-full border-b-2 px-4 pt-5',
                index === 0 ? 'border-[#0B4EA2] text-[#0B4EA2]' : 'border-transparent',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="border-b border-slate-300 px-4 py-5">
          <div className="grid grid-cols-[minmax(320px,1fr)_140px_140px_160px] gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="h-9 w-full rounded-lg border border-slate-300 pl-10 pr-3 outline-none placeholder:text-slate-400" placeholder="Search guest name, room or reservation..." />
            </div>
            <label className="text-xs text-slate-600">
              Meal Status
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <label className="text-xs text-slate-600">
              Room Number
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <div />
          </div>

          <div className="mt-3 flex items-end gap-3">
            <label className="w-36 text-xs text-slate-600">
              Package
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <label className="w-40 text-xs text-slate-600">
              Date
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
                21 Jul 2026 <CalendarDays className="h-4 w-4" />
              </button>
            </label>
            <label className="w-40 text-xs text-slate-600">
              Restaurant
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 px-3 text-sm text-slate-700">
                Main Restaurant <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <button type="button" className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-[#0B4EA2] px-4 text-sm font-semibold text-[#0B4EA2]">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid h-14 grid-cols-[1.4fr_0.7fr_1.2fr_1fr_1fr_1fr_0.9fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-600">
          <div>Guest</div>
          <div>Room</div>
          <div>Reservation</div>
          <div>Meal Time</div>
          <div>Package</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {guestMealRows.map((guest) => (
          <div key={guest.reservation} className="grid min-h-[88px] grid-cols-[1.4fr_0.7fr_1.2fr_1fr_1fr_1fr_0.9fr] items-center border-t border-slate-100 px-4 text-sm text-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">{guest.initials}</div>
              <div>
                <div>{guest.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Users className="h-3 w-3" />
                  {guest.party}
                </div>
              </div>
            </div>
            <div>{guest.room}</div>
            <div>
              <div>{guest.reservation}</div>
              <div className="mt-1 text-xs text-slate-500">Check-out: {guest.checkout}</div>
            </div>
            <div>
              <div>07:00 AM</div>
              <div className="text-xs text-slate-500">- 10:00 AM</div>
            </div>
            <div>{guest.packageName}</div>
            <div><MealStatusBadge status={guest.status} /></div>
            <div className="flex items-center gap-3">
              {guest.action === 'Redeem' ? (
                <button type="button" className="h-7 rounded bg-[#0B4EA2] px-4 text-sm text-white" onClick={() => setSelectedGuest(guest)}>
                  Redeem
                </button>
              ) : guest.action === 'View' ? (
                <button type="button" className="h-7 rounded border border-slate-300 px-4 text-sm text-[#0B4EA2]" onClick={() => setSelectedGuest(guest)}>
                  View
                </button>
              ) : (
                <span className="px-5 text-slate-400">—</span>
              )}
              <MoreVertical className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        ))}

        <div className="flex h-14 items-center justify-between border-t border-slate-300 px-4 text-sm text-slate-600">
          <div>Showing 1 to 7 of 42 entries</div>
          <div className="flex overflow-hidden rounded-md border border-slate-300">
            {['‹', '1', '2', '3', '...', '6', '›'].map((item) => (
              <button
                key={item}
                type="button"
                className={['h-9 min-w-8 border-r border-slate-300 px-3 last:border-r-0', item === '1' ? 'bg-[#0B4EA2] text-white' : 'bg-white'].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedGuest ? <GuestMealDetailsPanel guest={selectedGuest} onClose={() => setSelectedGuest(null)} /> : null}
    </section>
  )
}

function PosPlaceholder({ title }: { title: Exclude<PosSection, 'Menu' | 'Orders'> }) {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center bg-white px-8">
      <div className="text-center">
        <div className="text-2xl font-semibold text-slate-800">{title}</div>
        <div className="mt-2 text-sm text-slate-500">This POS route is ready for its detailed screen.</div>
      </div>
    </section>
  )
}

export function CashierPOSView({ section }: { section: PosSection }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeSearch = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const pageTitle = section === 'Table Reservation' ? 'Table Reservations' : section
  const [selectedTableId, setSelectedTableId] = useState(3)
  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState(menuCategories[0].id)
  const [orderType, setOrderType] = useState<'dine-in' | 'hotel-guest'>('dine-in')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [cart, setCart] = useState<CartLine[]>([
    {
      id: 'mockup-fresh-orange-juice',
      name: 'Fresh Orange Juice',
      categoryId: 'drink',
      price: 8.99,
      quantity: 1,
    },
  ])

  const selectedTable = restaurantTables.find((table) => table.id === selectedTableId) ?? restaurantTables[0]

  const filteredTables = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return restaurantTables

    return restaurantTables.filter((table) =>
      [table.name, table.guest, statusStyles[table.status].text].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [search])

  const activeItems = menuItems.filter((item) => item.categoryId === activeCategoryId)
  const displayItems = useMemo(() => {
    if (activeCategoryId !== 'drink') return activeItems

    return [
      { id: 'mock-drink-1', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-2', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-3', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-4', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-5', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-6', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-7', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
      { id: 'mock-drink-8', name: 'Apple Cider', price: 15, categoryId: 'drink' },
      { id: 'mock-drink-9', name: 'Mango Smoothie', price: 18, categoryId: 'drink' },
    ]
  }, [activeCategoryId, activeItems])

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) {
        return current.map((line) => (line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line))
      }

      return [...current, { ...item, quantity: 1 }]
    })
  }

  const decreaseCartLine = (itemId: string) => {
    setCart((current) =>
      current
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const openPayment = () => {
    setPaymentMethod(null)
    setPaymentOpen(true)
  }

  const confirmPayment = () => {
    if (!paymentMethod) return
    setPaymentOpen(false)
    setSuccessOpen(true)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white text-[#071329]">
      <div className="grid h-full w-full min-w-[1180px] grid-cols-[260px_minmax(0,1fr)]">
        <PosSidebar search={routeSearch} />

        <main className="flex min-w-0 flex-col overflow-hidden">
          <header className="flex h-20 flex-shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 shadow-sm xl:px-6">
            <div className="flex items-center gap-4">
              <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-10 w-auto lg:hidden" />
              <h1 className="text-[26px] font-semibold text-slate-800">{pageTitle}</h1>
            </div>
            <div className="flex items-center justify-end gap-8">
              <button
                type="button"
                className="flex h-10 items-center gap-1 rounded-2xl bg-[#0B4EA2] px-2.5 pr-4 text-[21px] font-semibold text-white"
                onClick={() => navigate(`${routes.pos.orders}${routeSearch}`)}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-sm font-bold text-slate-900">
                  2
                </span>
                Pending order II
              </button>
              <div className="relative">
                <Bell className="h-8 w-8 text-slate-700" />
                <span className="absolute right-0 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#DCEBFF]">
                  <User className="h-6 w-6 fill-slate-950 text-slate-950" />
                </div>
                <div>
                  <div className="text-base text-slate-900">cashier name</div>
                  <div className="text-sm text-slate-500">Morning Shift</div>
                </div>
              </div>
            </div>
          </header>

          {section === 'Orders' ? (
            <OrdersView onPay={openPayment} />
          ) : section === 'Table Reservation' ? (
            <TableReservationsView />
          ) : section === 'Guest Meals' ? (
            <GuestMealsView />
          ) : (
          <div className="min-h-0 flex-1 overflow-hidden bg-white">
            <div className="grid h-full grid-cols-[228px_minmax(0,1fr)_276px]">
            <section className="border-r border-slate-100 px-7 py-6">
              <label className="text-sm font-medium text-slate-700" htmlFor="table-search">
                Room Number
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  id="table-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Room number,Guest name"
                  className="h-8 w-full rounded-md border border-slate-400 pl-8 pr-3 text-[10px] outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                />
              </div>

              <h2 className="mt-5 text-sm font-semibold text-slate-700">Tables</h2>
              <div className="mt-7 border-t border-slate-100 pt-4">
                <StatusLegend />
              </div>
              <div className="mt-6 grid max-h-[calc(100vh-228px)] grid-cols-1 gap-1.5 overflow-y-auto pb-20 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    selected={table.id === selectedTableId}
                    onSelect={() => setSelectedTableId(table.id)}
                  />
                ))}
              </div>
            </section>

            <section className="min-w-0 overflow-y-auto px-5 pb-24 pt-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[22px] font-medium text-slate-950">{selectedTable.name}</h2>
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600">
                      {statusStyles[selectedTable.status].text}
                    </span>
                  </div>
                </div>
                <div className="relative w-[342px] flex-shrink-0">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                  <input
                    placeholder="Search item..."
                    className="h-10 w-full rounded-full bg-slate-100 pl-12 pr-4 text-xl text-slate-500 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-[#0B4EA2]/20"
                  />
                </div>
              </div>

              <h3 className="mt-6 text-[22px] font-normal text-slate-950">Order Type</h3>
              <div className="mt-4 grid max-w-[535px] grid-cols-2 gap-[138px]">
                {[
                  { id: 'dine-in' as const, label: 'Dine in', icon: Utensils },
                  { id: 'hotel-guest' as const, label: 'Hotel Guest', icon: Hotel },
                ].map((type) => {
                  const Icon = type.icon
                  const active = orderType === type.id

                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={[
                        'grid h-[115px] w-[198px] place-items-center rounded-2xl text-[#063272] transition-all',
                        active ? 'bg-[#0B4EA2] text-white' : 'bg-[#F1F6FC] hover:bg-[#E7F0FB]',
                      ].join(' ')}
                      onClick={() => setOrderType(type.id)}
                    >
                      <span className="flex flex-col items-center gap-2 text-xl font-normal">
                        <Icon className="h-8 w-8" />
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <h3 className="mt-6 text-[22px] font-normal text-slate-950">Category</h3>
              <div className="mt-4 grid grid-cols-4 gap-5">
                {menuCategories.map((category) => {
                  const Icon = categoryIcons[category.id] ?? Coffee
                  const active = category.id === activeCategoryId

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={[
                        'grid h-20 place-items-center rounded-2xl border text-[#063272] transition-all',
                        active
                          ? 'border-[#0B4EA2] bg-[#F1F6FC] ring-1 ring-[#0B4EA2]'
                          : 'border-transparent bg-[#F1F6FC] hover:bg-[#E7F0FB]',
                      ].join(' ')}
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      <span className="flex flex-col items-center text-base leading-tight">
                        <Icon className="mb-1 h-8 w-8" />
                        {category.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-9 pb-12 pr-2">
                {displayItems.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-white px-2.5 py-3 shadow-sm">
                    <div className="grid h-12 place-items-center">
                      <Coffee className="h-10 w-10 text-slate-950" strokeWidth={2} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-slate-950">{item.name}</span>
                      <span className="font-bold text-slate-950">{formatMoney(item.price)}</span>
                    </div>
                    <button
                      type="button"
                      className="mt-4 flex h-7 w-full items-center justify-center gap-1 rounded-full text-base text-white"
                      style={{ backgroundColor: '#18CE63' }}
                      onClick={() => addToCart(item)}
                    >
                      <CirclePlus className="h-5 w-5 fill-white/25" />
                      add
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <OrderSummary selectedTable={selectedTable} cart={cart} onDecrease={decreaseCartLine} onIncrease={addToCart} onPay={openPayment} />
            </div>
          </div>
          )}
        </main>
      </div>
      <ProcessPaymentModal
        open={paymentOpen}
        selectedMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
        onConfirm={confirmPayment}
        onClose={() => setPaymentOpen(false)}
      />
      <PaymentSuccessModal open={successOpen} method={paymentMethod} onClose={() => setSuccessOpen(false)} />
    </div>
  )
}
