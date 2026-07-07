export interface AdditionalService {
  id: string
  name: string
  price: number
  isActive: boolean
}

export interface CreateAdditionalServiceRequest {
  name: string
  price: number
  isActive: boolean
}

export interface UpdateAdditionalServiceRequest {
  name: string
  price: number
  isActive: boolean
}
