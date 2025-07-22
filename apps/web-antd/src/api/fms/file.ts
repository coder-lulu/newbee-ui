import type { FileListRes, updateFileInfoReq } from './model';

import type { IDS, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum FmsApi {
  DeleteFile = '/fms-api/file/delete',
  DownloadFile = '/fms-api/file/download',
  GetFileList = '/fms-api/file/list',
  SetFileStatus = '/fms-api/file/status',
  UpdateFileInfo = '/fms-api/file/update',
  uploadFile = '/fms-api/upload',
}

export function uploadFile(file: File) {
  return requestClient.upload(FmsApi.uploadFile, { file });
}

export const getFileList = (params: PageQuery) => {
  return requestClient.post<FileListRes>(FmsApi.GetFileList, { ...params });
};

export const updateFileInfo = (params: updateFileInfoReq) => {
  return requestClient.postWithMsg<void>(FmsApi.UpdateFileInfo, params);
};

export const deleteFile = (params: IDS) => {
  return requestClient.postWithMsg<void>(FmsApi.DeleteFile, { ids: params });
};

export const setFileStatus = (id: string, status: number) =>
  requestClient.postWithMsg(FmsApi.SetFileStatus, { id, status });

export const downloadFile = (id: number) =>
  requestClient.download(`${FmsApi.DownloadFile}/${id}`);
