/**
 * 日期分组组件
 * 可折叠的日期区块
 */

import { useState } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DateGroupProps {
  businessDate: string;
  matchCount: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

// 星期映射
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function DateGroup({
  businessDate,
  matchCount,
  children,
  defaultExpanded = true,
}: DateGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // 格式化日期
  const formatDate = () => {
    try {
      const date = parseISO(businessDate);
      const weekday = WEEKDAYS[getDay(date)];
      const formatted = format(date, 'MM月dd日', { locale: zhCN });

      // 判断是否是今天/明天
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.getTime() === today.getTime()) {
        return { date: formatted, label: '今天' };
      } else if (date.getTime() === tomorrow.getTime()) {
        return { date: formatted, label: '明天' };
      }
      return { date: formatted, label: weekday };
    } catch {
      return { date: businessDate, label: '' };
    }
  };

  const { date, label } = formatDate();

  return (
    <div className="mb-4">
      {/* 日期标题 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-t-lg hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{date}</span>
          <span className="text-sm text-primary">{label}</span>
          <span className="text-sm text-muted-foreground">
            {matchCount}场赛事
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* 赛事列表 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4 bg-card/50 border-x border-b border-border rounded-b-lg">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
