export type Guest = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  phone: string
  email: string
  streetAddress: string
  city: string
  country: string
  postalCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  createdAt: string
}

export type CreateGuestRequest = Omit<Guest, 'id' | 'createdAt' | 'fullName'>

export type UpdateGuestRequest = Omit<Guest, 'id' | 'createdAt' | 'fullName'>
