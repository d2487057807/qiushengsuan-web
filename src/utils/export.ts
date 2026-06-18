/**
 * 文件导出工具
 */

import type { AxiosResponse } from 'axios';

/**
 * 下载 Blob 文件
 * @param response Axios 响应（blob 类型）
 * @param defaultFilename 默认文件名
 */
export function downloadBlob(response: AxiosResponse<Blob>, defaultFilename: string): void {
  // 从 Content-Disposition 解析文件名
  const contentDisposition = response.headers['content-disposition'];
  let filename = defaultFilename;

  if (contentDisposition) {
    // 匹配 filename*=UTF-8''xxx 或 filename="xxx" 或 filename=xxx
    const utf8Match = contentDisposition.match(/filename\*=(?:UTF-8''|utf-8'')(.+)/i);
    const match = contentDisposition.match(/filename="?([^";]+)"?/);

    if (utf8Match) {
      filename = decodeURIComponent(utf8Match[1]);
    } else if (match) {
      filename = decodeURIComponent(match[1]);
    }
  }

  // 创建 Blob URL
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);

  // 创建下载链接
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}
