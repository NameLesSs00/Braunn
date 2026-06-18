export interface MealPlan {
  id: string
  code: string
  name: string
  pricePerDay: number
  isActive: boolean
}

export interface CreateMealPlanRequest {
  name: string
  code: string
  pricePerDay: number
}
