/**
 * 页面布局组件
 * 包含 Navbar + 主内容区 + Footer
 */

import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  // 是否显示 Footer，默认 true
  showFooter?: boolean;
  // 主内容区最大宽度，默认 1200px
  maxWidth?: string;
}

export function PageLayout({
  children,
  className,
  showFooter = true,
  maxWidth = '1200px',
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F1117]">
      {/* 顶部导航 */}
      <Navbar />

      {/* 主内容区 */}
      <main
        className={cn(
          'flex-1 pt-16 pb-8 px-6 mx-auto w-full',
          className
        )}
        style={{ maxWidth }}
      >
        {children}
      </main>

      {/* 底部 */}
      {showFooter && <Footer />}
    </div>
  );
}
