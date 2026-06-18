/**
 * 法律/政策页面布局
 * 用于用户协议、隐私政策、免责声明等静态页面
 * 特点：带面包屑导航、目录锚点、返回顶部
 */

import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';

/** 目录项 */
export interface TocItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  /** 页面标题 */
  title: string;
  /** 最后更新日期 */
  lastUpdated: string;
  /** 目录列表 */
  toc: TocItem[];
  /** 页面内容 */
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, toc, children }: LegalLayoutProps) {
  const navigate = useNavigate();

  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 点击目录项平滑滚动
  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1117]">
      {/* 顶部导航栏 */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
        style={{
          background: 'rgba(15,17,23,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2A2D3A',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm cursor-pointer transition-colors"
          style={{ background: 'none', border: 'none', color: '#8B8FA3' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          style={{ textDecoration: 'none' }}
        >
          <span>⚽</span>
          <span className="text-sm font-bold" style={{ color: '#00D68F' }}>球胜算</span>
        </Link>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 pt-14">
        <div className="max-w-[900px] mx-auto px-6 py-10">
          {/* 页面头部 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
            <p className="text-xs" style={{ color: '#8B8FA3' }}>
              最后更新日期：{lastUpdated}
            </p>
          </div>

          <div className="flex gap-8">
            {/* 左侧目录（桌面端固定） */}
            <aside className="hidden lg:block w-[200px] flex-shrink-0">
              <div className="sticky top-20">
                <p className="text-xs font-semibold mb-3" style={{ color: '#8B8FA3' }}>
                  目录
                </p>
                <nav className="flex flex-col gap-1">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTocClick(item.id)}
                      className="text-left text-[13px] py-1.5 px-3 rounded-md cursor-pointer transition-colors"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8B8FA3',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#8B8FA3';
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* 右侧正文 */}
            <article className="flex-1 min-w-0">
              {children}
            </article>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <Footer />
    </div>
  );
}

/**
 * 章节标题组件
 */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <h2
        className="text-base font-semibold mb-3 pb-2"
        style={{ color: '#FFFFFF', borderBottom: '1px solid #2A2D3A' }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-[14px] leading-[1.8]" style={{ color: '#B0B3C5' }}>
        {children}
      </div>
    </section>
  );
}
