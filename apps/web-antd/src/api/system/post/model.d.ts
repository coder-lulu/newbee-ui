/**
 * @description: Post interface
 */
export interface Post {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: string;
  remark: string;
  createTime: string;
}

/**
 *  @description: Position info response
 */
export interface PositionInfo {
  id?: number;
  createdAt?: number;
  updatedAt?: number;
  status?: number;
  sort?: number;
  name?: string;
  code?: string;
  remark?: string;
}

export interface PostListResp {
  data: PositionInfo[];
  total: number;
}
