/**
 * XSS 防护工具
 * 使用 DOMPurify 清理用户输入
 */

import DOMPurify from 'dompurify';

/**
 * HTML 实体编码（用于显示侧转义）
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * 递归清理对象中的所有字符串字段
 * 使用 DOMPurify 移除所有 HTML 标签
 */
export function sanitizeInput<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // 移除所有 HTML 标签
    return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] }) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeInput(item)) as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return obj;
}
