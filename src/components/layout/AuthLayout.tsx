/**
 * 认证页面布局
 * 居中卡片样式，用于登录/注册/忘记密码页面
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4 py-8">
      <div
        className={cn(
          'w-full max-w-[440px] bg-card border border-border rounded-xl p-8',
          className
        )}
      >
        {/* 品牌区域 */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xl">⚽</span>
            </div>
            <span className="text-2xl font-bold text-primary">球胜算</span>
          </Link>

          {/* 标题 */}
          <h1 className="text-xl font-semibold text-white">{title}</h1>

          {/* 副标题 */}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* 内容区域 */}
        {children}
      </div>
    </div>
  );
}
