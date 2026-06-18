/**
 * 认证状态管理
 * 使用 Zustand 管理用户登录状态
 */

import { create } from 'zustand';
import type { UserInfo } from '@/types/auth';
import { getUserInfo as fetchUserInfo } from '@/api/auth';

/**
 * 脱敏手机号：188****8262
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}

/**
 * 脱敏邮箱：d2***@163.com
 */
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const atIndex = email.indexOf('@');
  if (atIndex <= 2) return email;
  return email.substring(0, 2) + '***' + email.substring(atIndex);
}

/**
 * 对用户信息进行脱敏处理
 */
function maskUserInfo(info: UserInfo): UserInfo {
  return {
    ...info,
    phone: info.phone ? maskPhone(info.phone) : info.phone,
    email: info.email ? maskEmail(info.email) : info.email,
  };
}

// Store 状态类型
interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  rawUserInfo: UserInfo | null;  // 原始数据（用于换绑等操作）
  isLoggedIn: boolean;
  voluntaryLogout: boolean;  // 是否主动退出登录
}

// Store 操作类型
interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  setVoluntaryLogout: (v: boolean) => void;
  setUserInfo: (userInfo: Partial<UserInfo>) => void;
  refreshUserInfo: () => Promise<void>;
  hydrate: () => void;
}

// 合并类型
type AuthStore = AuthState & AuthActions;

// 从 localStorage 读取数据
function getTokenFromStorage(): string | null {
  return localStorage.getItem('token');
}

function getUserInfoFromStorage(): UserInfo | null {
  const stored = localStorage.getItem('userInfo');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// 创建 Store
export const useAuthStore = create<AuthStore>((set, get) => ({
  // 初始状态（从 localStorage 恢复）
  token: getTokenFromStorage(),
  userInfo: getUserInfoFromStorage(),
  rawUserInfo: null,  // 原始数据不持久化
  isLoggedIn: !!getTokenFromStorage(),
  voluntaryLogout: false,

  // 登录（只保存 token，用户信息通过 refreshUserInfo 获取）
  login: (token: string) => {
    localStorage.setItem('token', token);
    set({
      token,
      isLoggedIn: true,
      voluntaryLogout: false,
    });
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    set({
      token: null,
      userInfo: null,
      rawUserInfo: null,
      isLoggedIn: false,
    });
  },

  // 设置主动退出标志
  setVoluntaryLogout: (v: boolean) => {
    set({ voluntaryLogout: v });
  },

  // 更新用户信息（部分更新）
  setUserInfo: (userInfo: Partial<UserInfo>) => {
    const current = get().userInfo;
    if (current) {
      const updated = { ...current, ...userInfo };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      set({ userInfo: updated });
    }
  },

  // 从服务器刷新用户信息
  refreshUserInfo: async () => {
    try {
      const res = await fetchUserInfo();
      const info = res.data;
      if (info) {
        // 脱敏后存储到 localStorage
        const maskedInfo = maskUserInfo(info);
        localStorage.setItem('userInfo', JSON.stringify(maskedInfo));
        // 原始数据保存在内存中，不持久化
        set({ userInfo: maskedInfo, rawUserInfo: info });
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  },

  // 从 localStorage 恢复状态（用于初始化）
  hydrate: () => {
    set({
      token: getTokenFromStorage(),
      userInfo: getUserInfoFromStorage(),
      isLoggedIn: !!getTokenFromStorage(),
    });
  },
}));
