/**
 * API 通用响应类型
 */

// 通用 API 响应结构
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页结果
export interface PageResult<T> {
  list: T[];
  total: number;
}

// 分页参数
export interface PageParams {
  pageNum: number;
  pageSize: number;
}
