import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  CakeSlice,
  CalendarDays,
  AlertTriangle,
  Box,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  Coffee,
  ClipboardList,
  CreditCard,
  DollarSign,
  Grid2X2,
  Hotel as HotelIcon,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  Soup,
  Trash2,
  User,
  UserRound,
  Users,
  Utensils,
  UploadCloud,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { routes } from '../../../../shared/lib/routes'

type AdminTabKey = 'dashboard' | 'liveOrders' | 'reservationsMeals' | 'menuManagement' | 'inventory' | 'reports'
type PaymentMethod = 'Cash' | 'Card' | 'Charge to Room'

type AdminNavItem = {
  key: AdminTabKey
  label: string
  icon: LucideIcon
  to: string
}

const adminNavItems: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: routes.pos.admin.dashboard },
  { key: 'liveOrders', label: 'Live Orders', icon: ShoppingCart, to: routes.pos.admin.liveOrders },
  { key: 'reservationsMeals', label: 'Guest Meals', icon: Utensils, to: routes.pos.admin.reservationsMeals },
  { key: 'menuManagement', label: 'Menu Management', icon: ReceiptText, to: routes.pos.admin.menuManagement },
  { key: 'inventory', label: 'Inventory', icon: Package, to: routes.pos.admin.inventory },
  { key: 'reports', label: 'Reports', icon: ClipboardList, to: routes.pos.admin.reports },
]

const revenueData = [
  { time: '9 AM', revenue: 320 },
  { time: '10 AM', revenue: 610 },
  { time: '11 AM', revenue: 760 },
  { time: '12 PM', revenue: 1220 },
  { time: '1 PM', revenue: 1560 },
  { time: '2 PM', revenue: 1320 },
  { time: '3 PM', revenue: 980 },
  { time: '4 PM', revenue: 740 },
  { time: '5 PM', revenue: 860 },
  { time: '6 PM', revenue: 1420 },
  { time: '7 PM', revenue: 1780 },
  { time: '8 PM', revenue: 2100 },
]

const recentOrders = [
  { table: 'T5', id: 'ORD-1042', items: '3 items', time: '8:12 PM', amount: '$72.97', status: 'Completed' },
  { table: 'T12', id: 'ORD-1041', items: '6 items', time: '8:05 PM', amount: '$134.50', status: 'In Kitchen' },
  { table: 'T2', id: 'ORD-1040', items: '2 items', time: '7:58 PM', amount: '$33.98', status: 'In Kitchen' },
  { table: 'T8', id: 'ORD-1039', items: '4 items', time: '7:45 PM', amount: '$89.96', status: 'Completed' },
  { table: 'T3', id: 'ORD-1038', items: '5 items', time: '7:32 PM', amount: '$102.45', status: 'Completed' },
]

const tableStatuses = [
  'Available',
  'Occupied',
  'Reserved',
  'Available',
  'Occupied',
  'Reserved',
  'Available',
  'Occupied',
  'Available',
  'Reserved',
  'Available',
] as const

const liveOrderRows = [
  {
    id: '#ORD-0092',
    dateTime: 'Today, 11:45 AM',
    customer: 'Sarah Adams',
    initials: 'SA',
    type: 'Dine-in',
    total: '$45.50',
    status: 'Preparing',
    canPay: true,
  },
  {
    id: '#ORD-0091',
    dateTime: 'Today, 11:30 AM',
    customer: 'John Doe',
    initials: 'JD',
    type: 'Room Service',
    total: '$120.00',
    status: 'Pending',
    canPay: false,
  },
  {
    id: '#ORD-0090',
    dateTime: 'Today, 11:15 AM',
    customer: 'Guest Walk-in',
    initials: '',
    type: 'Dine-in',
    total: '$18.75',
    status: 'Ready',
    canPay: false,
  },
  {
    id: '#ORD-0089',
    dateTime: 'Today, 10:45 AM',
    customer: 'Mike Ross',
    initials: 'MR',
    type: 'Room Service',
    total: '$85.20',
    status: 'Delivered',
    canPay: false,
  },
]

const guestMealRows = [
  {
    initials: 'AM',
    guest: 'Ahmed Mohamed',
    party: '2 Adults',
    adults: 2,
    children: 0,
    room: '305',
    reservation: 'RES-1023',
    checkout: '24 Jul',
    checkinDate: '18 Jul 2026',
    checkoutDate: '24 Jul 2026',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Bed & Breakfast',
    meal: 'Breakfast',
    restaurant: 'Main Restaurant',
    date: '21 Jul 2026',
    status: 'Eligible',
    action: 'Redeem',
  },
  {
    initials: 'SA',
    guest: 'Sara Ali',
    party: '2 Adults',
    adults: 2,
    children: 0,
    room: '212',
    reservation: 'RES-1045',
    checkout: '22 Jul',
    checkinDate: '17 Jul 2026',
    checkoutDate: '22 Jul 2026',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Half Board',
    meal: 'Breakfast',
    restaurant: 'Main Restaurant',
    date: '21 Jul 2026',
    status: 'Redeemed',
    action: 'View',
  },
  {
    initials: 'JS',
    guest: 'John Smith',
    party: '1 Adult',
    adults: 1,
    children: 0,
    room: '118',
    reservation: 'RES-1090',
    checkout: '23 Jul',
    checkinDate: '19 Jul 2026',
    checkoutDate: '23 Jul 2026',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Full Board',
    meal: 'Breakfast',
    restaurant: 'Main Restaurant',
    date: '21 Jul 2026',
    status: 'Expired',
    action: 'View',
  },
  {
    initials: 'MA',
    guest: 'Mariam Adel',
    party: '2 Adults, 1 Child',
    adults: 2,
    children: 1,
    room: '410',
    reservation: 'RES-1112',
    checkout: '25 Jul',
    checkinDate: '20 Jul 2026',
    checkoutDate: '25 Jul 2026',
    mealTime: '07:00 AM - 10:00 AM',
    packageName: 'Full Board',
    meal: 'Breakfast',
    restaurant: 'Main Restaurant',
    date: '21 Jul 2026',
    status: 'Not Available',
    action: 'None',
  },
]

const menuCategoryRows = [
  { order: 1, name: 'Main Dishes', secondaryName: 'Main Dishes', itemsCount: 5, status: 'Active' },
  { order: 2, name: 'Side Dishes', secondaryName: 'Side Dishes', itemsCount: 4, status: 'Active' },
  { order: 3, name: 'Beverages', secondaryName: 'Beverages', itemsCount: 0, status: 'Active' },
  { order: 4, name: 'Desserts', secondaryName: 'Desserts', itemsCount: 0, status: 'Active' },
]

const menuSectionRows: Array<{ label: string; count: number; icon: LucideIcon }> = [
  { label: 'All Products', count: 48, icon: Grid2X2 },
  { label: 'Beverages', count: 10, icon: Coffee },
  { label: 'Main Dishes', count: 12, icon: Soup },
  { label: 'Salads', count: 6, icon: Utensils },
  { label: 'Desserts', count: 8, icon: CakeSlice },
  { label: 'Appetizers', count: 7, icon: ReceiptText },
  { label: 'Kids Meals', count: 5, icon: UserRound },
]

const managedMenuItems = [
  {
    name: 'Fresh Orange Juice',
    description: '100% natural orange juice',
    category: 'Beverages',
    price: '20.00',
    status: 'Active',
    thumbnail: 'from-orange-100 via-amber-200 to-orange-400',
  },
  {
    name: 'Beef Burger',
    description: 'Grilled beef burger with vegetables and cheese',
    category: 'Main Dishes',
    price: '45.00',
    status: 'Active',
    thumbnail: 'from-yellow-100 via-orange-200 to-red-300',
  },
  {
    name: 'Caesar Salad',
    description: 'Romaine lettuce with Caesar dressing and chicken',
    category: 'Salads',
    price: '25.00',
    status: 'Active',
    thumbnail: 'from-emerald-100 via-lime-200 to-green-400',
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich and delicious chocolate cake',
    category: 'Desserts',
    price: '18.00',
    status: 'Active',
    thumbnail: 'from-stone-800 via-amber-950 to-stone-500',
  },
  {
    name: 'French Fries',
    description: 'Crispy fries with sea salt',
    category: 'Appetizers',
    price: '15.00',
    status: 'Active',
    thumbnail: 'from-yellow-50 via-yellow-200 to-amber-500',
  },
  {
    name: 'Mango Smoothie',
    description: 'Fresh and refreshing mango smoothie',
    category: 'Beverages',
    price: '22.00',
    status: 'Active',
    thumbnail: 'from-yellow-100 via-orange-200 to-amber-400',
  },
]

