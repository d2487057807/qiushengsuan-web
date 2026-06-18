/**
 * 密码强度指示器组件
 */

import { usePasswordStrength } from '@/hooks/usePasswordStrength';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, label, color } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* 强度条 */}
      <div className="flex-1 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= strength ? color : '#2A2D3A',
            }}
          />
        ))}
      </div>

      {/* 强度文字 */}
      <span
        className="text-xs font-medium w-6"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
