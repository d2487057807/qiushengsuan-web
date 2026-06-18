/**
 * 密码强度检测 Hook
 */

import { useMemo } from 'react';
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/validators';

interface UsePasswordStrengthReturn {
  strength: number; // 0=弱, 1=中, 2=强
  label: string; // '弱' | '中' | '强'
  color: string; // 颜色值
  width: string; // 进度条宽度百分比
}

export function usePasswordStrength(password: string): UsePasswordStrengthReturn {
  return useMemo(() => {
    const strength = getPasswordStrength(password);
    const label = getPasswordStrengthLabel(strength);
    const color = getPasswordStrengthColor(strength);

    // 计算进度条宽度
    const width = password.length === 0 ? '0%' : strength === 0 ? '33%' : strength === 1 ? '66%' : '100%';

    return {
      strength,
      label,
      color,
      width,
    };
  }, [password]);
}
