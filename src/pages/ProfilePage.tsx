/**
 * 个人中心页
 * 按设计稿实现：单一信息列表（icon+label+value+action）、头像hover遮罩、
 * 昵称弹窗编辑、手机两步换绑、密码eye toggle + 强度条、退出确认弹窗、头像裁剪弹窗
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { CaptchaButton } from '@/components/shared/CaptchaButton';
import { useAuthStore } from '@/stores/auth';
import {
  uploadAvatar,
  updateNickname,
  updatePhone,
  updateEmail,
  changePassword,
  sendCode,
  logout as logoutApi,
} from '@/api/auth';
import { isValidImageType, isValidFileSize } from '@/lib/validators';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

// Modal类型
type ModalType = 'nickname' | 'phone' | 'email' | 'password' | 'logout' | 'avatar' | null;

/**
 * 密码强度计算
 */
function calcPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string; error?: string } {
  if (!pw) return { level: 0, label: '', color: '' };

  // 长度校验
  if (pw.length < 8 || pw.length > 20) {
    return { level: 1, label: '弱', color: '#FF4D6A', error: '密码长度需8-20位' };
  }

  // 检查连续3位相同字符
  for (let i = 0; i <= pw.length - 3; i++) {
    if (pw[i] === pw[i + 1] && pw[i + 1] === pw[i + 2]) {
      return { level: 1, label: '弱', color: '#FF4D6A', error: '不允许连续3位相同字符' };
    }
  }

  // 统计字符类型
  let types = 0;
  if (/[a-z]/.test(pw)) types++;
  if (/[A-Z]/.test(pw)) types++;
  if (/\d/.test(pw)) types++;

  // 至少需要两种字符类型
  if (types < 2) {
    return { level: 1, label: '弱', color: '#FF4D6A', error: '需包含大写、小写字母、数字中的至少两类' };
  }

  // 三种字符类型 + 长度 >= 12 → 强
  if (types >= 3 && pw.length >= 12) {
    return { level: 3, label: '强', color: '#00D68F' };
  }

  return { level: 2, label: '中', color: '#F59E0B' };
}

/**
 * 信息行组件
 */
function InfoRow({
  icon,
  label,
  value,
  actionLabel,
  onAction,
  isLast,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  isLast?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onAction}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center h-12 md:h-14 px-4 md:px-5 transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '1px solid #2A2D3A',
        cursor: onAction ? 'pointer' : 'default',
        background: hovered && onAction ? 'rgba(255,255,255,0.02)' : 'transparent',
      }}
    >
      <span className="text-base w-6 md:w-7 flex-shrink-0">{icon}</span>
      <span className="text-xs md:text-sm w-14 md:w-[72px] flex-shrink-0" style={{ color: '#8B8FA3' }}>{label}</span>
      <span className="text-xs md:text-sm text-white flex-1 truncate">{value}</span>
      {actionLabel && (
        <span className="text-xs md:text-[13px] mr-1 md:mr-2 flex-shrink-0" style={{ color: '#4A9EFF' }}>{actionLabel}</span>
      )}
      {onAction && (
        <span className="text-base" style={{ color: '#3A3D4A' }}>›</span>
      )}
    </div>
  );
}

/**
 * 头像裁剪弹窗
 */
