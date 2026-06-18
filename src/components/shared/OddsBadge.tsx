/**
 * 赔率结果标签组件
 * 用于显示胜/平/负结果
 */

import { cn } from '@/lib/utils';
import { getResultBgClass, getWinFlagText } from '@/utils/odds';

interface OddsBadgeProps {
  result: 'H' | 'D' | 'A' | string;
  className?: string;
  // 是否显示文字，默认 true
  showText?: boolean;
}

export function OddsBadge({ result, className, showText = true }: OddsBadgeProps) {
  const bgClass = getResultBgClass(result);
  const text = showText ? getWinFlagText(result) : '';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        bgClass,
        className
      )}
    >
      {text}
    </span>
  );
}
