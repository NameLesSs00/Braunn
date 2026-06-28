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

export interface CreateRatePlanPayload {
  code: string
  name: string
  description: string
  isActive: boolean
}

export interface UpdateRatePlanPayload {
  name: string
  description: string
  isActive: boolean
}
