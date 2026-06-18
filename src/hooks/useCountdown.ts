/**
 * 倒计时 Hook
 * 用于发送验证码的 60 秒倒计时
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseCountdownOptions {
  duration?: number; // 倒计时时长（秒），默认 60
  onComplete?: () => void; // 倒计时结束回调
}

interface UseCountdownReturn {
  countdown: number; // 当前倒计时数值
  isCounting: boolean; // 是否正在倒计时
  start: () => void; // 开始倒计时
  reset: () => void; // 重置倒计时
}

export function useCountdown(options: UseCountdownOptions = {}): UseCountdownReturn {
  const { duration = 60, onComplete } = options;

  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 保持回调引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 开始倒计时
  const start = useCallback(() => {
    clearTimer();
    setCountdown(duration);
    setIsCounting(true);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsCounting(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, clearTimer]);

  // 重置倒计时
  const reset = useCallback(() => {
    clearTimer();
    setCountdown(0);
    setIsCounting(false);
  }, [clearTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    countdown,
    isCounting,
    start,
    reset,
  };
}
