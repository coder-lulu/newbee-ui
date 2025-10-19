export interface DictData {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  title?: string;
  key?: string;
  value?: string;
  dictionaryId?: number;
  sort?: number;
  isDefault?: number;
  cssClass: string;
  listClass: string;
  label: string;
}

export interface DictDataSimpleListResp {
  data: DictData[];
  total: number;
}
