export interface PositionReadDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface PositionCreateDto {
  name: string;
  description: string;
}

export interface PositionUpdateDto {
  name: string;
  description: string;
  isActive: boolean;
}
