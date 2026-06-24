export interface RatePlan {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface GetRatePlansParams {
  isActive?: boolean
}
