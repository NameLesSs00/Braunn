export type RestaurantDayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

export interface RestaurantCoupon {
  id: number
  mealId: number
  mealName: string
  dayOfWeek: RestaurantDayOfWeek
  dayOfWeekName: string
  price: number
  isActive: boolean
  createdAt: string
}

export interface CreateRestaurantCouponRequest {
  mealId: number
  dayOfWeek: RestaurantDayOfWeek
  price: number
}

export interface UpdateRestaurantCouponRequest {
  price: number
  isActive: boolean
}

export const restaurantDaysOfWeek: RestaurantDayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