function AvatarCropModal({
  src,
  onClose,
  onConfirm,
}: {
  src: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setUploading(true);
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        setProgress(100);
        clearInterval(id);
        setTimeout(onConfirm, 300);
      } else {
        setProgress(Math.min(p, 99));
      }
    }, 120);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">裁剪头像</span>
          <button
            onClick={onClose}
            className="text-xl cursor-pointer transition-colors p-0"
            style={{ background: 'none', border: 'none', color: '#8B8FA3', lineHeight: 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
          >
            ×
          </button>
        </div>
        {/* 内容 */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* 圆形预览 */}
          <div
            className="w-40 h-40 rounded-full overflow-hidden relative"
            style={{
              border: '3px solid #00D68F',
              boxShadow: '0 0 0 4px rgba(0,214,143,0.15)',
            }}
          >
            <img src={src} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="text-xs" style={{ color: '#8B8FA3' }}>预览效果（已自动裁剪为圆形）</div>

          {uploading ? (
            <div className="w-full">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: '#8B8FA3' }}>上传中...</span>
                <span className="text-xs font-semibold" style={{ color: '#00D68F' }}>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-sm" style={{ background: '#252836' }}>
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #00D68F, #00A06A)',
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-2.5 w-full">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-lg text-sm cursor-pointer transition-all"
                style={{ background: 'none', border: '1px solid #2A2D3A', color: '#8B8FA3' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A3D4A'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3A'; e.currentTarget.style.color = '#8B8FA3'; }}
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 h-11 rounded-lg text-sm font-bold cursor-pointer"
                style={{ background: '#00D68F', border: 'none', color: '#0F1117' }}
              >
                确认裁剪并上传
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 修改昵称弹窗
 */
function EditNicknameModal({
  current,
  onClose,
  onSave,
}: {
  current: string;
  onClose: () => void;
  onSave: (n: string) => void;
}) {
  const [val, setVal] = useState(current);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isValid = val.length >= 2 && val.length <= 20;

  const handleChange = (v: string) => {
    if (v.length > 20) return;
    setVal(v);
    setError(v.length > 0 && v.length < 2 ? '昵称至少 2 个字符' : '');
  };

  const handleSave = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await updateNickname({ nickname: val });
      onSave(val);
    } catch {
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">修改昵称</span>
          <button onClick={onClose} className="text-xl cursor-pointer p-0" style={{ background: 'none', border: 'none', color: '#8B8FA3' }}>×</button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px]" style={{ color: '#8B8FA3' }}>昵称</span>
              <span className="text-xs" style={{ color: val.length > 18 ? '#FF4D6A' : '#8B8FA3' }}>{val.length}/20</span>
            </div>
            <InputField
              placeholder="请输入昵称（2-20字符）"
              value={val}
              onChange={handleChange}
              error={error}
            />
          </div>
          <div className="flex gap-2.5">
            <GhostBtn label="取消" onClick={onClose} />
            <PrimaryBtn label={loading ? '保存中...' : '保存'} onClick={handleSave} disabled={!isValid} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 手机换绑弹窗（两步）
 */
function ChangePhoneModal({
  displayPhone,
  rawPhone,
  onClose,
  onSuccess,
}: {
  displayPhone: string;  // 脱敏手机号，用于页面展示
  rawPhone: string;      // 完整手机号，用于发送验证码
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [code1, setCode1] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneErr, setNewPhoneErr] = useState('');
  const [code2, setCode2] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPhone = (v: string) => /^1[3-9]\d{9}$/.test(v);

  const handleSendOldCode = async (_account: string, ticket: string, randstr: string) => {
    await sendCode({ phoneOrEmail: rawPhone, ticket, randstr });
  };

  const handleSendNewCode = async (_account: string, ticket: string, randstr: string) => {
    // 校验新手机号不能与原手机号相同
    if (newPhone === rawPhone) {
      toast.error('新手机号不能与当前手机号相同');
      return;
    }
    await sendCode({ phoneOrEmail: newPhone, ticket, randstr });
  };

  const handleStep1 = async () => {
    if (code1.length < 6 || loading) return;
    setLoading(true);
    try {
      // 验证旧手机验证码（这里简化处理，实际需要后端验证）
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPhoneChange = (v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 11);
    setNewPhone(cleaned);
    if (cleaned.length === 11) {
      if (!isValidPhone(cleaned)) {
        setNewPhoneErr('请输入正确的手机号');
      } else if (cleaned === rawPhone) {
        setNewPhoneErr('新手机号不能与当前手机号相同');
      } else {
        setNewPhoneErr('');
      }
    } else {
      setNewPhoneErr('');
    }
  };

  const step2Ok = isValidPhone(newPhone) && code2.length >= 6;

  const handleStep2 = async () => {
    if (!step2Ok || loading) return;
    setLoading(true);
    try {
      await updatePhone({ newPhone, oldPhoneCode: code1, newPhoneCode: code2 });
      onSuccess();
    } catch {
      // 错误由响应拦截器统一处理，此处不再重复提示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">{step === 1 ? '验证当前手机号' : '绑定新手机号'}</span>
          <button onClick={onClose} className="text-xl cursor-pointer p-0" style={{ background: 'none', border: 'none', color: '#8B8FA3' }}>×</button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-3.5">
          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 mb-1">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? '#00D68F' : '#252836',
                    border: `1px solid ${step >= s ? '#00D68F' : '#2A2D3A'}`,
                    color: step >= s ? '#0F1117' : '#8B8FA3',
                  }}
                >
                  {s}
                </div>
                <span className="text-[13px]" style={{ color: step >= s ? '#FFFFFF' : '#8B8FA3' }}>
                  {s === 1 ? '验证当前手机' : '绑定新手机'}
                </span>
                {s === 1 && (
                  <div className="w-8 h-px transition-colors" style={{ background: step > 1 ? '#00D68F' : '#2A2D3A' }} />
                )}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <>
              <div className="rounded-lg px-3.5 py-2.5" style={{ background: '#252836' }}>
                <span className="text-[13px]" style={{ color: '#8B8FA3' }}>验证码将发送至：</span>
                <span className="text-[13px] font-semibold text-white"> {displayPhone}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    icon="✉️"
                    placeholder="请输入验证码"
                    value={code1}
                    onChange={(v) => setCode1(v.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <CaptchaButton key="old-phone" onSend={handleSendOldCode} account={displayPhone} />
              </div>
              <PrimaryBtn
                label={loading ? '验证中...' : '下一步'}
                onClick={handleStep1}
                disabled={code1.length < 4}
                loading={loading}
              />
            </>
          ) : (
            <>
              <InputField
                icon="📱"
                placeholder="请输入新手机号"
                value={newPhone}
                onChange={handleNewPhoneChange}
                error={newPhoneErr}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    icon="✉️"
                    placeholder="请输入验证码"
                    value={code2}
                    onChange={(v) => setCode2(v.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <CaptchaButton key="new-phone" onSend={handleSendNewCode} account={newPhone} disabled={!isValidPhone(newPhone) || newPhone === rawPhone} />
              </div>
              <div className="flex gap-2.5">
                <GhostBtn label="上一步" onClick={() => setStep(1)} />
                <PrimaryBtn
                  label={loading ? '绑定中...' : '确认换绑'}
                  onClick={handleStep2}
                  disabled={!step2Ok}
                  loading={loading}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 换绑邮箱弹窗
 */
function ChangeEmailModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [newEmail, setNewEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (v: string) => {
    setNewEmail(v);
    setEmailErr(v && !isValidEmail(v) ? '请输入正确的邮箱地址' : '');
  };

  const handleSendCode = async (_account: string, ticket: string, randstr: string) => {
    await sendCode({ phoneOrEmail: newEmail, ticket, randstr });
  };

  const formOk = isValidEmail(newEmail) && code.length >= 6;

  const handleSave = async () => {
    if (!formOk || loading) return;
    setLoading(true);
    try {
      await updateEmail({ email: newEmail, verifyCode: code });
      onSuccess();
    } catch (error: any) {
      // 拦截器已处理的错误不重复提示
      if (!error._handled) {
        toast.error(error?.response?.data?.message || '换绑失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">换绑邮箱</span>
          <button onClick={onClose} className="text-xl cursor-pointer p-0" style={{ background: 'none', border: 'none', color: '#8B8FA3' }}>×</button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-3.5">
          <InputField icon="📧" placeholder="请输入新邮箱" value={newEmail} onChange={handleEmailChange} error={emailErr} />
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField icon="✉️" placeholder="请输入验证码" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <CaptchaButton onSend={handleSendCode} account={newEmail} disabled={!isValidEmail(newEmail)} />
          </div>
          <div className="flex gap-2.5">
            <GhostBtn label="取消" onClick={onClose} />
            <PrimaryBtn label={loading ? '换绑中...' : '确认换绑'} onClick={handleSave} disabled={!formOk} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 修改密码弹窗
 */
function ChangePasswordModal({ hasPassword, onClose, onSuccess }: { hasPassword: boolean; onClose: () => void; onSuccess: () => void }) {
  const [oldPw, setOldPw] = useState('');
  const [oldErr, setOldErr] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newErr, setNewErr] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = calcPasswordStrength(newPw);

  const handleNewPw = (v: string) => {
    if (v.length > 20) return;
    setNewPw(v);
    const result = calcPasswordStrength(v);
    setNewErr(v.length > 0 && result.error ? result.error : '');
    if (confirmPw && v !== confirmPw) setConfirmErr('两次密码不一致');
    else setConfirmErr('');
  };

  const handleConfirm = (v: string) => {
    setConfirmPw(v);
    setConfirmErr(v && v !== newPw ? '两次密码不一致' : '');
  };

  // 已设置密码需要输入旧密码，未设置密码不需要
  const formOk = (!hasPassword || oldPw.length > 0) && newPw.length >= 8 && !strength.error && confirmPw === newPw && !oldErr && !newErr && !confirmErr;

  const handleSave = async () => {
    if (!formOk || loading) return;
    setLoading(true);
    try {
      await changePassword({ oldPassword: oldPw, newPassword: newPw });
      onSuccess();
    } catch {
      // 错误由响应拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">{hasPassword ? '修改密码' : '设置密码'}</span>
          <button onClick={onClose} className="text-xl cursor-pointer p-0" style={{ background: 'none', border: 'none', color: '#8B8FA3' }}>×</button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-3.5">
          {hasPassword && (
            <InputField
              icon="🔒"
              placeholder="当前密码"
              value={oldPw}
              type={showOld ? 'text' : 'password'}
              onChange={(v) => { setOldPw(v); setOldErr(''); }}
              error={oldErr}
              rightSlot={<EyeBtn show={showOld} toggle={() => setShowOld((s) => !s)} />}
            />
          )}
          <div>
            <InputField
              icon="🔒"
              placeholder="新密码（8-20位）"
              value={newPw}
              type={showNew ? 'text' : 'password'}
              onChange={handleNewPw}
              error={newErr}
              rightSlot={<EyeBtn show={showNew} toggle={() => setShowNew((s) => !s)} />}
            />
            {newPw.length > 0 && (
              <div className="mt-1.5">
                <div className="flex gap-1 mb-0.5">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className="flex-1 h-[3px] rounded-sm transition-colors"
                      style={{ background: strength.level >= seg ? strength.color : '#2A2D3A' }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <span className="text-[11px]" style={{ color: strength.color }}>
                    密码强度：{strength.label}
                    {strength.error && `（${strength.error}）`}
                  </span>
                )}
              </div>
            )}
          </div>
          <InputField
            icon="🔒"
            placeholder="确认新密码"
            value={confirmPw}
            type={showConfirm ? 'text' : 'password'}
            onChange={handleConfirm}
            error={confirmErr}
            rightSlot={<EyeBtn show={showConfirm} toggle={() => setShowConfirm((s) => !s)} />}
          />
          <div className="text-xs" style={{ color: '#8B8FA3' }}>
            💡 修改密码后将退出所有设备的登录状态
          </div>
          <div className="flex gap-2.5">
            <GhostBtn label="取消" onClick={onClose} />
            <PrimaryBtn label={loading ? '修改中...' : '确认修改'} onClick={handleSave} disabled={!formOk} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 退出确认弹窗
 */
function LogoutConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 600);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">退出登录</span>
          <button onClick={onClose} className="text-xl cursor-pointer p-0" style={{ background: 'none', border: 'none', color: '#8B8FA3' }}>×</button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="text-center">
            <div className="text-4xl mb-2.5">👋</div>
            <div className="text-[15px] font-semibold text-white mb-1.5">确定要退出登录吗？</div>
            <div className="text-[13px]" style={{ color: '#8B8FA3' }}>退出后需要重新登录才能访问完整功能</div>
          </div>
          <div className="flex gap-2.5">
            <GhostBtn label="取消" onClick={onClose} />
            <button
              onClick={handle}
              disabled={loading}
              className="flex-1 h-11 rounded-lg text-sm font-bold cursor-pointer transition-all"
              style={{
                background: 'none',
                border: '1px solid #FF4D6A',
                color: '#FF4D6A',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255,77,106,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              {loading ? '退出中...' : '确认退出'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 通用输入框
function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled,
  rightSlot,
  error,
}: {
  icon?: string;
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
        className="flex items-center h-11 rounded-lg transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${error ? '#FF4D6A' : focused ? '#00D68F' : '#2A2D3A'}`,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {icon && <span className="px-2.5 text-[15px] flex-shrink-0">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-white"
          style={{ caretColor: '#00D68F', padding: icon ? '0' : '0 12px' }}
        />
        {rightSlot && <div className="pr-2.5 flex-shrink-0">{rightSlot}</div>}
      </div>
      {error && <div className="text-xs mt-1" style={{ color: '#FF4D6A' }}>{error}</div>}
    </div>
  );
}

// 主按钮
function PrimaryBtn({ label, onClick, disabled, loading }: { label: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
  const active = !disabled && !loading;
  return (
    <button
      onClick={onClick}
      disabled={!active}
      className="flex-1 h-11 rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
      style={{
        background: active ? '#00D68F' : '#1A3D2E',
        color: active ? '#0F1117' : '#4A7A62',
        border: 'none',
      }}
    >
      {loading && (
        <span
          className="w-[15px] h-[15px] rounded-full animate-spin inline-block"
          style={{ border: '2px solid rgba(15,17,23,0.3)', borderTopColor: '#0F1117' }}
        />
      )}
      {label}
    </button>
  );
}

// 幽灵按钮
function GhostBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 h-11 rounded-lg text-sm cursor-pointer transition-all"
      style={{ background: 'none', border: '1px solid #2A2D3A', color: '#8B8FA3' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A3D4A'; e.currentTarget.style.color = '#FFFFFF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3A'; e.currentTarget.style.color = '#8B8FA3'; }}
    >
      {label}
    </button>
  );
}

// 密码显示/隐藏按钮
function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="cursor-pointer p-0 text-[15px]"
      style={{ background: 'none', border: 'none', color: '#8B8FA3' }}
    >
      {show ? '🙈' : '👁'}
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userInfo, rawUserInfo, setUserInfo, logout, setVoluntaryLogout, refreshUserInfo } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 页面加载时刷新用户信息
  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  // Modal状态
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // 头像
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // 昵称
  const [nickname, setNickname] = useState(userInfo?.nickname || '');

  // 头像点击
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 头像文件选择
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImageType(file)) {
      toast.error('只支持 JPG/PNG/WebP 格式');
      return;
    }
    if (!isValidFileSize(file)) {
      toast.error('文件大小不能超过 1MB');
      return;
    }
    // 读取文件并显示裁剪弹窗
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropSrc(ev.target?.result as string);
      setActiveModal('avatar');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 头像裁剪确认
  const handleAvatarConfirm = async () => {
    if (!cropSrc) return;
    setActiveModal(null);
    setAvatarUploading(true);
    try {
      // 将 base64 转为 File 对象
      const res = await fetch(cropSrc);
      const blob = await res.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await uploadAvatar(file);
      // 刷新用户信息（头像URL会更新）
      await refreshUserInfo();
      toast.success('头像更新成功');
    } catch (error: any) {
      // 拦截器已处理的错误不重复提示
      if (!error._handled) {
        toast.error(error?.response?.data?.message || '头像上传失败');
      }
    } finally {
      setAvatarUploading(false);
      setCropSrc(null);
    }
  };

  // 昵称保存
  const handleNicknameSave = (n: string) => {
    setNickname(n);
    setUserInfo({ nickname: n });
    setActiveModal(null);
    toast.success('昵称更新成功');
  };

  // 手机换绑成功
  const handlePhoneSuccess = () => {
    setActiveModal(null);
    refreshUserInfo();
    toast.success('手机号更换成功');
  };

  // 邮箱换绑成功
  const handleEmailSuccess = () => {
    setActiveModal(null);
    refreshUserInfo();
    toast.success('邮箱换绑成功');
  };

  // 密码修改成功
  const handlePasswordSuccess = useCallback(async () => {
    setActiveModal(null);
    toast.success('密码修改成功，请重新登录');
    setTimeout(async () => {
      try {
        await logoutApi();
      } catch {
        // 忽略错误
      }
      logout();
    }, 2200);
  }, [logout]);

  // 退出登录确认
  const handleLogoutConfirm = useCallback(async () => {
    setActiveModal(null);
    try {
      await logoutApi();
    } catch {
      // 忽略错误
    }
    setVoluntaryLogout(true);
    logout();
  }, [logout, setVoluntaryLogout]);

  // 格式化注册时间
  const formatRegisterTime = () => {
    if (!userInfo?.createdAt) return '-';
    try {
      return format(parseISO(userInfo.createdAt), 'yyyy-MM-dd');
    } catch {
      return userInfo.createdAt;
    }
  };

  // 显示的手机号（脱敏）
  const displayPhone = userInfo?.phone
    ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    : '未绑定';

  // 显示的邮箱（脱敏）
  const displayEmail = userInfo?.email
    ? userInfo.email.replace(/(.{2}).+(@.+)/, '$1***$2')
    : '未绑定';

  return (
    <PageLayout>
      <h1 className="text-2xl md:text-[28px] font-bold text-white mb-4 md:mb-6 mt-4 md:mt-6">个人中心</h1>

      <div className="max-w-[700px] mx-auto space-y-3 md:space-y-[14px]">
        {/* 头像卡片 */}
        <div
          className="rounded-xl p-5 md:p-8 flex flex-col items-center"
          style={{ background: '#1A1D28', border: '1px solid #2A2D3A' }}
        >
          {/* 头像 */}
          <div className="relative mb-2">
            <div
              onClick={handleAvatarClick}
              className="w-32 h-32 rounded-full overflow-hidden cursor-pointer relative group"
              style={{ border: '3px solid #2A2D3A', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00D68F')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2A2D3A')}
            >
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3A3D52 0%, #252836 100%)' }}
                >
                  <span className="text-5xl font-bold text-white">{(nickname || '用户').charAt(0)}</span>
                </div>
              )}
              {/* Hover遮罩 */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <Camera size={24} color="#FFFFFF" />
                <span className="text-[11px] text-white mt-1">更换头像</span>
              </div>
            </div>
            {/* 相机角标 */}
            <button
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#00D68F', border: '2px solid #1A1D28', boxShadow: '0 2px 8px rgba(0,214,143,0.4)' }}
            >
              <Camera size={14} color="#0F1117" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <p className="text-sm font-medium mt-1" style={{ color: '#00D68F' }}>点击更换头像</p>
          <p className="text-xs" style={{ color: '#8B8FA3' }}>支持 jpg / png / webp，不超过 1MB</p>
          <p className="text-xl font-bold text-white mt-1">{nickname || '用户'}</p>
        </div>

        {/* 信息列表 */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#1A1D28', border: '1px solid #2A2D3A' }}>
          <InfoRow
            icon="👤"
            label="昵称"
            value={nickname || '-'}
            actionLabel="修改"
            onAction={() => setActiveModal('nickname')}
          />
          <InfoRow
            icon="📱"
            label="手机号"
            value={displayPhone}
            actionLabel="换绑"
            onAction={() => setActiveModal('phone')}
          />
          <InfoRow
            icon="📧"
            label="邮箱"
            value={displayEmail}
            actionLabel="换绑"
            onAction={() => setActiveModal('email')}
          />
          <InfoRow
            icon="🔒"
            label="密码"
            value={
              userInfo?.hasPassword ? (
                <span
                  className="inline-flex items-center text-xs font-semibold py-0.5 px-2 rounded"
                  style={{
                    background: 'rgba(0,214,143,0.1)',
                    border: '1px solid rgba(0,214,143,0.3)',
                    color: '#00D68F',
                  }}
                >
                  已设置
                </span>
              ) : (
                <span
                  className="inline-flex items-center text-xs font-semibold py-0.5 px-2 rounded"
                  style={{
                    background: 'rgba(255,77,106,0.1)',
                    border: '1px solid rgba(255,77,106,0.3)',
                    color: '#FF4D6A',
                  }}
                >
                  未设置
                </span>
              )
            }
            actionLabel={userInfo?.hasPassword ? '修改' : '设置'}
            onAction={() => setActiveModal('password')}
          />
          <InfoRow
            icon="📅"
            label="注册时间"
            value={formatRegisterTime()}
            isLast
          />
        </div>

        {/* 退出登录按钮 - 居中 */}
        <div className="flex justify-center pb-8 md:pb-10">
          <button
            onClick={() => setActiveModal('logout')}
            className="w-full max-w-[200px] h-11 rounded-lg text-sm font-bold cursor-pointer transition-all"
            style={{ background: 'none', border: '1px solid #FF4D6A', color: '#FF4D6A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,77,106,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            退出登录
          </button>
        </div>
      </div>

      {/* Modal */}
      {activeModal === 'nickname' && (
        <EditNicknameModal
          current={nickname}
          onClose={() => setActiveModal(null)}
          onSave={handleNicknameSave}
        />
      )}
      {activeModal === 'phone' && (
        <ChangePhoneModal
          displayPhone={displayPhone}
          rawPhone={rawUserInfo?.phone || ''}
          onClose={() => setActiveModal(null)}
          onSuccess={handlePhoneSuccess}
        />
      )}
      {activeModal === 'email' && (
        <ChangeEmailModal
          onClose={() => setActiveModal(null)}
          onSuccess={handleEmailSuccess}
        />
      )}
      {activeModal === 'password' && (
        <ChangePasswordModal
          hasPassword={userInfo?.hasPassword || false}
          onClose={() => setActiveModal(null)}
          onSuccess={handlePasswordSuccess}
        />
      )}
      {activeModal === 'logout' && (
        <LogoutConfirmModal
          onClose={() => setActiveModal(null)}
          onConfirm={handleLogoutConfirm}
        />
      )}
      {activeModal === 'avatar' && cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          onClose={() => { setActiveModal(null); setCropSrc(null); }}
          onConfirm={handleAvatarConfirm}
        />
      )}

      {/* 动画 */}
      <style>{`
        @keyframes pr-fadein { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        input::placeholder { color: #5A5D70; }
      `}</style>
    </PageLayout>
  );
}
