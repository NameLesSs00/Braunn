export type RestaurantMealType = 'Breakfast' | 'Lunch' | 'Dinner'

export interface RestaurantMeal {
  id: number
  name: string
  description: string
  mealType: RestaurantMealType
  isActive: boolean
  createdAt: string
  createdBy: string
}

export interface CreateRestaurantMealRequest {
  name: string
  description: string
  mealType: RestaurantMealType
}

export interface UpdateRestaurantMealRequest {
  name: string
  description: string
  isActive: boolean
}

export const restaurantMealTypes: RestaurantMealType[] = ['Breakfast', 'Lunch', 'Dinner']
