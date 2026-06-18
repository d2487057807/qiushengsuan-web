/**
 * 赔率校准统计
 * 固定区域展示，超出部分可滚动
 */

import { CalibrationRow } from '@/types/match';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CalibrationTableProps {
  data: CalibrationRow[];
  loading?: boolean;
  className?: string;
}

// 行颜色
function getOutcomeColor(outcome: string): string {
  if (outcome.includes('胜') && !outcome.includes('客')) return '#00D68F';
  if (outcome.includes('平')) return '#3B82F6';
  if (outcome.includes('客')) return '#FF4D6A';
  return '#8B8FA3';
}

export function CalibrationTable({ data, loading, className }: CalibrationTableProps) {
  if (loading) {
    return (
      <div className={cn('bg-[#1A1D28] rounded-xl overflow-hidden', className)} style={{ minHeight: 200 }}>
        <div className="px-5 py-3.5">
          <h3 className="text-xl font-bold text-white">赔率校准统计</h3>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        暂无校准数据
      </div>
    );
  }

  // 固定区域高度，超出滚动
  const maxVisible = 5;
  const needScroll = data.length > maxVisible;
  const containerHeight = needScroll ? maxVisible * 72 : 'auto';

  return (
    <div className={cn('bg-[#1A1D28] rounded-xl overflow-hidden', className)}>
      <div className="px-5 py-3.5">
        <h3 className="text-xl font-bold text-white">赔率校准统计</h3>
      </div>

      <div
        className={cn('px-5 pb-5', needScroll && 'hide-scrollbar')}
        style={needScroll ? { maxHeight: containerHeight, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
      >
        <div className="flex flex-col gap-4">
          {data.map((row) => {
            const color = getOutcomeColor(row.outcome);
            const impliedPct = (row.impliedProb * 100).toFixed(1);
            const actualPct = (row.actualProb * 100).toFixed(1);
            const deviationPct = (row.deviation * 100).toFixed(1);
            const deviationNum = row.deviation * 100;

            return (
              <div key={row.outcome}>
                {/* 第一行：结果名 + 进度条 + 实际概率 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white w-16 truncate">{row.outcome}</span>
                  <div className="flex-1 mx-3 h-2 rounded-full overflow-hidden" style={{ background: '#2A2D3A' }}>
                    <div
                      className="h-full rounded-full transition-all duration-800 ease-out"
                      style={{ width: `${Math.min(parseFloat(actualPct), 100)}%`, background: color }}
                    />
                  </div>
                  <span className="text-sm font-bold" style={{ color }}>{actualPct}%</span>
                </div>
                {/* 第二行：数据标签 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                    style={{ background: '#252836', border: '1px solid #2A2D3A', color: '#8B8FA3' }}>
                    隐含 <span className="text-white font-mono">{impliedPct}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                    style={{
                      background: deviationNum > 0 ? 'rgba(0,214,143,0.08)' : deviationNum < 0 ? 'rgba(255,77,106,0.08)' : '#252836',
                      border: `1px solid ${deviationNum > 0 ? 'rgba(0,214,143,0.2)' : deviationNum < 0 ? 'rgba(255,77,106,0.2)' : '#2A2D3A'}`,
                      color: deviationNum > 0 ? '#00D68F' : deviationNum < 0 ? '#FF4D6A' : '#8B8FA3',
                    }}>
                    偏差 {deviationNum > 0 ? '+' : ''}{deviationPct}%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                    style={{ background: '#252836', border: '1px solid #2A2D3A', color: '#8B8FA3' }}>
                    样本 <span className="text-white font-mono">{row.sampleCount.toLocaleString()}</span> 场
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 说明 */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid #2A2D3A', background: 'rgba(37,40,54,0.5)' }}>
        <p className="text-xs text-[#8B8FA3]">
          * 偏差 = 实际概率 - 隐含概率。正值表示低估（可关注），负值表示高估。
        </p>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
