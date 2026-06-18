/**
 * 错误状态组件
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = '加载失败',
  description = '请检查网络连接后重试',
  onRetry,
  className,
}: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;

    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      {/* 断网插图 */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-50"
      >
        {/* WiFi 信号 */}
        <path
          d="M50 30C35 30 22 37 14 48L18 52C25 43 37 37 50 37C63 37 75 43 82 52L86 48C78 37 65 30 50 30Z"
          fill="#FF4D6A"
          opacity="0.3"
        />
        <path
          d="M50 45C40 45 31 50 26 57L30 61C34 55 42 52 50 52C58 52 66 55 70 61L74 57C69 50 60 45 50 45Z"
          fill="#FF4D6A"
          opacity="0.5"
        />
        <path
          d="M50 60C45 60 41 62 38 66L42 70C44 67 47 66 50 66C53 66 56 67 58 70L62 66C59 62 55 60 50 60Z"
          fill="#FF4D6A"
          opacity="0.7"
        />
        <circle cx="50" cy="75" r="4" fill="#FF4D6A" />
        {/* 斜线 */}
        <line x1="20" y1="80" x2="80" y2="20" stroke="#FF4D6A" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* 标题 */}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>

      {/* 描述 */}
      <p className="text-sm text-muted-foreground text-center mb-6">{description}</p>

      {/* 重试按钮 */}
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className={cn(
            'px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors',
            retrying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
          )}
        >
          {retrying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              重试中...
            </span>
          ) : (
            '重试'
          )}
        </button>
      )}
    </div>
  );
}
