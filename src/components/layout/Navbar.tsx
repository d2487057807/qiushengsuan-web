/**
 * 顶部导航栏
 * 支持移动端汉堡菜单
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
  Menu,
  X,
} from 'lucide-react';

// 导航项配置
const NAV_ITEMS = [
  { label: '首页', path: '/' },
  { label: '历史', path: '/history' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, logout, setVoluntaryLogout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // 页面切换时关闭移动菜单
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

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
    // 先设置主动退出标志，再 logout（logout 会触发 AuthGuard 重定向）
    setVoluntaryLogout(true);
    logout();
    setMobileMenuOpen(false);
    toast.success('已退出登录');
  };

  // 获取用户显示名
  const displayName = userInfo?.nickname || userInfo?.phone || userInfo?.email || '用户';
  const avatarChar = displayName.charAt(0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16" style={{ background: '#1A1D28', borderBottom: '1px solid #2A2D3A' }}>
      <div className="max-w-[1200px] mx-auto h-full px-4 md:px-6 flex items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 md:mr-12 select-none">
          <span className="text-xl">⚽</span>
          <span className="text-sm md:text-base font-bold tracking-wide" style={{ color: '#00D68F' }}>球胜算</span>
        </Link>

        {/* 桌面端导航链接 */}
        <nav className="hidden md:flex items-center gap-8">
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
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* 桌面端：用户头像下拉 */}
              <div className="hidden md:block relative" ref={dropdownRef}>
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
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #00D68F 0%, #00A06A 100%)',
                        color: '#0F1117',
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
                    className="absolute right-0 mt-1 rounded-lg"
                    style={{
                      top: 44,
                      background: '#252836',
                      border: '1px solid #2A2D3A',
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
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
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

              {/* 移动端：头像 + 汉堡按钮 */}
              <div className="flex md:hidden items-center gap-2">
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="头像"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00D68F 0%, #00A06A 100%)',
                      color: '#0F1117',
                    }}
                  >
                    {avatarChar}
                  </div>
                )}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8FA3' }}
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
              style={{
                background: 'none',
                border: 'none',
                color: '#4A9EFF',
                textDecoration: 'none',
              }}
            >
              登录
            </Link>
          )}
        </div>
      </div>

      {/* 移动端菜单面板 */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            background: '#1A1D28',
            borderBottom: '1px solid #2A2D3A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <nav className="flex flex-col px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="py-3 text-sm no-underline transition-colors"
                style={{
                  color: isActive(item.path) ? '#FFFFFF' : '#8B8FA3',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  borderBottom: '1px solid #2A2D3A',
                }}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link
                  to="/profile"
                  className="py-3 text-sm no-underline transition-colors flex items-center gap-2"
                  style={{ color: '#8B8FA3', borderBottom: '1px solid #2A2D3A' }}
                >
                  <User size={14} />
                  个人中心
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-3 text-sm text-left flex items-center gap-2"
                  style={{ background: 'none', border: 'none', color: '#FF4D6A', cursor: 'pointer' }}
                >
                  <LogOut size={14} />
                  退出登录
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
