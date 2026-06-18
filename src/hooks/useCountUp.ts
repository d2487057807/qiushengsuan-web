/**
 * 数字递增动画 Hook
 * 用于相似度百分比等数字的动画效果
 */

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  target: number; // 目标数值
  duration?: number; // 动画时长（ms），默认 500
  decimals?: number; // 小数位数，默认 1
  shouldStart?: boolean; // 是否开始动画，默认 true
}

export function useCountUp(options: UseCountUpOptions): number {
  const { target, duration = 500, decimals = 1, shouldStart = true } = options;

  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) {
      setValue(0);
      return;
    }

    // 动画函数
    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutCubic 缓动
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // 开始动画
    startRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    // 清理
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, decimals, shouldStart]);

  return value;
}