const inventoryItems = [
  { name: 'Beef Tenderloin', category: 'Meat', quantity: 8, unit: 'kg', minStock: 10, status: 'Low Stock', updated: '2026-03-05', progress: 40 },
  { name: 'Salmon Fillet', category: 'Seafood', quantity: 12, unit: 'kg', minStock: 8, status: 'In Stock', updated: '2026-03-05', progress: 75 },
  { name: 'Spaghetti', category: 'Pasta', quantity: 5, unit: 'kg', minStock: 10, status: 'Low Stock', updated: '2026-03-04', progress: 25 },
  { name: 'Heavy Cream', category: 'Dairy', quantity: 3, unit: 'L', minStock: 5, status: 'Low Stock', updated: '2026-03-05', progress: 30 },
  { name: 'Eggs', category: 'Dairy', quantity: 120, unit: 'pcs', minStock: 60, status: 'In Stock', updated: '2026-03-05', progress: 100 },
  { name: 'Olive Oil', category: 'Oils', quantity: 8, unit: 'L', minStock: 4, status: 'In Stock', updated: '2026-03-03', progress: 100 },
  { name: 'Tomatoes', category: 'Vegetables', quantity: 4, unit: 'kg', minStock: 6, status: 'Low Stock', updated: '2026-03-05', progress: 32 },
  { name: 'Garlic', category: 'Vegetables', quantity: 2, unit: 'kg', minStock: 2, status: 'Low Stock', updated: '2026-03-04', progress: 50 },
  { name: 'Dark Chocolate', category: 'Baking', quantity: 3, unit: 'kg', minStock: 5, status: 'Low Stock', updated: '2026-03-03', progress: 30 },
]

const inventoryCategories = ['All', 'Meat', 'Seafood', 'Pasta', 'Dairy', 'Oils', 'Vegetables', 'Baking', 'Bakery']

const topSellingItems = [
  { rank: 1, icon: '🍔', item: 'Grilled Burger', quantity: 320, revenue: '$48,000' },
  { rank: 2, icon: '🍕', item: 'Margherita Pizza', quantity: 280, revenue: '$42,000' },
  { rank: 3, icon: '🍝', item: 'Pasta Alfredo', quantity: 210, revenue: '$26,000' },
  { rank: 4, icon: '🥗', item: 'Chicken Caesar Salad', quantity: 180, revenue: '$18,000' },
]

const orderRevenueRows = [
  { id: '#1025', guest: 'John Smith', room: '315', orders: 5, total: '€660', date: '11/05/2026 02:45 PM', source: 'Dine In', status: 'Paid' },
  { id: '#1026', guest: 'Ahmed Ali', room: '315', orders: 4, total: '€550', date: '11/05/2026 02:45 PM', source: 'Room service', status: 'Charged' },
  { id: '#1027', guest: 'Maya Noor', room: '221', orders: 3, total: '€420', date: '11/05/2026 01:20 PM', source: 'Dine In', status: 'Paid' },
  { id: '#1028', guest: 'Lina Park', room: '119', orders: 2, total: '€310', date: '11/05/2026 12:10 PM', source: 'Dine In', status: 'Paid' },
  { id: '#1029', guest: 'Omar Samir', room: '408', orders: 6, total: '€580', date: '11/05/2026 11:45 AM', source: 'Dine In', status: 'Paid' },
  { id: '#1030', guest: 'Sarah Adams', room: '512', orders: 1, total: '€280', date: '11/05/2026 10:05 AM', source: 'Dine In', status: 'Paid' },
]

const orderDetails = {
  id: '#1025',
  status: 'Charged',
  date: '11/05/2026 02:45 PM',
  type: 'Room Service',
  paymentMethod: 'Room Charge',
  guest: 'Ahmed Ali',
  room: '315',
  phone: '+20 100 123 4567',
  items: [
    { item: 'Grilled Burger', quantity: 2, price: '$12.00', total: '$24.00' },
    { item: 'French Fries', quantity: 1, price: '$4.00', total: '$4.00' },
    { item: 'Caesar Salad', quantity: 1, price: '$6.00', total: '$6.00' },
    { item: 'Fresh Juice', quantity: 2, price: '$5.00', total: '$10.00' },
  ],
  subtotal: '$44.00',
  service: '$4.40',
  vat: '$6.78',
  total: '$55.18',
}

type RevenueFilter = 'All' | 'Dine In' | 'Room Service'

const reportMetricCards: Array<{ label: string; value: string; icon: LucideIcon; tone: string }> = [
  { label: 'Total Revenue', value: '$125,450', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600' },
  { label: 'Total Orders', value: '1,280', icon: ShoppingCart, tone: 'bg-blue-50 text-blue-600' },
  { label: 'Hotel Guest Orders', value: '860', icon: HotelIcon, tone: 'bg-indigo-50 text-indigo-600' },
  { label: 'Walk-In Orders', value: '420', icon: UserRound, tone: 'bg-orange-50 text-orange-500' },
]

function getActiveTab(pathname: string): AdminNavItem {
  const exact = adminNavItems.find((item) => item.to === pathname)
  if (exact) return exact

  return adminNavItems.find((item) => pathname.startsWith(item.to) && item.key !== 'dashboard') ?? adminNavItems[0]
}

function statusClass(status: string) {
  if (status === 'Completed' || status === 'Eligible' || status === 'Available' || status === 'Healthy') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'Redeemed') return 'bg-blue-50 text-blue-700'
  if (status === 'Delivered' || status === 'Not Available') return 'bg-slate-100 text-slate-600'

  if (status === 'In Kitchen' || status === 'Preparing' || status === 'Review' || status === 'Watch' || status === 'Ready') {
    return 'bg-orange-50 text-orange-700'
  }

  if (status === 'New') return 'bg-blue-50 text-blue-700'

  return 'bg-rose-50 text-rose-700'
}

function NewReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[448px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex h-[77px] items-center justify-between bg-[#0B4EA2] px-6 text-white">
          <h2 className="text-[22px] font-semibold">New Reservation</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Table</label>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-left text-sm text-slate-400"
          >
            Select Table
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <UserRound className="h-4 w-4 text-slate-400" />
            Customer Name
          </label>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Full name" />

          <label className="mb-2 mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
            Phone Number
          </label>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="+1 555-0000" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="h-4 w-4 text-slate-400" />
                Guests
              </label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0B4EA2]" defaultValue="2" />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
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
    { label: 'Charge to Room', icon: HotelIcon },
  ]
  const canConfirm = selectedMethod !== null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[448px] rounded-md bg-white px-6 py-6 shadow-2xl">
        <h2 className="text-base font-normal text-slate-900">Process Payment</h2>
        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between text-base text-slate-900">
            <span>Order ID:</span>
            <span>ORD-1781684945310</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-2xl text-slate-900">
            <span>Total:</span>
            <span className="text-blue-600">$40.69</span>
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
                  'flex h-[51px] w-full items-center justify-center gap-3 rounded-lg border text-base text-slate-700 transition-colors',
                  active ? 'border-[#0B4EA2] bg-[#EEF4FF]' : 'border-slate-200 bg-white hover:bg-slate-50',
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
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/35 px-4">
      <div className="w-[448px] rounded-md bg-white px-8 py-8 shadow-2xl">
        <div className="flex flex-col items-center">
          <ReceiptText className="h-[58px] w-[58px] text-blue-600" strokeWidth={2.8} />
          <h2 className="mt-5 text-2xl font-normal text-slate-950">Payment Successful</h2>
          <p className="mt-2 text-sm text-slate-500">Thank you for your payment</p>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-5 text-center">
          <div className="text-lg text-slate-950">Hotel Restaurant</div>
          <div className="mt-1 text-sm text-slate-500">Receipt</div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Order ID:</span><span>ORD-1781684945310</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Date:</span><span>6/17/2026, 11:29:05 AM</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Type:</span><span>Dine In</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Table:</span><span>3</span></div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-3 text-sm">
          <div className="mb-3 text-slate-900">Items:</div>
          <div className="flex justify-between"><span className="text-slate-700">Ribeye Steak x1</span><span>$36.99</span></div>
        </div>
        <div className="mt-5 space-y-2 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal:</span><span>$36.99</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax (10%):</span><span>$3.70</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-xl"><span>Total:</span><span className="text-blue-600">$40.69</span></div>
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

