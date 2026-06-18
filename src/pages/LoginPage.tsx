/**
 * 登录页面
 * 按 UI 设计稿实现：验证码登录 + 密码登录，含图形验证码、账号锁定、自动登录等
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/stores/auth';
import { sendCode, phoneLogin, passwordLogin } from '@/api/auth';
import { triggerCaptcha } from '@/utils/captcha';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type TabId = 'sms' | 'password';
type SmsSendState = 'idle' | 'sending' | 'countdown' | 'sent';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function maskPhone(phone: string) {
  if (phone.length < 8) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}

/* ------------------------------------------------------------------ */
/*  InputField                                                         */
/* ------------------------------------------------------------------ */
function InputField({
  icon, placeholder, value, onChange, type = 'text',
  disabled, rightSlot, error,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div
        className="flex items-center rounded-lg h-[44px] transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${error ? '#FF4D6A' : focused ? '#00D68F' : '#2A2D3A'}`,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <span className="px-[12px] text-base flex-shrink-0 select-none">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm caret-[#00D68F] placeholder:text-[#5A5D70] disabled:text-[#8B8FA3]"
        />
        {rightSlot && <div className="pr-[10px] flex-shrink-0">{rightSlot}</div>}
      </div>
      {error && (
        <div className="text-[#FF4D6A] text-xs mt-1">{error}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SMS Tab                                                            */
/* ------------------------------------------------------------------ */
function SmsTab({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUserInfo } = useAuthStore();
  const state = location.state as { from?: string; voluntary?: boolean };
  // 主动退出登录后跳转到首页，被拦截则返回原页面
  const from = state?.voluntary ? '/' : (state?.from || '/');

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSendState, setSmsSendState] = useState<SmsSendState>('idle');
  const [countdown, setCountdown] = useState(60);
  const [smsHint, setSmsHint] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPhoneValid = /^1[3-9]\d{9}$/.test(phone);
  const canSendSms = isPhoneValid && smsSendState === 'idle';

  // 手机号验证
  const handlePhoneChange = (v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 11);
    setPhone(cleaned);
    const valid = /^1[3-9]\d{9}$/.test(cleaned);
    if (cleaned.length > 0 && cleaned.length < 11) {
      setPhoneError('');
    } else if (cleaned.length === 11 && !valid) {
      setPhoneError('请输入正确的手机号');
    } else {
      setPhoneError('');
    }
  };

  // 发送验证码（点击时自动弹出图形验证码）
  const handleSendSms = async () => {
    if (!canSendSms) return;
    setSmsSendState('sending');
    try {
      // 每次点击都弹出图形验证码
      const { ticket, randstr } = await triggerCaptcha();
      await sendCode({ phoneOrEmail: phone, ticket, randstr });
      setSmsSendState('countdown');
      setSmsHint(`验证码已发送至 ${maskPhone(phone)}`);
      setCountdown(60);
      cdRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(cdRef.current!);
            setSmsSendState('idle');
            setSmsHint('');
            return 60;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setSmsSendState('idle');
    }
  };

  useEffect(() => () => { if (cdRef.current) clearInterval(cdRef.current); }, []);

  // 触发登录
  const doLogin = useCallback(async (code: string) => {
    setLoginLoading(true);
    try {
      const res = await phoneLogin({ phoneOrEmail: phone, code });
      const { token } = res.data;
      login(token);
      await refreshUserInfo();
      setLoginLoading(false);
      onSuccess();
      setTimeout(() => navigate(from, { replace: true }), 500);
    } catch {
      setLoginLoading(false);
    }
  }, [phone, login, refreshUserInfo, onSuccess, navigate, from]);

  // 6位自动登录
  const handleSmsCodeChange = (v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 6);
    setSmsCode(cleaned);
    if (cleaned.length === 6) {
      doLogin(cleaned);
    }
  };

  const loading = loginLoading;

  return (
    <div className="flex flex-col gap-3">
      {/* 手机号 */}
      <InputField
        icon="📱"
        placeholder="请输入手机号"
        value={phone}
        onChange={handlePhoneChange}
        error={phoneError}
        disabled={loading}
      />

      {/* 验证码 + 发送按钮 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <InputField
            icon="✉️"
            placeholder="请输入验证码"
            value={smsCode}
            onChange={handleSmsCodeChange}
            disabled={!isPhoneValid || loading}
          />
        </div>
        <button
          onClick={handleSendSms}
          disabled={!canSendSms || loading}
          className="h-[44px] rounded-lg border border-[#2A2D3A] bg-transparent text-[13px] font-semibold whitespace-nowrap min-w-[100px] transition-all"
          style={{
            color: canSendSms ? '#4A9EFF' : '#8B8FA3',
            cursor: canSendSms ? 'pointer' : 'not-allowed',
          }}
        >
          {smsSendState === 'sending' ? '发送中...' :
           smsSendState === 'countdown' ? `${countdown}s 后重发` :
           '发送验证码'}
        </button>
      </div>

      {/* 发送提示 */}
      {smsHint && (
        <div className="text-[#8B8FA3] text-xs text-center">{smsHint}</div>
      )}

      {/* 登录按钮 */}
      <button
        onClick={() => smsCode.length === 6 && doLogin(smsCode)}
        disabled={loading || smsCode.length < 6}
        className="w-full h-[44px] rounded-lg border-none flex items-center justify-center gap-2 transition-all mt-1"
        style={{
          background: loading || smsCode.length < 6 ? '#1A3D2E' : '#00D68F',
          color: loading || smsCode.length < 6 ? '#4A7A62' : '#0F1117',
          fontSize: 15,
          fontWeight: 700,
          cursor: loading || smsCode.length < 6 ? 'not-allowed' : 'pointer',
        }}
      >
        {loading && (
          <span className="w-4 h-4 rounded-full border-2 border-[rgba(15,17,23,0.3)] border-t-[#0F1117] inline-block animate-spin" />
        )}
        {loading ? '登录中...' : '登　录'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password Tab                                                       */
/* ------------------------------------------------------------------ */
function PasswordTab({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUserInfo } = useAuthStore();
  const state = location.state as { from?: string; voluntary?: boolean };
  // 主动退出登录后跳转到首页，被拦截则返回原页面
  const from = state?.voluntary ? '/' : (state?.from || '/');

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const canLogin = account.length > 0 && password.length > 0 && !loginLoading;

  const handleLogin = async () => {
    if (!canLogin) return;

    try {
      // 触发腾讯云验证码
      const { ticket, randstr } = await triggerCaptcha();

      setLoginLoading(true);
      try {
        const res = await passwordLogin({ phoneOrEmail: account, password, ticket, randstr });
        const { token } = res.data;
        login(token);
        await refreshUserInfo();
        setLoginLoading(false);
        onSuccess();
        setTimeout(() => navigate(from, { replace: true }), 500);
      } catch {
        setLoginLoading(false);
      }
    } catch {
      // 图形验证码取消
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 账号 */}
      <InputField
        icon="👤"
        placeholder="手机号 / 邮箱"
        value={account}
        onChange={setAccount}
        disabled={loginLoading}
      />

      {/* 密码 */}
      <div>
        <InputField
          icon="🔒"
          placeholder="请输入密码"
          value={password}
          type={showPw ? 'text' : 'password'}
          onChange={setPassword}
          disabled={loginLoading}
          rightSlot={
            <button
              onClick={() => setShowPw((s) => !s)}
              className="bg-transparent border-none cursor-pointer text-[#8B8FA3] text-base leading-none p-0"
            >
              {showPw ? '🙈' : '👁'}
            </button>
          }
        />
      </div>

      {/* 登录按钮 */}
      <button
        onClick={handleLogin}
        disabled={!canLogin}
        className="w-full h-[44px] rounded-lg border-none flex items-center justify-center gap-2 transition-all mt-1"
        style={{
          background: canLogin ? '#00D68F' : '#1A3D2E',
          color: canLogin ? '#0F1117' : '#4A7A62',
          fontSize: 15,
          fontWeight: 700,
          cursor: canLogin ? 'pointer' : 'not-allowed',
        }}
      >
        {loginLoading && (
          <span className="w-4 h-4 rounded-full border-2 border-[rgba(15,17,23,0.3)] border-t-[#0F1117] inline-block animate-spin" />
        )}
        {loginLoading ? '登录中...' : '登　录'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main LoginPage                                                     */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<TabId>('sms');
  const [showToast, setShowToast] = useState(false);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ sms: null, password: null });
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const TABS: { id: TabId; label: string }[] = [
    { id: 'sms', label: '验证码登录' },
    { id: 'password', label: '密码登录' },
  ];

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  const handleSuccess = useCallback(() => {
    setShowToast(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {/* 成功 Toast */}
      {showToast && (
        <div
          className="fixed top-7 left-1/2 -translate-x-1/2 rounded-[10px] px-6 py-3 text-sm font-bold z-[9999] pointer-events-none"
          style={{
            background: '#00D68F',
            color: '#0F1117',
            boxShadow: '0 8px 24px rgba(0,214,143,0.35)',
          }}
        >
          ✓ &nbsp;登录成功
        </div>
      )}

      {/* 主区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 min-h-[calc(100vh-110px)]">
        {/* 登录卡片 */}
        <div
          className="w-full max-w-[440px] overflow-hidden"
          style={{
            background: '#1A1D28',
            borderRadius: 16,
            border: '1px solid #2A2D3A',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* 卡片头部 */}
          <div className="px-8 pt-8 text-center">
            {/* 品牌区域 */}
            <div className="mb-5">
              <div
                className="w-10 h-10 flex items-center justify-center text-[22px] mx-auto mb-3"
                style={{
                  background: 'linear-gradient(135deg, #00D68F 0%, #00A06A 100%)',
                  borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,214,143,0.3)',
                }}
              >
                ⚽
              </div>
              <div className="text-white text-2xl font-bold leading-tight">球胜算</div>
              <div className="text-[#8B8FA3] text-sm mt-1.5">看球，算球，球胜算</div>
            </div>

            {/* Tab 栏 */}
            <div className="relative flex mb-7">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  ref={(el) => { tabRefs.current[id] = el; }}
                  onClick={() => setActiveTab(id)}
                  className="flex-1 py-2.5 bg-transparent border-none cursor-pointer transition-colors"
                  style={{
                    color: activeTab === id ? '#FFFFFF' : '#8B8FA3',
                    fontSize: 15,
                    fontWeight: activeTab === id ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
              {/* 分割线 */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2A2D3A]" />
              {/* 滑动指示器 */}
              <div
                className="absolute bottom-0 h-0.5 bg-[#00D68F] rounded-sm z-10"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  transition: 'left 0.3s ease-out, width 0.3s ease-out',
                }}
              />
            </div>
          </div>

          {/* 卡片内容 */}
          <div className="px-8 pb-7">
            {activeTab === 'sms' ? (
              <SmsTab onSuccess={handleSuccess} />
            ) : (
              <PasswordTab onSuccess={handleSuccess} />
            )}

            {/* 底部链接 */}
            <div className="flex items-center justify-center gap-1.5 mt-5 text-sm text-[#8B8FA3]">
              <Link to="/register" className="text-[#4A9EFF] hover:opacity-70 transition-opacity">
                注册账号
              </Link>
              <span className="text-[#3A3D4A]">·</span>
              <Link to="/forgot-password" className="text-[#4A9EFF] hover:opacity-70 transition-opacity">
                忘记密码
              </Link>
            </div>
          </div>
        </div>

        {/* 法律声明 */}
        <div className="mt-5 text-center text-[11px] text-[#5A5D70] leading-relaxed">
          登录即表示同意
          <a href="#" className="text-[#4A9EFF] hover:underline">《服务协议》</a>
          {' '}和{' '}
          <a href="#" className="text-[#4A9EFF] hover:underline">《隐私政策》</a>
        </div>
      </div>

      <Footer />

      <style>{`
        input::placeholder { color: #5A5D70; }
        input:disabled { color: #8B8FA3; }
      `}</style>
    </div>
  );
}
