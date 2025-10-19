export interface CiTypeAttribute {
  id: number;
  name: string;
  alias: string;
}

export interface CiTypeInfo {
  id: number;
  name: string;
  alias: string;
  attributes: CiTypeAttribute[];
  createdAt: number;
  updatedAt: number;
}
