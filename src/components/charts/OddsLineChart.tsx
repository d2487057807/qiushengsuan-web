/**
 * 赔率走势图组件
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { CHART_THEME } from './ChartTheme';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2 } from 'lucide-react';

interface SeriesConfig {
  key: string;
  name: string;
  color: string;
}

interface OddsLineChartProps {
  data: Record<string, any>[];
  series: SeriesConfig[];
  className?: string;
  height?: number;
  // 全屏时额外显示的内容（如比分选择标签）
  fullscreenExtra?: React.ReactNode;
}

export function OddsLineChart({
  data,
  series,
  className,
  height = 300,
  fullscreenExtra,
}: OddsLineChartProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  // 切换系列显示
  const toggleSeries = (key: string) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(key)) {
      newHidden.delete(key);
    } else {
      newHidden.add(key);
    }
    setHiddenSeries(newHidden);
  };

  // 格式化时间轴标签
  const formatXAxis = (value: string) => {
    try {
      return format(parseISO(value), 'MM/dd HH:mm');
    } catch {
      return value;
    }
  };

  // 自定义提示框
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-lg p-3 shadow-lg border"
        style={{ backgroundColor: CHART_THEME.tooltip.background, borderColor: CHART_THEME.tooltip.border }}
      >
        <p className="text-xs text-muted-foreground mb-2">{formatXAxis(label)}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white">{entry.name}:</span>
            <span style={{ color: entry.color }} className="font-mono font-medium">{entry.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  // 图例
  const legendContent = (
    <div className="flex items-center gap-4">
      {series.map((s) => (
        <button
          key={s.key}
          onClick={() => toggleSeries(s.key)}
          className={cn(
            'flex items-center gap-2 text-sm transition-opacity',
            hiddenSeries.has(s.key) && 'opacity-40'
          )}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
          <span className="text-white">{s.name}</span>
        </button>
      ))}
    </div>
  );

  // 图表
  const chartGraph = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray={CHART_THEME.grid.strokeDasharray} stroke={CHART_THEME.grid.stroke} vertical={false} />
        <XAxis dataKey="publishTime" tickFormatter={formatXAxis} stroke={CHART_THEME.axis.stroke} tick={{ fill: CHART_THEME.axis.tickFill, fontSize: 12 }} tickLine={false} />
        <YAxis stroke={CHART_THEME.axis.stroke} tick={{ fill: CHART_THEME.axis.tickFill, fontSize: 12 }} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(2)} />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: s.color }} hide={hiddenSeries.has(s.key)} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const chartContent = (
    <div className={cn('relative', className)}>
      {/* 图例 + 全屏按钮 */}
      <div className="flex items-center justify-between mb-4">
        {legendContent}
        {!fullscreen && (
          <button
            onClick={() => setFullscreen(true)}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {chartGraph}
    </div>
  );

  // 全屏模式
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto" style={{ background: '#0F1117', padding: 32 }}>
        <div className="max-w-6xl mx-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">赔率走势（全屏）</h3>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ background: '#252836', border: '1px solid #2A2D3A', color: '#FFFFFF' }}
            >
              <Minimize2 size={14} /> 退出全屏
            </button>
          </div>

          {/* 额外内容（如比分标签） */}
          {fullscreenExtra && <div className="mb-4">{fullscreenExtra}</div>}

          {/* 图例 */}
          <div className="mb-4">{legendContent}</div>

          {/* 图表 */}
          <div style={{ background: '#252836', borderRadius: 12, padding: 20 }}>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray={CHART_THEME.grid.strokeDasharray} stroke={CHART_THEME.grid.stroke} vertical={false} />
                <XAxis dataKey="publishTime" tickFormatter={formatXAxis} stroke={CHART_THEME.axis.stroke} tick={{ fill: CHART_THEME.axis.tickFill, fontSize: 12 }} tickLine={false} />
                <YAxis stroke={CHART_THEME.axis.stroke} tick={{ fill: CHART_THEME.axis.tickFill, fontSize: 12 }} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip content={<CustomTooltip />} />
                {series.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: s.color }} hide={hiddenSeries.has(s.key)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return chartContent;
}
