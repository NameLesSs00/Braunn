export type RestaurantRole = 'admin' | 'cashier' | 'chef'

export type TableStatus = 'available' | 'reserved' | 'occupied'

export type RestaurantTable = {
  id: number
  name: string
  status: TableStatus
  seats: number
  guest?: string
}

export type MenuCategory = {
  id: string
  label: string
}

export type MenuItem = {
  id: string
  name: string
  price: number
  categoryId: string
}

export type CartLine = MenuItem & {
  quantity: number
}

export type KitchenOrderStatus = 'new' | 'preparing' | 'ready'

export type KitchenOrder = {
  id: string
  table: string
  waitingMinutes: number
  status: KitchenOrderStatus
  items: Array<{
    name: string
    quantity: number
  }>
}

export const restaurantTables: RestaurantTable[] = [
  { id: 1, name: 'Table 1', status: 'available', seats: 2 },
  { id: 2, name: 'Table 2', status: 'occupied', seats: 4, guest: 'Maya N.' },
  { id: 3, name: 'Table 3', status: 'reserved', seats: 6, guest: 'Room 204' },
  { id: 4, name: 'Table 4', status: 'available', seats: 2 },
  { id: 5, name: 'Table 5', status: 'occupied', seats: 4, guest: 'Walk-in' },
  { id: 6, name: 'Table 6', status: 'reserved', seats: 8, guest: 'Room 312' },
  { id: 7, name: 'Table 7', status: 'available', seats: 4 },
  { id: 8, name: 'Table 8', status: 'occupied', seats: 2, guest: 'Room 119' },
  { id: 9, name: 'Table 9', status: 'available', seats: 6 },
  { id: 10, name: 'Table 10', status: 'reserved', seats: 4, guest: 'VIP dinner' },
  { id: 11, name: 'Table 11', status: 'available', seats: 2 },
  { id: 12, name: 'Table 12', status: 'occupied', seats: 10, guest: 'Group' },
]

export const menuCategories: MenuCategory[] = [
  { id: 'drink', label: 'Drink' },
  { id: 'main-course', label: 'Main course' },
  { id: 'salad', label: 'Salad' },
  { id: 'desert', label: 'Desert' },
]

export const menuItems: MenuItem[] = [
  { id: 'fresh-orange-juice', name: 'Fresh Orange Juice', price: 20, categoryId: 'drink' },
  { id: 'mint-lemonade', name: 'Mint Lemonade', price: 16, categoryId: 'drink' },
  { id: 'apple-cider', name: 'Apple Cider', price: 15, categoryId: 'drink' },
  { id: 'mango-smoothie', name: 'Mango Smoothie', price: 18, categoryId: 'drink' },
  { id: 'iced-latte', name: 'Iced Latte', price: 22, categoryId: 'drink' },
  { id: 'sparkling-water', name: 'Sparkling Water', price: 9, categoryId: 'drink' },
  { id: 'ribeye-steak', name: 'Ribeye Steak', price: 48, categoryId: 'main-course' },
  { id: 'pasta-carbonara', name: 'Pasta Carbonara', price: 34, categoryId: 'main-course' },
  { id: 'grilled-salmon', name: 'Grilled Salmon', price: 42, categoryId: 'main-course' },
  { id: 'caesar-salad', name: 'Caesar Salad', price: 21, categoryId: 'salad' },
  { id: 'greek-salad', name: 'Greek Salad', price: 18, categoryId: 'salad' },
  { id: 'chocolate-cake', name: 'Chocolate Cake', price: 17, categoryId: 'desert' },
  { id: 'vanilla-ice-cream', name: 'Vanilla Ice Cream', price: 12, categoryId: 'desert' },
]

export const initialKitchenOrders: KitchenOrder[] = [
  {
    id: 'ko-1001',
    table: 'Table 5',
    waitingMinutes: 3,
    status: 'new',
    items: [
      { name: 'Ribeye Steak', quantity: 2 },
      { name: 'Pasta Carbonara', quantity: 1 },
    ],
  },
  {
    id: 'ko-1002',
    table: 'Table 8',
    waitingMinutes: 7,
    status: 'new',
    items: [
      { name: 'Grilled Salmon', quantity: 1 },
      { name: 'Caesar Salad', quantity: 2 },
    ],
  },
  {
    id: 'ko-1003',
    table: 'Table 3',
    waitingMinutes: 12,
    status: 'preparing',
    items: [
      { name: 'Pasta Carbonara', quantity: 2 },
      { name: 'Mint Lemonade', quantity: 2 },
    ],
  },
  {
    id: 'ko-1004',
    table: 'Table 12',
    waitingMinutes: 18,
    status: 'preparing',
    items: [
      { name: 'Ribeye Steak', quantity: 3 },
      { name: 'Greek Salad', quantity: 3 },
    ],
  },
  {
    id: 'ko-1005',
    table: 'Table 2',
    waitingMinutes: 9,
    status: 'ready',
    items: [
      { name: 'Fresh Orange Juice', quantity: 2 },
      { name: 'Chocolate Cake', quantity: 1 },
    ],
  },
  {
    id: 'ko-1006',
    table: 'Table 6',
    waitingMinutes: 22,
    status: 'ready',
    items: [
      { name: 'Grilled Salmon', quantity: 2 },
      { name: 'Vanilla Ice Cream', quantity: 2 },
    ],
  },
]
