/**
 * 页面底部
 */

import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer
      style={{
        background: '#0F1117',
        borderTop: '1px solid #2A2D3A',
        marginTop: 32,
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>⚽</span>
            <span style={{ color: '#00D68F', fontSize: 16, fontWeight: 700 }}>球胜算</span>
          </div>
          <span style={{ color: '#8B8FA3', fontSize: 12 }}>看球，算球，球胜算</span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8B8FA3', fontSize: 12 }}>
          {[
            { label: '用户协议', path: '/terms' },
            { label: '隐私政策', path: '/privacy' },
            { label: '免责声明', path: '/disclaimer' },
          ].map((link, i) => (
            <span key={link.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span>·</span>}
              <Link
                to={link.path}
                style={{
                  color: '#8B8FA3',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ color: '#8B8FA3', fontSize: 12, textAlign: 'center' }}>
          © 2026 球胜算 &nbsp; 数据来源于公开渠道，仅供学习研究参考，不构成任何决策建议
        </div>

        {/* ICP备案号 */}
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#8B8FA3',
            fontSize: 12,
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
        >
          皖ICP备2026018580号-1
        </a>
      </div>
    </footer>
  );
}
