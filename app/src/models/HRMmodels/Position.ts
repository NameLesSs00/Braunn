export interface PositionReadDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  departmentId: string;
  departmentName: string;
}

export interface PositionCreateDto {
  name: string;
  description: string;
  departmentId: string;
}

export interface PositionUpdateDto {
  name: string;
  description: string;
  isActive: boolean;
  departmentId: string;
}
