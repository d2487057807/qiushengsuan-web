/**
 * 表单验证规则
 */

// 手机号正则（中国大陆）
const PHONE_REGEX = /^1[3-9]\d{9}$/;

// 邮箱正则
const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;

/**
 * 验证账号（手机号或邮箱）
 */
export function isValidAccount(account: string): boolean {
  if (!account) return false;
  return PHONE_REGEX.test(account) || EMAIL_REGEX.test(account);
}

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * 判断账号类型
 */
export function getAccountType(account: string): 'phone' | 'email' | 'unknown' {
  if (PHONE_REGEX.test(account)) return 'phone';
  if (EMAIL_REGEX.test(account)) return 'email';
  return 'unknown';
}

/**
 * 验证验证码（6位数字）
 */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * 验证昵称（2-20字符）
 */
export function isValidNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20;
}

/**
 * 验证密码强度（与后端 PasswordValidator 保持一致）
 * 规则：
 * - 长度 8-20 位
 * - 至少包含大写字母、小写字母、数字中的两类
 * - 不允许连续 3 位相同字符
 * @returns 0-弱, 1-中, 2-强
 */
export function getPasswordStrength(password: string): number {
  if (!password || password.length < 8 || password.length > 20) return 0;

  // 检查连续 3 位相同字符
  for (let i = 0; i <= password.length - 3; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return 0; // 弱
    }
  }

  // 统计字符类型
  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/\d/.test(password)) types++;

  // 至少需要两种字符类型
  if (types < 2) return 0; // 弱

  // 三种字符类型 + 长度 >= 12 → 强
  if (types >= 3 && password.length >= 12) return 2; // 强

  return 1; // 中
}

/**
 * 校验密码是否符合要求
 * @returns 错误信息，符合要求返回空字符串
 */
export function validatePassword(password: string): string {
  if (!password || password.length < 8 || password.length > 20) {
    return '密码长度需8-20位';
  }

  // 检查连续 3 位相同字符
  for (let i = 0; i <= password.length - 3; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return '不允许连续3位相同字符';
    }
  }

  // 统计字符类型
  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/\d/.test(password)) types++;

  // 至少需要两种字符类型
  if (types < 2) {
    return '需包含大写、小写字母、数字中的至少两类';
  }

  return '';
}

/**
 * 获取密码强度标签
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
      return '弱';
    case 1:
      return '中';
    case 2:
      return '强';
    default:
      return '';
  }
}

/**
 * 获取密码强度详情（包含错误提示）
 */
export function getPasswordStrengthDetail(password: string): { level: number; label: string; color: string; error?: string } {
  if (!password) return { level: 0, label: '', color: '#4B5563' };

  const level = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(level);
  const colors = ['#FF4D6A', '#F59E0B', '#00D68F'];
  const color = colors[level] || '#4B5563';

  // 获取具体错误信息
  let error: string | undefined;
  if (password.length < 8 || password.length > 20) {
    error = '密码长度需8-20位';
  } else {
    // 检查连续 3 位相同字符
    for (let i = 0; i <= password.length - 3; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        error = '不允许连续3位相同字符';
        break;
      }
    }
    if (!error) {
      // 统计字符类型
      let types = 0;
      if (/[a-z]/.test(password)) types++;
      if (/[A-Z]/.test(password)) types++;
      if (/\d/.test(password)) types++;
      if (types < 2) {
        error = '需包含大写、小写字母、数字中的至少两类';
      }
    }
  }

  return { level, label, color, error };
}

/**
 * 获取密码强度颜色
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return '#EF4444'; // 红色
    case 1:
      return '#F59E0B'; // 黄色
    case 2:
      return '#10B981'; // 绿色
    default:
      return '#4B5563'; // 灰色
  }
}

/**
 * 验证文件大小（最大 1MB）
 */
export function isValidFileSize(file: File, maxSizeMB: number = 1): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * 验证文件类型（图片）
 */
export function isValidImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}
