/**
 * 页面底部
 */

import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-6 md:mt-8 py-6 md:py-8 px-4 md:px-6 safe-area-inset-bottom" style={{ background: '#0F1117', borderTop: '1px solid #2A2D3A' }}>
      <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-3.5">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">⚽</span>
            <span className="text-base font-bold" style={{ color: '#00D68F' }}>球胜算</span>
          </div>
          <span className="text-xs" style={{ color: '#8B8FA3' }}>看球，算球，球胜算</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 text-xs" style={{ color: '#8B8FA3' }}>
          {[
            { label: '用户协议', path: '/terms' },
            { label: '隐私政策', path: '/privacy' },
            { label: '免责声明', path: '/disclaimer' },
          ].map((link, i) => (
            <span key={link.label} className="flex items-center gap-1">
              {i > 0 && <span>·</span>}
              <Link
                to={link.path}
                className="no-underline transition-colors"
                style={{ color: '#8B8FA3' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-xs text-center leading-relaxed" style={{ color: '#8B8FA3' }}>
          <div>© 2026 球胜算</div>
          <div className="mt-1">数据来源于公开渠道，仅供学习研究参考，不构成任何决策建议</div>
        </div>

        {/* ICP备案号 */}
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs no-underline transition-colors"
          style={{ color: '#8B8FA3' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
        >
          皖ICP备2026018580号-1
        </a>
      </div>
    </footer>
  );
}
