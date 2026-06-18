/**
 * 路由配置
 */

import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AuthGuard, GuestGuard } from './AuthGuard';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage'));
const MatchDetailPage = lazy(() => import('@/pages/MatchDetailPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const DisclaimerPage = lazy(() => import('@/pages/DisclaimerPage'));

// 加载中组件
function PageLoading() {
  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">加载中...</span>
      </div>
    </div>
  );
}

// 包装懒加载组件
function LazyLoad(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  );
}

// 路由配置
export const routes: RouteObject[] = [
  // 公开路由（无需登录）
  {
    path: '/terms',
    element: LazyLoad(TermsPage),
  },
  {
    path: '/privacy',
    element: LazyLoad(PrivacyPage),
  },
  {
    path: '/disclaimer',
    element: LazyLoad(DisclaimerPage),
  },

  // 公开路由（游客可访问）
  {
    path: '/login',
    element: <GuestGuard>{LazyLoad(LoginPage)}</GuestGuard>,
  },
  {
    path: '/register',
    element: <GuestGuard>{LazyLoad(RegisterPage)}</GuestGuard>,
  },
  {
    path: '/forgot-password',
    element: <GuestGuard>{LazyLoad(ForgotPasswordPage)}</GuestGuard>,
  },

  // 保护路由（需要登录）
  {
    path: '/',
    element: <AuthGuard>{LazyLoad(HomePage)}</AuthGuard>,
  },
  {
    path: '/history',
    element: <AuthGuard>{LazyLoad(HistoryPage)}</AuthGuard>,
  },
  {
    path: '/detail',
    element: <AuthGuard>{LazyLoad(MatchDetailPage)}</AuthGuard>,
  },
  {
    path: '/profile',
    element: <AuthGuard>{LazyLoad(ProfilePage)}</AuthGuard>,
  },

  // 404 重定向到首页
  {
    path: '*',
    element: <AuthGuard>{LazyLoad(HomePage)}</AuthGuard>,
  },
];
