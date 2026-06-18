/**
 * 顶部导航栏
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { logout as logoutApi } from '@/api/auth';
import { toast } from 'sonner';
import {
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

// 导航项配置
const NAV_ITEMS = [
  { label: '首页', path: '/' },
  { label: '历史', path: '/history' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 判断当前激活的导航（详情页根据source判断来源）
  const isActive = (path: string) => {
    if (location.pathname.startsWith('/detail')) {
      const source = new URLSearchParams(location.search).get('source');
      return path === (source === 'history' ? '/history' : '/');
    }
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 忽略错误
    }
    logout();
    toast.success('已退出登录');
    // 传递 voluntary 标志，登录后跳转到首页而非之前的页面
    navigate('/login', { state: { voluntary: true } });
  };

  // 获取用户显示名
  const displayName = userInfo?.nickname || userInfo?.phone || userInfo?.email || '用户';
  const avatarChar = displayName.charAt(0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: '#1A1D28', borderBottom: '1px solid #2A2D3A', height: 64 }}>
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-12 select-none">
          <span style={{ fontSize: 22 }}>⚽</span>
          <span style={{ color: '#00D68F', fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>球胜算</span>
        </Link>

        {/* 导航链接 */}
        <nav className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="relative pb-0.5 text-sm transition-colors"
              style={{
                color: isActive(item.path) ? '#FFFFFF' : '#8B8FA3',
                borderBottom: isActive(item.path) ? '2px solid #00D68F' : '2px solid transparent',
                fontWeight: isActive(item.path) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧用户区域 */}
        <div className="ml-auto flex items-center">
          {isLoggedIn ? (
            // 已登录：用户头像下拉
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {/* 头像 */}
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="头像"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00D68F 0%, #00A06A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: '#0F1117',
                      fontWeight: 700,
                    }}
                  >
                    {avatarChar}
                  </div>
                )}
                {/* 下拉箭头 */}
                <ChevronDown
                  size={14}
                  color="#8B8FA3"
                  style={{
                    transition: 'transform 0.2s',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* 下拉菜单 */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 44,
                    right: 0,
                    background: '#252836',
                    border: '1px solid #2A2D3A',
                    borderRadius: 10,
                    minWidth: 140,
                    padding: '6px 0',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 100,
                  }}
                >
                  {[
                    { icon: <User size={14} />, label: '个人中心', action: () => { setDropdownOpen(false); navigate('/profile'); } },
                    { icon: <LogOut size={14} />, label: '退出登录', action: handleLogout },
                  ].map(({ icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2D3A')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <span style={{ color: '#8B8FA3' }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 未登录：登录按钮
            <Link
              to="/login"
              style={{
                background: 'none',
                border: 'none',
                color: '#4A9EFF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 6,
                transition: 'background 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,158,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
