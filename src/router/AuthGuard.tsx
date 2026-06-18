/**
 * 路由守卫组件
 * 检查用户是否登录，未登录则跳转到登录页
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    // 未登录，跳转到登录页，并记住原路径
    // 保留已有的 state（如 voluntary 标志），避免被覆盖
    const existingState = location.state as Record<string, unknown> | null;
    return <Navigate to="/login" state={{ ...existingState, from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

/**
 * 已登录用户访问认证页面时的守卫
 * 已登录用户访问登录/注册页时，跳转到首页
 */
interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    // 已登录，跳转到首页
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
