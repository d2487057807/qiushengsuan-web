/**
 * 发送验证码按钮组件
 * 集成腾讯云验证码和倒计时
 */

import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { triggerCaptcha } from '@/utils/captcha';
import { toast } from 'sonner';

interface CaptchaButtonProps {
  // 发送验证码的回调函数，接收账号和验证码参数
  onSend: (account: string, ticket: string, randstr: string) => Promise<void>;
  // 账号（手机号或邮箱）
  account: string;
  // 是否禁用
  disabled?: boolean;
  // 按钮文字
  text?: string;
  className?: string;
}

export function CaptchaButton({
  onSend,
  account,
  disabled = false,
  text = '发送验证码',
  className,
}: CaptchaButtonProps) {
  const { countdown, isCounting, start } = useCountdown({ duration: 60 });

  // 点击发送验证码
  const handleClick = async () => {
    if (isCounting || disabled) return;

    // 验证账号
    if (!account) {
      toast.error('请输入手机号或邮箱');
      return;
    }

    try {
      // 触发腾讯云验证码
      const { ticket, randstr } = await triggerCaptcha();

      // 发送验证码
      await onSend(account, ticket, randstr);

      // 开始倒计时
      start();

      toast.success('验证码已发送');
    } catch (error) {
      // 错误已在 request.ts 中处理
      console.error('发送验证码失败:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isCounting}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
        isCounting
          ? 'bg-secondary text-muted-foreground cursor-not-allowed'
          : disabled
          ? 'bg-secondary text-muted-foreground cursor-not-allowed'
          : 'bg-primary/10 text-primary hover:bg-primary/20',
        className
      )}
    >
      {isCounting ? `${countdown}s` : text}
    </button>
  );
}