function AddCategoryModal({
  open,
  category,
  onClose,
}: {
  open: boolean
  category: (typeof menuCategoryRows)[number] | null
  onClose: () => void
}) {
  if (!open) return null

  const categoryIcons: LucideIcon[] = [Utensils, CakeSlice, ReceiptText, Coffee, MoreHorizontal]
  const editing = category !== null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[438px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-[67px] items-center justify-between bg-[#0B4EA2] px-5 text-white">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Category' : 'Add Category'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Enter category name"
            defaultValue={category?.name ?? ''}
          />

          <div className="mt-4 text-sm font-medium text-slate-700">Category Icon</div>
          <div className="mt-2 flex gap-2">
            {categoryIcons.map((Icon, index) => (
              <button
                key={index}
                type="button"
                className={[
                  'grid h-10 w-10 place-items-center rounded border text-slate-500',
                  index === 0 ? 'border-[#155BFF] bg-blue-50 text-[#155BFF]' : 'border-slate-200 bg-white',
                ].join(' ')}
                aria-label={`Category icon ${index + 1}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">Display Order</label>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Enter display order (optional)"
            defaultValue={category?.order ?? ''}
          />

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">Status</label>
          <button type="button" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 px-3 text-left text-sm text-green-600">
            {category?.status ?? 'Active'}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-5">
          <button className="h-9 w-24 rounded-md bg-slate-100 text-sm text-slate-700" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="h-9 w-36 rounded-md bg-[#213B96] text-sm text-white" type="button" onClick={onClose}>
            {editing ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemModal({
  open,
  item,
  onClose,
}: {
  open: boolean
  item: (typeof managedMenuItems)[number] | null
  onClose: () => void
}) {
  if (!open) return null

  const editing = item !== null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[438px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-[67px] items-center justify-between bg-[#0B4EA2] px-5 text-white">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Item' : 'Add Item'}</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Enter item name"
            defaultValue={item?.name ?? ''}
          />

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <button type="button" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 px-3 text-left text-sm text-slate-500">
            {item?.category ?? 'Select category'}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
              placeholder="Enter price"
              defaultValue={item?.price ?? ''}
            />
          </div>

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="h-[58px] w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Enter item description (optional)"
            defaultValue={item?.description ?? ''}
          />

          <div className="mt-4 text-sm font-medium text-slate-700">Item Image</div>
          <button type="button" className="mt-2 grid h-[140px] w-full place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center">
            <span>
              <UploadCloud className="mx-auto h-8 w-8 text-blue-500" />
              <span className="mt-2 block text-sm font-medium text-slate-800">Click to upload image</span>
              <span className="mt-1 block text-sm text-slate-500">or drag and drop</span>
              <span className="mt-1 block text-xs text-slate-400">JPG, PNG up to 2MB</span>
            </span>
          </button>

          <label className="mb-2 mt-4 block text-sm font-medium text-slate-700">Status</label>
          <button type="button" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 px-3 text-left text-sm text-green-600">
            {item?.status ?? 'Active'}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-5">
          <button className="h-9 w-24 rounded-md bg-slate-100 text-sm text-slate-700" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="h-9 w-28 rounded-md bg-[#213B96] text-sm text-white" type="button" onClick={onClose}>
            Save Item
          </button>
        </div>
      </div>
    </div>
  )
}

function InventoryCategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[672px] overflow-hidden rounded-xl bg-[#F8F8FC] shadow-2xl">
        <div className="flex h-[106px] items-start justify-between bg-[#0B4EA2] px-8 py-7 text-white">
          <div>
            <h2 className="text-2xl font-semibold">Add New Category</h2>
            <p className="mt-1 text-sm text-white">Create a new group to organize your inventory items</p>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 py-6">
          <label className="mb-2 block text-sm font-medium text-slate-900">Category Name</label>
          <input className="h-10 w-full rounded-lg border border-slate-500 bg-white px-4 text-base outline-none placeholder:text-slate-500 focus:border-[#0B4EA2]" placeholder="e.g., Fresh Produce" />

          <div className="mt-6 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-900">Description</label>
            <span className="text-sm text-slate-500">Optional</span>
          </div>
          <textarea className="mt-2 h-[90px] w-full resize-none rounded-lg border border-slate-500 bg-white px-4 py-3 text-base outline-none placeholder:text-slate-500 focus:border-[#0B4EA2]" placeholder="Briefly describe what items belong in this category..." />
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-200 px-8 py-6">
          <button className="h-12 w-28 rounded-xl border border-slate-500 bg-white text-base font-semibold text-slate-500" type="button" onClick={onClose}>
            cancel
          </button>
          <button className="h-12 w-40 rounded-lg bg-[#0B4EA2] text-base font-semibold text-white" type="button" onClick={onClose}>
            Add Category
          </button>
        </div>
      </div>
    </div>
  )
}

function AddIngredientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[448px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex h-[77px] items-center justify-between bg-[#0B4EA2] px-6 text-white">
          <h2 className="text-[22px] font-semibold">Add Ingredient</h2>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Ingredient Name <span className="text-red-500">*</span>
          </label>
          <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="e.g. Olive Oil" />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0B4EA2]" defaultValue="0" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Unit <span className="text-red-500">*</span>
              </label>
              <button type="button" className="flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-left text-slate-700">
                Unit <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Min Stock Alert</label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0B4EA2]" defaultValue="0" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
              <button type="button" className="flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-left text-slate-700">
                Category <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="h-12 rounded-xl border border-slate-500 bg-white text-base font-semibold text-slate-500" type="button" onClick={onClose}>
              cancel
            </button>
            <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] text-base text-white" type="button" onClick={onClose}>
              <ReceiptText className="h-4 w-4" />
              Add Ingredient
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PurchaseRequestModal({
  open,
  item,
  onClose,
}: {
  open: boolean
  item: (typeof inventoryItems)[number] | null
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[504px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-[73px] items-center justify-between bg-[#0B4EA2] px-6 text-white">
          <h2 className="text-xl font-semibold">New Purchase Request</h2>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="space-y-5 px-8 py-7">
          <label className="block text-base font-medium text-slate-900">
            Item
            <button type="button" className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-left text-sm text-slate-700">
              {item?.name ?? 'Select a Item'} <ChevronDown className="h-4 w-4" />
            </button>
          </label>
          <label className="block text-base font-medium text-slate-900">
            Priority
            <button type="button" className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-left text-sm text-slate-700">
              Normal <ChevronDown className="h-4 w-4" />
            </button>
          </label>
          <label className="block text-base font-medium text-slate-900">
            Quantity
            <input className="mt-2 h-10 w-full rounded-lg border border-blue-200 px-3 text-sm outline-none focus:border-[#0B4EA2]" defaultValue="0" />
          </label>
          <label className="block text-base font-medium text-slate-900">
            Request by
            <input className="mt-2 h-10 w-full rounded-lg border border-blue-200 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Requested by James M." />
          </label>
          <label className="block text-base font-medium text-slate-900">
            Request Reason
            <textarea className="mt-2 h-24 w-full resize-none rounded-lg border border-blue-200 px-3 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Please explain why these materials are needed..." />
          </label>
        </div>

        <div className="flex justify-end gap-3 px-8 pb-7">
          <button className="h-12 w-28 rounded-xl border border-slate-500 bg-white text-base font-semibold text-slate-500" type="button" onClick={onClose}>
            cancel
          </button>
          <button className="h-12 w-44 rounded-lg bg-[#0B4EA2] text-base text-white" type="button" onClick={onClose}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickWithdrawModal({
  open,
  item,
  onClose,
}: {
  open: boolean
  item: (typeof inventoryItems)[number] | null
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-4">
      <div className="w-[790px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-[100px] items-center justify-between bg-[#0B4EA2] px-20 text-white">
          <h2 className="text-xl font-semibold">Quick Withdraw</h2>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close">
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="space-y-5 px-20 py-10">
          <label className="block text-base font-semibold text-slate-800">
            Item Name <span className="text-red-500">*</span>
            <button type="button" className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-left text-sm text-slate-700">
              {item?.name ?? 'Select a Item'} <ChevronDown className="h-4 w-4" />
            </button>
          </label>

          <div className="grid grid-cols-2 gap-5">
            <label className="block text-base font-semibold text-slate-800">
              Withdraw Quantity <span className="text-red-500">*</span>
              <input className="mt-2 h-10 w-full rounded-lg border border-blue-100 px-3 text-sm outline-none placeholder:text-slate-500 focus:border-[#0B4EA2]" placeholder="Enter quantity" />
            </label>
            <label className="block text-base font-semibold text-slate-800">
              Remaining Stock <span className="text-red-500">*</span>
              <input className="mt-2 h-10 w-full rounded-lg border border-blue-100 px-3 text-sm outline-none focus:border-[#0B4EA2]" defaultValue={item ? String(item.quantity) : '40'} />
            </label>
          </div>

          <label className="block text-base font-semibold text-slate-800">
            Taken By <span className="text-red-500">*</span>
            <input className="mt-2 h-10 w-full rounded-lg border border-blue-100 px-3 text-sm outline-none focus:border-[#0B4EA2]" defaultValue="Sarah Miller" />
          </label>

          <label className="block text-base font-semibold text-slate-800">
            Reason
            <textarea className="mt-2 h-20 w-full resize-none rounded-lg border border-blue-100 px-3 py-3 text-base outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Purpose of withdrawal..." />
          </label>

          <div className="flex h-11 items-center gap-3 rounded-lg bg-slate-50 px-3 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            5/18/2026 03:44 PM
          </div>
        </div>

        <div className="flex justify-end gap-5 px-20 pb-11">
          <button className="h-12 w-28 rounded-xl border border-slate-500 bg-white text-base font-semibold text-slate-500" type="button" onClick={onClose}>
            cancel
          </button>
          <button className="h-12 w-56 rounded-lg bg-[#0B4EA2] text-base font-semibold text-white" type="button" onClick={onClose}>
            Confirm Withdraw
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminSidebar({ activeKey }: { activeKey: AdminTabKey }) {
  return (
    <aside
      className="flex h-full w-[306px] flex-col shadow-sm"
      style={{
        background: 'linear-gradient(to right, #0B4EA2 0 47px, #ffffff 47px 100%)',
      }}
    >
      <div className="grid flex-shrink-0 grid-cols-[47px_1fr]">
        <div />
        <div className="border-b border-slate-100 px-7 pb-5 pt-7">
          <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-11 w-auto" />
          <div className="mt-5 text-[17px] font-semibold text-[#063272]">Restaurant Management</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pb-6 pt-11">
        {adminNavItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink key={item.key} to={item.to} className="relative grid grid-cols-[47px_1fr] items-center text-slate-700">
              <div className="grid h-[58px] w-[47px] place-items-center bg-[#0B4EA2]">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="relative flex h-[58px] items-center px-4 text-[20px]">
                {activeKey === item.key ? (
                  <>
                    <span className="absolute inset-y-0 left-0 right-4 rounded-sm bg-[#D9E9FF]" aria-hidden="true" />
                    <span
                      className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
                      aria-hidden="true"
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderRight: '9px solid #D9E9FF',
                      }}
                    />
                  </>
                ) : null}
                <span className={['relative truncate', activeKey === item.key ? 'font-medium text-[#0B4EA2]' : 'text-slate-700'].join(' ')}>
                  {item.label}
                </span>
              </div>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

function AdminHeader({ title }: { title: string }) {
  const navigate = useNavigate()

  return (
    <header className="flex h-20 flex-shrink-0 items-center justify-between gap-5 border-b border-slate-200 bg-white px-5 shadow-sm">
      <h1 className="text-[28px] font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0B4EA2] px-9 text-[20px] font-semibold text-white shadow-sm hover:bg-[#093f82]"
          onClick={() => navigate(`${routes.pos.menu}?role=cashier`)}
        >
          <Plus className="h-5 w-5" />
          New Order
        </button>
        <div className="relative">
          <Bell className="h-8 w-8 text-slate-700" />
          <span className="absolute right-0 top-1 h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div className="flex min-w-[200px] items-center gap-3 rounded-l-[28px] bg-white px-2 py-2 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#DCEBFF]">
            <User className="h-6 w-6 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">Name+ Manager</div>
            <div className="mt-1 text-sm text-slate-500">Morning Shift</div>
          </div>
        </div>
      </div>
    </header>
  )
}

function KpiCard({
  label,
  value,
  detail,
  accent,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  accent: 'blue' | 'orange' | 'green' | 'purple'
  icon: LucideIcon
}) {
  const tones = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-violet-100 text-violet-600',
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={['grid h-10 w-10 place-items-center rounded-xl', tones[accent]].join(' ')}>
          <Icon className="h-5 w-5" />
        </span>
        {accent === 'blue' || accent === 'purple' ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {accent === 'blue' ? '+8' : '+12%'}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-2xl font-medium text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{detail}</div>
    </article>
  )
}

function DashboardTab({ onReserveTable }: { onReserveTable: () => void }) {
  const navigate = useNavigate()

  return (
    <section className="px-5 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-semibold text-slate-900">Restaurant Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back, Alex. Here is what is happening today.</p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-orange-500" />
          Live - Updated just now
        </div>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-6">
        <KpiCard label="Today's Orders" value="42" detail="+8 from yesterday" accent="blue" icon={ShoppingCart} />
        <KpiCard label="Active Tables" value="7" detail="5 available" accent="orange" icon={Utensils} />
        <KpiCard label="Completed Orders" value="38" detail="4 in progress" accent="green" icon={CheckCircle2} />
        <KpiCard label="Revenue Today" value="$3,840" detail="+12% vs yesterday" accent="purple" icon={DollarSign} />
      </div>

      <div className="mt-11 grid grid-cols-[minmax(0,1fr)_398px] gap-4">
        <div className="min-w-0 space-y-11">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
                <p className="mt-1 text-xs text-slate-400">Today's hourly revenue</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-1 text-sm text-emerald-700">$3,840 total</span>
            </div>
            <div className="mt-7 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 8, right: 18, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#E8EDF4" strokeDasharray="4 4" />
                  <XAxis dataKey="time" axisLine={{ stroke: '#9AA4B2' }} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 14 }} />
                  <YAxis axisLine={{ stroke: '#9AA4B2' }} tickLine={false} tick={{ fill: '#9AA4B2', fontSize: 14 }} width={48} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6A0A" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Table Status Overview</h3>
            <div className="mt-7 flex flex-wrap gap-2">
              {tableStatuses.map((status, index) => {
                const color =
                  status === 'Available'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : status === 'Reserved'
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700'

                return (
                  <div key={`${status}-${index}`} className={['grid h-16 w-12 place-items-center rounded-lg border text-center text-xs', color].join(' ')}>
                    <span>
                      <span className="block font-semibold">T{index + 1}</span>
                      <span>{status.slice(0, 3)}</span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-7 flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Available (5)</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />Reserved (3)</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Occupied (4)</span>
            </div>
          </article>
        </div>

        <div className="space-y-8">
          <div className="px-1">
            <h3 className="text-base font-medium text-slate-500">Quick Actions:</h3>
            <div className="mt-6 flex flex-col items-center gap-6">
              <button
                type="button"
                className="flex h-10 w-[150px] items-center justify-center gap-2 rounded-lg bg-[#FF6400] text-sm font-medium text-white"
                onClick={() => navigate(`${routes.pos.menu}?role=cashier`)}
              >
                <ShoppingCart className="h-4 w-4" />
                New Order
              </button>
              <button
                type="button"
                className="flex h-10 w-[150px] items-center justify-center gap-2 rounded-lg bg-[#17192A] text-sm font-medium text-white"
                onClick={() => navigate(`${routes.pos.root}?role=chef`)}
              >
                <ChefHat className="h-4 w-4" />
                Kitchen View
              </button>
              <button
                type="button"
                className="flex h-10 w-[150px] items-center justify-center gap-2 rounded-lg bg-[#155BFF] text-sm font-medium text-white"
                onClick={onReserveTable}
              >
                <CalendarDays className="h-4 w-4" />
                Reserve Table
              </button>
            </div>
          </div>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
              <button type="button" className="text-xs font-medium text-[#FF6400]" onClick={() => navigate(routes.pos.admin.liveOrders)}>
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-[34px_minmax(0,1fr)_80px] items-center gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-medium text-slate-500">{order.table}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm text-slate-800">{order.id}</div>
                    <div className="text-xs text-slate-400">
                      {order.items} - {order.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-800">{order.amount}</div>
                    <span className={['mt-1 inline-flex rounded-full px-3 py-1 text-xs', statusClass(order.status)].join(' ')}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

function LiveOrdersTab({ onPay }: { onPay: () => void }) {
  const orderTabs = ['All Orders', 'Pending', 'Preparing', 'Ready', 'Delivered']

  return (
    <section className="px-5 py-12">
      <div className="grid grid-cols-4 gap-4">
        <article className="h-[146px] rounded-lg border border-slate-200 bg-white px-7 py-7 shadow-sm" style={{ borderLeft: '4px solid #155BFF' }}>
          <div className="text-sm text-slate-500">Total Orders</div>
          <div className="mt-2 text-3xl font-normal text-slate-900">2</div>
        </article>
        <article className="h-[146px] rounded-lg border border-slate-200 bg-white px-7 py-7 shadow-sm" style={{ borderLeft: '4px solid #08A64B' }}>
          <div className="text-sm text-slate-500">Paid</div>
          <div className="mt-2 text-3xl font-normal text-[#08A64B]">1</div>
        </article>
        <article className="h-[146px] rounded-lg border border-slate-200 bg-white px-7 py-7 shadow-sm" style={{ borderLeft: '4px solid #F04B11' }}>
          <div className="text-sm text-slate-500">Pending Payment</div>
          <div className="mt-2 text-3xl font-normal text-[#F04B11]">1</div>
        </article>
        <article className="h-[146px] rounded-lg border border-slate-200 bg-white px-7 py-7 shadow-sm" style={{ borderLeft: '4px solid #951BFF' }}>
          <div className="text-sm text-slate-500">In Progress</div>
          <div className="mt-2 text-3xl font-normal text-[#951BFF]">0</div>
        </article>
      </div>

      <div className="mt-9 flex items-center gap-3">
        <div className="relative w-[544px]">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-4 pr-11 text-base outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Search by order ID, table number, room..."
          />
        </div>
        <button className="ml-auto grid h-10 w-10 place-items-center text-slate-500" type="button" aria-label="Filter orders">
          <BarChart3 className="h-5 w-5 rotate-90" />
        </button>
        {['All Status', 'All Type'].map((filter) => (
          <button key={filter} className="flex h-10 w-48 items-center justify-between rounded-lg border border-slate-300 px-4 text-sm text-slate-700" type="button">
            {filter}
            <ChevronDown className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
        <div className="flex h-[57px] items-center gap-2 border-b border-blue-200 px-2">
          {orderTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={[
                'h-10 rounded-lg px-4 text-base',
                index === 0 ? 'bg-[#0B4EA2] text-white' : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-orange-200 text-slate-500" type="button" aria-label="Table filters">
            <BarChart3 className="h-5 w-5 rotate-90" />
          </button>
        </div>

        <div className="grid h-10 grid-cols-[1fr_1.25fr_1.35fr_1fr_0.9fr_0.9fr_0.9fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase text-slate-500">
          <div>Order ID</div>
          <div>Date & Time</div>
          <div>Customer</div>
          <div>Type</div>
          <div>Total</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {liveOrderRows.map((order) => (
          <div key={order.id} className="grid min-h-[71px] grid-cols-[1fr_1.25fr_1.35fr_1fr_0.9fr_0.9fr_0.9fr] items-center border-t border-blue-100 px-4 text-sm text-slate-700">
            <div className="text-base font-semibold text-slate-900">{order.id}</div>
            <div>{order.dateTime}</div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-slate-600">
                {order.initials || <UserRound className="h-3.5 w-3.5" />}
              </span>
              <span className="text-base text-slate-900">{order.customer}</span>
            </div>
            <div className="flex items-center gap-1 text-base">
              <Utensils className="h-4 w-4 text-slate-500" />
              {order.type}
            </div>
            <div className="text-base font-semibold text-slate-900">{order.total}</div>
            <div>
              <span className={['rounded-full px-3 py-1 text-xs font-semibold', statusClass(order.status)].join(' ')}>{order.status}</span>
            </div>
            <div className="text-center">
              <button
                type="button"
                className={[
                  'h-7 w-[72px] rounded text-sm text-white',
                  order.canPay ? 'bg-[#0B4EA2] hover:bg-[#093f82]' : 'cursor-not-allowed bg-slate-300',
                ].join(' ')}
                disabled={!order.canPay}
                onClick={onPay}
              >
                Pay
              </button>
            </div>
          </div>
        ))}

        <div className="flex h-14 items-center justify-between border-t border-blue-100 px-4 text-sm text-slate-600">
          <div>Showing 1 to 4 of 24 orders</div>
          <div className="flex items-center gap-3">
            <button type="button" className="text-slate-400">‹</button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded bg-[#0B4EA2] text-white">1</button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-700">2</button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-700">3</button>
            <button type="button" className="text-slate-700">›</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function MealStatusBadge({ status }: { status: string }) {
  return <span className={['rounded-full px-3 py-1 text-xs font-semibold', statusClass(status)].join(' ')}>{status}</span>
}

function GuestMealDetailsPanel({
  guest,
  onClose,
}: {
  guest: (typeof guestMealRows)[number]
  onClose: () => void
}) {
  const history = [
    { date: 'Breakfast - 18 Jul', status: 'Redeemed' },
    { date: 'Breakfast - 19 Jul', status: 'Redeemed' },
    { date: 'Breakfast - 20 Jul', status: 'Redeemed' },
    { date: 'Breakfast - 21 Jul', status: 'Pending' },
    { date: 'Breakfast - 22 Jul', status: 'Upcoming' },
  ]

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[110] w-[384px] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex h-[88px] items-center justify-between border-b border-slate-200 px-6">
        <h2 className="text-xl font-semibold text-slate-900">{guest.guest}</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close guest details">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-7 text-sm">
          <div>
            <div className="text-slate-500">Room</div>
            <div className="mt-2 text-lg text-slate-900">{guest.room}</div>
          </div>
          <div>
            <div className="text-slate-500">Reservation No.</div>
            <div className="mt-2 text-lg text-slate-900">{guest.reservation}</div>
          </div>
        </div>

        <section className="mt-7 rounded-xl border border-blue-200 bg-[#F6F9FF] px-4 py-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-medium text-slate-900">Stay Information</h3>
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Check-in</span><span>{guest.checkinDate}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Check-out</span><span>{guest.checkoutDate}</span></div>
          </div>
          <div className="mt-4 grid grid-cols-2 border-t border-slate-200 pt-4 text-sm">
            <div>
              <div className="text-slate-500">Adults</div>
              <div className="mt-3">{guest.adults}</div>
            </div>
            <div>
              <div className="text-slate-500">Children</div>
              <div className="mt-3">{guest.children}</div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
            <div className="text-slate-500">Package</div>
            <div className="mt-3 text-slate-900">{guest.packageName}</div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-blue-200 bg-[#F6F9FF] px-4 py-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-medium text-slate-900">Meal Information</h3>
            <Utensils className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Meal</span><span>{guest.meal}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Meal Time</span><span>{guest.mealTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Restaurant</span><span>{guest.restaurant}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{guest.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><MealStatusBadge status={guest.status} /></div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-blue-200 bg-[#F6F9FF] px-4 py-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-medium text-slate-900">Meal History</h3>
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {history.map((item, index) => (
              <div key={item.date} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className={[
                      'h-2 w-2 rounded-full',
                      item.status === 'Redeemed' ? 'bg-emerald-500' : item.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-300',
                    ].join(' ')}
                  />
                  {item.status === 'Redeemed' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : index === 3 ? <MoreHorizontal className="h-4 w-4 text-amber-500" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
                  {item.date}
                </span>
                <span
                  className={[
                    'rounded px-2 py-1 text-xs',
                    item.status === 'Redeemed' ? 'text-emerald-600' : item.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'text-slate-400',
                  ].join(' ')}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <button type="button" className="mt-6 h-12 w-full rounded-lg bg-[#0B4EA2] text-lg text-white shadow-lg shadow-blue-900/20">
          Redeem Meal
        </button>
      </div>
    </aside>
  )
}

function MealStatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  unit: string
  icon: LucideIcon
  tone: 'green' | 'yellow' | 'purple' | 'blue'
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-700',
  }

  return (
    <article className="flex h-[114px] items-center gap-5 rounded-lg border border-blue-200 bg-white px-5 shadow-sm">
      <span className={['grid h-12 w-9 place-items-center rounded-full', tones[tone]].join(' ')}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="text-sm text-slate-600">Today</div>
        <div className="text-3xl font-semibold leading-8 text-slate-900">{value}</div>
        <div className="text-sm text-slate-600">{unit}</div>
      </div>
    </article>
  )
}

function ReservationsMealsTab() {
  const [selectedGuest, setSelectedGuest] = useState<(typeof guestMealRows)[number] | null>(null)
  const mealTabs = ['Breakfast (42)', 'Lunch (38)', 'Dinner (35)', 'All Meals']

  return (
    <section className="px-5 py-16">
      <div className="grid grid-cols-4 gap-5">
        <MealStatCard label="Breakfast" value={42} unit="Guests" icon={Coffee} tone="green" />
        <MealStatCard label="Lunch" value={38} unit="Guests" icon={Soup} tone="yellow" />
        <MealStatCard label="Dinner" value={35} unit="Guests" icon={Utensils} tone="purple" />
        <MealStatCard label="Redeemed" value={24} unit="Meals" icon={CheckCircle2} tone="blue" />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
        <div className="flex h-[58px] items-end gap-10 border-b border-blue-200 px-4 text-sm font-semibold text-slate-600">
          {mealTabs.map((tab, index) => (
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

        <div className="border-b border-blue-200 px-4 py-5">
          <div className="grid grid-cols-[minmax(320px,1fr)_140px_140px_160px] gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="h-9 w-full rounded-lg border border-blue-200 pl-10 pr-3 outline-none placeholder:text-slate-400" placeholder="Search guest name, room or reservation..." />
            </div>
            <label className="text-xs text-slate-600">
              Meal Status
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <label className="text-xs text-slate-600">
              Room Number
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <div />
          </div>

          <div className="mt-3 flex items-end gap-3">
            <label className="w-36 text-xs text-slate-600">
              Package
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-sm text-slate-700">
                All <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <label className="w-40 text-xs text-slate-600">
              Date
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-sm text-slate-700">
                21 Jul 2026 <CalendarDays className="h-4 w-4" />
              </button>
            </label>
            <label className="w-40 text-xs text-slate-600">
              Restaurant
              <button type="button" className="mt-1 flex h-9 w-full items-center justify-between rounded-lg border border-blue-200 px-3 text-sm text-slate-700">
                Main Restaurant <ChevronDown className="h-4 w-4" />
              </button>
            </label>
            <button type="button" className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-[#0B4EA2] px-4 text-sm font-semibold text-[#0B4EA2]">
              <RefreshCw className="h-4 w-4" />
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
                <div>{guest.guest}</div>
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
                <button type="button" className="h-7 rounded border border-blue-200 px-4 text-sm text-[#0B4EA2]" onClick={() => setSelectedGuest(guest)}>
                  View
                </button>
              ) : (
                <span className="px-5 text-slate-400">-</span>
              )}
              <MoreHorizontal className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        ))}

        <div className="flex h-14 items-center justify-between border-t border-blue-200 px-4 text-sm text-slate-600">
          <div>Showing 1 to 7 of 42 entries</div>
          <div className="flex overflow-hidden rounded-md border border-blue-200">
            {['‹', '1', '2', '3', '...', '6', '›'].map((item) => (
              <button
                key={item}
                type="button"
                className={['h-9 min-w-8 border-r border-blue-200 px-3 last:border-r-0', item === '1' ? 'bg-[#0B4EA2] text-white' : 'bg-white'].join(' ')}
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

function MenuManagementTab() {
  const [activeMenuTab, setActiveMenuTab] = useState<'categories' | 'items'>('categories')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<(typeof menuCategoryRows)[number] | null>(null)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<(typeof managedMenuItems)[number] | null>(null)
  const showingCategories = activeMenuTab === 'categories'

  const openNewItemModal = () => {
    setSelectedItem(null)
    setItemModalOpen(true)
  }

  const openNewCategoryModal = () => {
    setSelectedCategory(null)
    setCategoryModalOpen(true)
  }

  const openEditCategoryModal = (category: (typeof menuCategoryRows)[number]) => {
    setSelectedCategory(category)
    setCategoryModalOpen(true)
  }

  const openEditItemModal = (item: (typeof managedMenuItems)[number]) => {
    setSelectedItem(item)
    setItemModalOpen(true)
  }

  return (
    <>
      <section className="px-5 py-16">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-[28px] font-semibold text-slate-900">Menu Management</h2>
            <p className="mt-1 text-base text-slate-500">
              {showingCategories ? `Total Categories: ${menuCategoryRows.length}` : 'Total Items: 54'}
            </p>
          </div>
          <button
            type="button"
            className="flex h-[45px] items-center gap-2 rounded-2xl bg-[#0B4EA2] px-7 text-[21px] font-semibold text-white hover:bg-[#093f82]"
            onClick={showingCategories ? openNewCategoryModal : openNewItemModal}
          >
            <Plus className="h-5 w-5" />
            {showingCategories ? 'New category' : 'New Items'}
          </button>
        </div>

        <div className="mt-12 rounded-lg border border-blue-200 bg-white px-4 pb-4 pt-6">
          <div className="flex h-11 items-end gap-6 border-b border-blue-200">
            {[
              { key: 'categories' as const, label: 'Categories' },
              { key: 'items' as const, label: 'Items' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={[
                  'h-full border-b-2 px-6 text-lg font-semibold',
                  activeMenuTab === tab.key ? 'border-[#0B4EA2] text-[#0B4EA2]' : 'border-transparent text-slate-500',
                ].join(' ')}
                onClick={() => setActiveMenuTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_153px_153px] gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
              <input
                className="h-10 w-full rounded-lg border border-blue-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-[#0B4EA2]"
                placeholder={showingCategories ? 'Search menu category' : 'Search menu items...'}
              />
            </div>
            <button type="button" className="flex h-10 items-center justify-between rounded-lg border border-blue-200 px-4 text-sm text-slate-700">
              All Categories
              <ChevronDown className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-10 items-center justify-between rounded-lg border border-blue-200 px-4 text-sm text-slate-700">
              All Statuses
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showingCategories ? (
          <div className="mt-7 overflow-hidden rounded-lg border border-blue-200 bg-white">
            <div className="grid h-12 grid-cols-[120px_1.2fr_1.2fr_1fr_1fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-700">
              <div className="text-center">Order</div>
              <div>Category Name (English)</div>
              <div>Secondary Category Name</div>
              <div className="text-center">Items Count</div>
              <div className="text-center">Status</div>
              <div className="text-center">Actions</div>
            </div>
            {menuCategoryRows.map((category) => (
              <div key={category.order} className="grid min-h-[70px] grid-cols-[120px_1.2fr_1.2fr_1fr_1fr_1fr] items-center border-t border-blue-100 px-4 text-sm text-slate-800">
                <div className="text-center">{category.order}</div>
                <div className="font-medium">{category.name}</div>
                <div>{category.secondaryName}</div>
                <div className="text-center">{category.itemsCount}</div>
                <div className="text-center">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{category.status}</span>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <button type="button" className="text-slate-900" onClick={() => openEditCategoryModal(category)} aria-label={`Edit ${category.name}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className="text-red-600" aria-label={`Delete ${category.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-[257px_minmax(0,1fr)] gap-6">
            <aside className="min-h-[605px] overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex h-[70px] items-center justify-between border-b border-slate-100 px-4">
                <h3 className="text-base font-bold text-slate-900">Sections</h3>
                <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[#155BFF]" aria-label="Add section">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2 p-3">
                {menuSectionRows.map((section, index) => {
                  const Icon = section.icon
                  const active = index === 0

                  return (
                    <button
                      key={section.label}
                      type="button"
                      className={[
                        'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm',
                        active ? 'bg-[#EEF4FF] text-[#155BFF]' : 'text-slate-600 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <Icon className={['h-4 w-4', active ? 'text-[#155BFF]' : 'text-slate-400'].join(' ')} />
                      <span className="min-w-0 flex-1 truncate">{section.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{section.count}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="grid h-[54px] grid-cols-[minmax(270px,1.6fr)_1fr_0.7fr_0.7fr_0.7fr] items-center border-b border-slate-100 bg-white px-4 text-sm font-semibold text-slate-600">
                <div>Item</div>
                <div>Category</div>
                <div>Price</div>
                <div>Status</div>
                <div className="text-center">Actions</div>
              </div>
              {managedMenuItems.map((item) => (
                <div key={item.name} className="grid min-h-[81px] grid-cols-[minmax(270px,1.6fr)_1fr_0.7fr_0.7fr_0.7fr] items-center border-b border-slate-100 px-4 text-sm text-slate-700">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={['h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br shadow-inner', item.thumbnail].join(' ')} />
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-800">{item.name}</div>
                      <div className="mt-1 max-w-[260px] truncate text-xs text-slate-500">{item.description}</div>
                    </div>
                  </div>
                  <div>{item.category}</div>
                  <div>
                    <span className="text-lg font-semibold text-slate-900">{item.price}</span>
                    <span className="ml-1 text-xs text-slate-500">SAR</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded border border-blue-200 text-[#155BFF]"
                      onClick={() => openEditItemModal(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded border border-red-200 text-red-500" aria-label={`Delete ${item.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex h-12 items-center justify-between px-4 text-sm text-slate-600">
                <div>Showing 1 to 10 of 48 items</div>
                <div className="flex items-center gap-4">
                  <span>Per page</span>
                  <button type="button" className="flex h-8 w-16 items-center justify-between rounded-md border border-slate-200 px-3">
                    10
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-400">‹</button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded bg-[#155BFF] text-white">1</button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-600">2</button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-600">3</button>
                    <span>...</span>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-600">5</button>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-600">›</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <AddCategoryModal open={categoryModalOpen} category={selectedCategory} onClose={() => setCategoryModalOpen(false)} />
      <ItemModal open={itemModalOpen} item={selectedItem} onClose={() => setItemModalOpen(false)} />
    </>
  )
}

function InventoryTab() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<(typeof inventoryItems)[number] | null>(null)

  const openPurchaseRequest = (item: (typeof inventoryItems)[number]) => {
    setSelectedInventoryItem(item)
    setPurchaseModalOpen(true)
  }

  const openWithdraw = (item: (typeof inventoryItems)[number]) => {
    setSelectedInventoryItem(item)
    setWithdrawModalOpen(true)
  }

  return (
    <>
      <section className="px-5 py-12">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-[26px] font-semibold text-slate-900">Inventory Management</h2>
            <p className="mt-3 text-sm text-slate-500">Track and manage kitchen ingredients</p>
          </div>
          <div className="flex gap-5">
            <button
              type="button"
              className="flex h-[45px] items-center gap-2 rounded-2xl border border-[#0B4EA2] bg-white px-10 text-lg font-semibold text-[#0B4EA2]"
              onClick={() => setCategoryModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Add category
            </button>
            <button
              type="button"
              className="flex h-[45px] items-center gap-2 rounded-2xl bg-[#0B4EA2] px-10 text-lg font-semibold text-white"
              onClick={() => setIngredientModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Add Ingredient
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-5">
          {[
            { label: 'Total Items', value: '12', className: 'bg-blue-50 text-[#155BFF]' },
            { label: 'Low Stock', value: '6', className: 'bg-red-50 text-red-600' },
            { label: 'Categories', value: '9', className: 'bg-purple-50 text-purple-600' },
            { label: 'Well Stocked', value: '6', className: 'bg-emerald-50 text-emerald-600' },
          ].map((card) => (
            <article key={card.label} className={['h-[108px] rounded-xl px-5 py-7', card.className].join(' ')}>
              <div className="text-2xl font-medium">{card.value}</div>
              <div className="mt-2 text-sm text-slate-500">{card.label}</div>
            </article>
          ))}
        </div>

        <div className="mt-9 flex items-center gap-2 overflow-hidden">
          <div className="relative w-[344px] flex-shrink-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="h-[42px] w-full rounded-lg border border-slate-200 pl-12 pr-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Search ingredients..." />
          </div>
          {inventoryCategories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={[
                'h-[38px] rounded-lg border px-4 text-sm',
                index === 0 ? 'border-[#0B4EA2] bg-[#0B4EA2] text-white' : 'border-slate-200 bg-white text-slate-500',
              ].join(' ')}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="grid h-[42px] grid-cols-[1.5fr_1fr_1.15fr_0.9fr_1.1fr_1fr_1.1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Ingredient</div>
            <div>Category</div>
            <div>Quantity</div>
            <div>Min Stock</div>
            <div>Status</div>
            <div>Last Updated</div>
            <div className="text-center">Actions</div>
          </div>

          {inventoryItems.map((item) => {
            const lowStock = item.status === 'Low Stock'
            const progressColor = lowStock ? (item.progress <= 30 ? 'bg-red-400' : 'bg-yellow-400') : 'bg-emerald-500'

            return (
              <div
                key={item.name}
                className={[
                  'grid min-h-[62px] grid-cols-[1.5fr_1fr_1.15fr_0.9fr_1.1fr_1fr_1.1fr] items-center px-4 text-sm text-slate-700',
                  lowStock ? 'bg-red-50/35' : 'bg-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className={['grid h-8 w-8 place-items-center rounded-lg', lowStock ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-500'].join(' ')}>
                    <Box className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-slate-900">{item.name}</div>
                    {lowStock ? (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        Low stock
                      </div>
                    ) : null}
                  </div>
                </div>
                <div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.category}</span>
                </div>
                <div>
                  <div className={lowStock ? 'text-red-600' : 'text-slate-900'}>
                    {item.quantity} {item.unit}
                  </div>
                  <div className="mt-2 h-1.5 w-24 rounded-full bg-slate-200">
                    <div className={['h-full rounded-full', progressColor].join(' ')} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <div>{item.minStock} {item.unit}</div>
                <div>
                  <span className={['inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs', lowStock ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'].join(' ')}>
                    {lowStock ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {item.status}
                  </span>
                </div>
                <div className="text-slate-400">{item.updated}</div>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    className={['h-8 rounded-lg px-4 text-sm text-white', lowStock ? 'bg-green-500' : 'bg-green-200'].join(' ')}
                    onClick={() => openPurchaseRequest(item)}
                  >
                    Order
                  </button>
                  <button
                    type="button"
                    className="h-8 rounded-lg bg-[#0B4EA2] px-4 text-sm text-white"
                    onClick={() => openWithdraw(item)}
                  >
                    withdrawn
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <InventoryCategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
      <AddIngredientModal open={ingredientModalOpen} onClose={() => setIngredientModalOpen(false)} />
      <PurchaseRequestModal open={purchaseModalOpen} item={selectedInventoryItem} onClose={() => setPurchaseModalOpen(false)} />
      <QuickWithdrawModal open={withdrawModalOpen} item={selectedInventoryItem} onClose={() => setWithdrawModalOpen(false)} />
    </>
  )
}

function OrderDetailsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <aside className="fixed bottom-0 right-0 top-0 z-[140] w-[448px] overflow-y-auto bg-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
        <h2 className="text-xl font-semibold text-slate-900">Order Details</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close order details">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Order Information</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Order ID</span><span className="flex items-center gap-2 font-semibold">{orderDetails.id}<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{orderDetails.status}</span></span></div>
            <div className="flex justify-between"><span className="text-slate-500">Order Date</span><span className="font-semibold">{orderDetails.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Order Type</span><span className="font-semibold">{orderDetails.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment Method</span><span className="font-semibold">{orderDetails.paymentMethod}</span></div>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Guest Information</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="grid grid-cols-[22px_1fr_1fr] items-center gap-2"><User className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Guest Name</span><span className="font-semibold">{orderDetails.guest}</span></div>
            <div className="grid grid-cols-[22px_1fr_1fr] items-center gap-2"><HotelIcon className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Room Number</span><span className="font-semibold">{orderDetails.room}</span></div>
            <div className="grid grid-cols-[22px_1fr_1fr] items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Phone Number</span><span className="font-semibold">{orderDetails.phone}</span></div>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Ordered Items</h3>
          <div className="mt-5 grid grid-cols-[1fr_60px_80px_80px] border-b border-slate-100 pb-3 text-sm text-slate-500">
            <div>Item</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Price</div>
            <div className="text-right">Total</div>
          </div>
          {orderDetails.items.map((item) => (
            <div key={item.item} className="grid grid-cols-[1fr_60px_80px_80px] border-b border-slate-100 py-3 text-sm">
              <div>{item.item}</div>
              <div className="text-center text-slate-500">{item.quantity}</div>
              <div className="text-right text-slate-500">{item.price}</div>
              <div className="text-right font-semibold">{item.total}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Order Summary</h3>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{orderDetails.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Service Charge (10%)</span><span className="font-semibold">{orderDetails.service}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">VAT (14%)</span><span className="font-semibold">{orderDetails.vat}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-5 text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-[#0B4EA2]">{orderDetails.total}</span>
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600">
            <ReceiptText className="h-4 w-4" />
            Print Invoice
          </button>
          <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] text-sm font-semibold text-white">
            <UploadCloud className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </aside>
  )
}

function OrdersRevenueModal({
  open,
  initialFilter,
  onClose,
}: {
  open: boolean
  initialFilter: RevenueFilter
  onClose: () => void
}) {
  const [activeFilter, setActiveFilter] = useState<RevenueFilter>(initialFilter)
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!open) return null

  const filters: RevenueFilter[] = ['All', 'Dine In', 'Room Service']
  const visibleRows =
    activeFilter === 'All'
      ? orderRevenueRows
      : orderRevenueRows.filter((row) => row.source.toLowerCase() === activeFilter.toLowerCase())

  return (
    <div className="fixed inset-0 z-[130] bg-black/35">
      <div className="h-full w-[1054px] overflow-hidden rounded-r-xl bg-white shadow-2xl">
        <div className="flex h-[92px] items-center justify-between bg-[#0B4EA2] px-6 text-white">
          <h2 className="text-xl font-semibold">Orders Revenue</h2>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" onClick={onClose} aria-label="Close orders revenue">
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="px-6 py-12">
          <div className="grid grid-cols-[minmax(0,1fr)_236px] items-start gap-6">
            <div>
              <div className="flex h-10 items-end gap-5 border-b border-slate-200">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={[
                      'h-full border-b-2 px-4 text-sm',
                      activeFilter === filter ? 'border-[#0B4EA2] text-[#0B4EA2]' : 'border-transparent text-slate-600',
                    ].join(' ')}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] text-sm font-semibold text-white">
              <ReceiptText className="h-4 w-4" />
              Print Report
            </button>
          </div>

          <div className="mt-5 flex items-end gap-5">
            <div className="relative w-[493px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="h-12 w-full rounded-lg border border-slate-200 pl-9 pr-3 outline-none placeholder:text-slate-500 focus:border-[#0B4EA2]" placeholder="Search by order ID..." />
            </div>
            <label className="text-base font-medium text-slate-900">
              Status
              <button type="button" className="mt-2 flex h-12 w-[150px] items-center justify-between rounded-lg border border-slate-200 px-3 text-left font-normal">
                All status <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </label>
            <button type="button" className="mt-auto flex h-12 w-[150px] items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm text-slate-700">
              <CalendarDays className="h-4 w-4" />
              Date Range
            </button>
          </div>

          <div className="mt-5 flex h-11 items-center justify-between rounded-lg bg-slate-50 px-4 text-sm text-slate-600">
            <span>Showing {visibleRows.length} order</span>
            <span className="font-bold text-slate-900">Total Revenue: $2,800</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid h-14 grid-cols-[1fr_1.1fr_0.9fr_0.8fr_1.1fr_1.7fr_1.1fr_1.1fr] items-center bg-slate-50 px-4 text-sm font-bold text-slate-600">
              <div>order id</div>
              <div>Guest Name</div>
              <div>Room No</div>
              <div>ORDERS</div>
              <div>TOTAL AMOUNT</div>
              <div>Date</div>
              <div>Source</div>
              <div>Status</div>
            </div>
            {visibleRows.map((row) => (
              <button
                key={`${row.id}-${row.source}-${row.date}`}
                type="button"
                className="grid min-h-16 w-full grid-cols-[1fr_1.1fr_0.9fr_0.8fr_1.1fr_1.7fr_1.1fr_1.1fr] items-center border-t border-slate-100 px-4 text-left text-sm text-slate-800 hover:bg-blue-50/30"
                onClick={() => setDetailsOpen(true)}
              >
                <div className="font-semibold">{row.id}</div>
                <div>{row.guest}</div>
                <div>{row.room}</div>
                <div>{row.orders}</div>
                <div className="font-semibold">{row.total}</div>
                <div>{row.date}</div>
                <div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{row.source}</span>
                </div>
                <div>
                  <span className={['rounded-full px-4 py-1 text-xs font-semibold', row.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-700'].join(' ')}>
                    {row.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <OrderDetailsDrawer open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </div>
  )
}

function ReportsTab() {
  const [ordersRevenueOpen, setOrdersRevenueOpen] = useState(false)
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>('All')

  const openOrdersRevenue = (filter: RevenueFilter) => {
    setRevenueFilter(filter)
    setOrdersRevenueOpen(true)
  }

  return (
    <>
      <section className="px-5 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-[26px] font-semibold text-slate-900">Management Reports & Analytics</h2>
          <button type="button" className="flex h-10 w-36 items-center justify-between rounded border border-blue-200 px-4 text-sm text-slate-700">
            October 2023
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-14 grid grid-cols-4 gap-10">
          {reportMetricCards.map((card) => {
            const Icon = card.icon

            return (
              <article key={card.label} className="flex h-[126px] items-start gap-4 rounded-lg border border-slate-100 bg-white px-8 py-5 shadow-sm">
                <span className={['mt-1 grid h-8 w-8 place-items-center rounded-full', card.tone].join(' ')}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{card.value}</div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900">Orders by Type</h3>
            <div className="mt-6 space-y-12">
              {[
                { label: 'Dine In' as RevenueFilter, icon: Utensils },
                { label: 'Room Service' as RevenueFilter, icon: HotelIcon },
              ].map((row) => {
                const Icon = row.icon

                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon className="h-4 w-4" />
                        {row.label}
                      </span>
                      <button type="button" className="border-b border-[#155BFF] px-2 pb-1 text-sm text-[#155BFF]" onClick={() => openOrdersRevenue(row.label)}>
                        view All
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-900">
                      <div className="h-2 w-[420px] rounded-full bg-slate-200" />
                      <span>0 orders</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">$0.00 revenue</div>
                  </div>
                )
              })}
              <div className="text-right">
                <button type="button" className="border-b border-[#155BFF] px-2 pb-1 text-sm text-[#155BFF]" onClick={() => openOrdersRevenue('All')}>
                  view All
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900">Payment Methods</h3>
            <div className="mt-5 space-y-4">
              {['Cash', 'Card', 'Room Charge'].map((method) => (
                <div key={method} className="flex h-[77px] items-center justify-between rounded-lg bg-slate-50 px-4">
                  <div>
                    <div className="text-base text-slate-900">{method}</div>
                    <div className="mt-1 text-sm text-slate-500">0 transactions</div>
                  </div>
                  <div className="text-2xl text-slate-900">$0</div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-7 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
          <h3 className="border-b border-slate-200 px-4 py-4 text-lg font-semibold text-slate-900">Top Selling Items</h3>
          <div className="grid h-14 grid-cols-[0.4fr_1.6fr_1fr_1fr] items-center bg-slate-50 px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>#</div>
            <div>Item</div>
            <div>Qty Sold</div>
            <div className="text-right">Revenue</div>
          </div>
          {topSellingItems.map((item) => (
            <div key={item.rank} className="grid min-h-16 grid-cols-[0.4fr_1.6fr_1fr_1fr] items-center border-t border-slate-100 px-4 text-sm text-slate-700">
              <div>{item.rank}</div>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded bg-yellow-50 text-sm">{item.icon}</span>
                <span className="max-w-[130px] text-slate-700">{item.item}</span>
              </div>
              <div>{item.quantity}</div>
              <div className="text-right font-semibold text-slate-700">{item.revenue}</div>
            </div>
          ))}
        </div>
      </section>

      <OrdersRevenueModal open={ordersRevenueOpen} initialFilter={revenueFilter} onClose={() => setOrdersRevenueOpen(false)} />
    </>
  )
}

function AdminContent({
  activeKey,
  onPay,
  onReserveTable,
}: {
  activeKey: AdminTabKey
  onPay: () => void
  onReserveTable: () => void
}) {
  if (activeKey === 'liveOrders') return <LiveOrdersTab onPay={onPay} />
  if (activeKey === 'reservationsMeals') return <ReservationsMealsTab />
  if (activeKey === 'menuManagement') return <MenuManagementTab />
  if (activeKey === 'inventory') return <InventoryTab />
  if (activeKey === 'reports') return <ReportsTab />

  return <DashboardTab onReserveTable={onReserveTable} />
}

export function AdminPOSView() {
  const location = useLocation()
  const activeTab = getActiveTab(location.pathname)
  const [reservationModalOpen, setReservationModalOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)

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
      <div className="grid h-full w-full min-w-[1180px] grid-cols-[306px_minmax(0,1fr)]">
        <AdminSidebar activeKey={activeTab.key} />
        <main className="flex min-w-0 flex-col overflow-hidden">
          <AdminHeader title={activeTab.label} />
          <div className="min-h-0 flex-1 overflow-y-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AdminContent
              activeKey={activeTab.key}
              onPay={openPayment}
              onReserveTable={() => setReservationModalOpen(true)}
            />
          </div>
        </main>
      </div>
      <NewReservationModal open={reservationModalOpen} onClose={() => setReservationModalOpen(false)} />
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
