export interface RoomManagementContract {
  id: string
  roomId: string
  roomNumber: string
  ownerId: string
  ownerName: string
  effectiveFrom: string
  effectiveTo: string
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  ownerSharePercentage: number
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  hotelSharePercentage: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CreateRoomManagementContractRequest {
  roomId: string
  ownerId: string
  effectiveFrom: string
  effectiveTo: string
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  ownerSharePercentage: number
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  hotelSharePercentage: number
}

export interface UpdateRoomManagementContractRequest {
  effectiveFrom: string
  effectiveTo: string
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  ownerSharePercentage: number
  /**
   * Note: The sum of ownerSharePercentage and hotelSharePercentage must exactly equal 100.
   */
  hotelSharePercentage: number
  isActive: boolean
}
