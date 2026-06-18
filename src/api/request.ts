/**
 * Axios 实例配置
 * 统一处理请求拦截、响应拦截、错误处理、敏感数据加密
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/security';
import {
  encryptRequest,
  shouldEncryptRequest,
  shouldDecryptResponse,
  decryptResponse,
  getEncryptedResponseHeaders,
} from '@/utils/secure';
import type { ApiResponse } from '@/types/api';

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/qiushengsuan/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 附加 Bearer Token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = config.url || '';

    // 检查是否需要加密响应（添加请求头）
    if (shouldDecryptResponse(url)) {
      try {
        const headers = await getEncryptedResponseHeaders();
        // 确保 headers 对象存在
        if (!config.headers) {
          config.headers = {} as any;
        }
        Object.entries(headers).forEach(([key, value]) => {
          config.headers![key] = value;
        });
      } catch (e) {
        console.error('获取加密响应头失败:', e);
      }
    }

    // POST 请求处理
    if (config.method === 'post' && config.data) {
      if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
        // 1. XSS 净化
        config.data = sanitizeInput(config.data);

        // 2. 检查是否需要加密请求体
        const { needEncrypt, fields } = shouldEncryptRequest(url);

        if (needEncrypt && fields && fields.length > 0) {
          try {
            // 加密敏感字段
            const encrypted = await encryptRequest(config.data, fields);
            config.data = encrypted;
          } catch (e) {
            console.error('请求加密失败:', e);
            throw new Error('数据加密失败，请刷新页面重试');
          }
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse): any => {
    // Blob 响应直接返回（文件下载）
    if (response.config.responseType === 'blob') {
      return response;
    }

    const res: ApiResponse = response.data;

    // 检查业务状态码
    if (res.code !== 200) {
      // 特殊错误码处理
      if (res.code === 401) {
        // Token 过期，清除登录状态
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        toast.error('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.href = '/qiushengsuan/login';
        }, 1500);
      } else {
        toast.error(res.message || '请求失败');
      }

      // 标记为已处理的业务错误，避免重复提示
      const error = new Error(res.message || '请求失败');
      (error as any)._handled = true;
      return Promise.reject(error);
    }

    // 检查响应是否需要解密
    const url = response.config.url || '';
    if (shouldDecryptResponse(url) && res.data && (res.data as any).encryptedData) {
      const encryptedData = (res.data as any).encryptedData;
      const iv = (res.data as any).iv;
      const decrypted = decryptResponse(encryptedData, iv);
      if (decrypted) {
        // 解密后的数据是完整的响应对象，替换整个 res
        return decrypted as any;
      }
    }

    return res;
  },
  (error) => {
    // 如果已经处理过业务错误，不再重复提示
    if (error._handled) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Token 过期
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          toast.error('登录已过期，请重新登录');
          setTimeout(() => {
            window.location.href = '/qiushengsuan/login';
          }, 1500);
          break;
        case 429:
          toast.error('请求过于频繁，请稍后再试');
          break;
        case 500:
          toast.error('服务器错误，请稍后再试');
          break;
        default:
          toast.error(error.response.data?.message || '网络请求失败');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('请求超时，请检查网络');
    } else {
      toast.error('网络连接失败');
    }

    return Promise.reject(error);
  }
);

export default service;
