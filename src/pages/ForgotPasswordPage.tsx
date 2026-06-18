/**
 * 忘记密码页面
 * 按 UI 设计稿实现：图形验证码 + 验证码 + 新密码 + 确认密码
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { sendCode, resetPassword } from '@/api/auth';
import { triggerCaptcha } from '@/utils/captcha';
import { getPasswordStrengthDetail, validatePassword } from '@/lib/validators';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type SmsSendState = 'idle' | 'sending' | 'countdown';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function maskAccount(v: string) {
  if (/^1[3-9]\d{9}$/.test(v)) return v.slice(0, 3) + '****' + v.slice(7);
  const at = v.indexOf('@');
  if (at > 1) return v.slice(0, 2) + '***' + v.slice(at);
  return v;
}

/* ------------------------------------------------------------------ */
/*  InputField                                                         */
/* ------------------------------------------------------------------ */
function InputField({
  icon, placeholder, value, onChange, type = 'text',
  disabled, rightSlot, error, hint,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  error?: string;
  hint?: string;
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
      {error && <div className="text-[#FF4D6A] text-xs mt-1">{error}</div>}
      {!error && hint && <div className="text-[#00D68F] text-xs mt-1">{hint}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ForgotPasswordPage                                                 */
/* ------------------------------------------------------------------ */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [account, setAccount] = useState('');
  const [accountError, setAccountError] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsState, setSmsState] = useState<SmsSendState>('idle');
  const [countdown, setCountdown] = useState(60);
  const [smsHint, setSmsHint] = useState('');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (cdRef.current) clearInterval(cdRef.current); }, []);

  const isPhoneFormat = (v: string) => /^1[3-9]\d{9}$/.test(v);
  const isEmailFormat = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidAccount = (v: string) => isPhoneFormat(v) || isEmailFormat(v);

  // 清理输入（去除空格等）
  const cleanInput = (v: string) => v.replace(/\s+/g, '');

  // 判断输入是否看起来还在输入中（不报错）
  const isTyping = (v: string) => {
    if (!v) return true;
    const cleaned = cleanInput(v);
    if (/^\d+$/.test(cleaned) && cleaned.length < 11) return true;
    if (cleaned.includes('@') && !isEmailFormat(cleaned)) return true;
    return false;
  };

  // 账号验证
  const handleAccountChange = (v: string) => {
    const cleaned = cleanInput(v);
    setAccount(cleaned);
    setAccountError(cleaned && !isTyping(cleaned) && !isValidAccount(cleaned) ? '请输入正确的手机号或邮箱' : '');
  };

  const accountOk = isValidAccount(account);

  // 发送验证码（点击时自动弹出图形验证码）
  const canSend = accountOk && smsState === 'idle';
  const handleSend = async () => {
    if (!canSend) return;
    setSmsState('sending');
    try {
      // 每次点击都弹出图形验证码
      const { ticket, randstr } = await triggerCaptcha();
      await sendCode({ phoneOrEmail: account, ticket, randstr });
      setSmsState('countdown');
      setSmsHint(`验证码已发送至 ${maskAccount(account)}`);
      setCountdown(60);
      cdRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(cdRef.current!); setSmsState('idle'); setSmsHint(''); return 60; }
          return c - 1;
        });
      }, 1000);
    } catch {
      setSmsState('idle');
    }
  };

  // 密码
  const handlePwChange = (v: string) => {
    if (v.length > 32) return;
    setPassword(v);
    setPwError('');
    if (confirmPw && v !== confirmPw) setConfirmError('两次密码不一致');
    else setConfirmError('');
  };

  const handleConfirmChange = (v: string) => {
    setConfirmPw(v);
    setConfirmError(v && v !== password ? '两次密码不一致' : '');
  };

  const strengthDetail = getPasswordStrengthDetail(password);

  // 表单验证
  const pwValidateResult = validatePassword(password);
  const formOk = accountOk && smsCode.length >= 6 &&
    password.length >= 8 && !pwValidateResult && confirmPw === password &&
    !accountError && !confirmError;

  // 提交重置
  const handleReset = useCallback(async () => {
    if (!formOk || loading) return;
    const error = validatePassword(password);
    if (error) { toast.error(error); return; }
    setLoading(true);
    try {
      await resetPassword({
        phoneOrEmail: account,
        verifyCode: smsCode,
        newPassword: password,
      });
      setLoading(false);
      setShowToast(true);
      setTimeout(() => navigate('/login', { replace: true }), 2200);
    } catch {
      setLoading(false);
    }
  }, [formOk, loading, account, smsCode, password, navigate]);

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col">
      {showToast && (
        <div className="fixed top-7 left-1/2 -translate-x-1/2 rounded-[10px] px-6 py-3 text-sm font-bold z-[9999] pointer-events-none"
          style={{ background: '#00D68F', color: '#0F1117', boxShadow: '0 8px 24px rgba(0,214,143,0.35)' }}>
          ✓ &nbsp;密码重置成功，请重新登录
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        {/* 卡片 */}
        <div className="w-full max-w-[440px] overflow-hidden"
          style={{ background: '#1A1D28', borderRadius: 16, border: '1px solid #2A2D3A', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

          {/* 头部 */}
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 text-center">
            <div className="w-10 h-10 flex items-center justify-center text-[22px] mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #00D68F 0%, #00A06A 100%)', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,214,143,0.3)' }}>
              ⚽
            </div>
            <div className="text-white text-2xl font-bold leading-tight">球胜算</div>
            <div className="text-[#8B8FA3] text-sm mt-1.5">通过验证码重置您的密码</div>
          </div>

          {/* 分割线 */}
          <div className="h-px bg-[#2A2D3A] mx-8" />

          {/* 表单 */}
          <div className="px-8 pt-6 pb-7 flex flex-col gap-3.5">
            <InputField icon="👤" placeholder="手机号 / 邮箱" value={account} onChange={handleAccountChange} error={accountError} disabled={loading} />

            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField icon="✉️" placeholder="请输入验证码" value={smsCode}
                    onChange={(v) => setSmsCode(v.replace(/\D/g, '').slice(0, 6))}
                    disabled={!accountOk || loading} />
                </div>
                <button onClick={handleSend} disabled={!canSend || loading}
                  className="h-[44px] px-3.5 rounded-lg border border-[#2A2D3A] bg-transparent text-[13px] font-semibold whitespace-nowrap min-w-[100px] transition-colors"
                  style={{ color: canSend ? '#4A9EFF' : '#8B8FA3', cursor: canSend ? 'pointer' : 'not-allowed' }}>
                  {smsState === 'sending' ? '发送中...' : smsState === 'countdown' ? `${countdown}s 后重发` : '发送验证码'}
                </button>
              </div>
              {smsHint && <div className="text-[#8B8FA3] text-xs mt-1">{smsHint}</div>}
            </div>

            <div>
              <InputField icon="🔒" placeholder="新密码（8-20位）" value={password}
                type={showPw ? 'text' : 'password'} onChange={handlePwChange} disabled={loading} error={pwError}
                rightSlot={
                  <button onClick={() => setShowPw((s) => !s)} className="bg-transparent border-none cursor-pointer text-[#8B8FA3] text-base p-0">
                    {showPw ? '🙈' : '👁'}
                  </button>
                } />
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((seg) => (
                      <div key={seg} className="flex-1 h-[3px] rounded-sm transition-colors"
                        style={{ background: strengthDetail.level >= seg ? strengthDetail.color : '#2A2D3A' }} />
                    ))}
                  </div>
                  {strengthDetail.label && (
                    <span className="text-[11px]" style={{ color: strengthDetail.color }}>
                      密码强度：{strengthDetail.label}
                      {strengthDetail.error && `（${strengthDetail.error}）`}
                    </span>
                  )}
                </div>
              )}
            </div>

            <InputField icon="🔒" placeholder="确认新密码" value={confirmPw}
              type={showConfirm ? 'text' : 'password'} onChange={handleConfirmChange} disabled={loading} error={confirmError}
              hint={confirmPw && !confirmError ? '✓ 密码一致' : undefined}
              rightSlot={
                <button onClick={() => setShowConfirm((s) => !s)} className="bg-transparent border-none cursor-pointer text-[#8B8FA3] text-base p-0">
                  {showConfirm ? '🙈' : '👁'}
                </button>
              } />

            {/* 提交按钮 */}
            <button onClick={handleReset} disabled={!formOk || loading}
              className="w-full h-[44px] rounded-lg border-none flex items-center justify-center gap-2 transition-all mt-0.5"
              style={{
                background: formOk && !loading ? '#00D68F' : '#1A3D2E',
                color: formOk && !loading ? '#0F1117' : '#4A7A62',
                fontSize: 15, fontWeight: 700,
                cursor: formOk && !loading ? 'pointer' : 'not-allowed',
              }}>
              {loading && <span className="w-4 h-4 rounded-full border-2 border-[rgba(15,17,23,0.3)] border-t-[#0F1117] inline-block animate-spin" />}
              {loading ? '重置中...' : '确认重置'}
            </button>

            {/* 返回登录 */}
            <div className="text-center mt-0.5">
              <Link to="/login" className="text-[#4A9EFF] text-sm hover:opacity-70 transition-opacity">← 返回登录</Link>
            </div>
          </div>
        </div>

        {/* 法律声明 */}
        <div className="mt-5 text-center text-[11px] text-[#5A5D70] leading-relaxed">
          重置密码即表示同意
          <a href="#" className="text-[#4A9EFF] hover:underline">《服务协议》</a>
          {' '}和{' '}
          <a href="#" className="text-[#4A9EFF] hover:underline">《隐私政策》</a>
        </div>
      </div>

      <Footer />
      <style>{`input::placeholder { color: #5A5D70; } input:disabled { color: #8B8FA3; }`}</style>
    </div>
  );
}
