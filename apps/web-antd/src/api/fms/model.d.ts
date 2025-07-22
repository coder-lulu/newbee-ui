export interface fileInfo {
  id: string;
  createdAt?: number;
  name: string;
  fileType: string;
  size: number;
  path: string;
  publicPath: string;
  tagIds: number[];
}

export interface FileListRes {
  data: fileInfo[];
  total: number;
}

export interface changeStatusReq {
  id: string;
  status: boolean;
}

export interface updateFileInfoReq {
  id: string;
  name: string;
  tagIds: number[];
}

export interface TagInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  name?: string;
  remark?: string;
}

export interface StorageProviderInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  state?: boolean;
  name?: string;
  bucket?: string;
  endpoint?: string;
  secretId?: string;
  secretKey?: string;
  folder?: string;
  region?: string;
  isDefault?: boolean;
  useCdn?: boolean;
  cdnUrl?: string;
}

export interface CloudFileInfo {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  state?: boolean;
  name?: string;
  url?: string;
  size?: number;
  fileType?: number;
  userId?: string;
  providerId?: number;
  tagIds?: number[];
}

export interface CloudFileTagInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  name?: string;
  remark?: string;
}
