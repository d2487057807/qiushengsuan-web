/**
 * 历史赛事查询页
 * 按设计稿实现：两行筛选栏、联赛单选、主队/客队搜索、结果筛选、
 * div表格（交替行色+hover绿色左边框）、完整分页、筛选标签、导出警告弹窗
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { LeagueTag } from '@/components/shared/LeagueTag';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { queryHistory, getLeagues, exportHistory } from '@/api/match';
import { downloadBlob } from '@/utils/export';
import { HistoryMatch, HistoryQueryParams, League } from '@/types/match';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Search,
  RotateCcw,
  Download,
  Loader2,
  X,
  Calendar,
  ChevronDown,
} from 'lucide-react';

/**
 * 计算让球结果
 * 返回 { text: "让胜"/"让平"/"让负", color: 颜色 }
 */
function getHandicapResult(score: string, goalLine: string): { text: string; color: string } | null {
  if (!score || !goalLine) return null;
  const parts = score.split(':');
  if (parts.length !== 2) return null;
  const home = parseInt(parts[0], 10);
  const away = parseInt(parts[1], 10);
  const gl = parseFloat(goalLine);
  if (isNaN(home) || isNaN(away) || isNaN(gl)) return null;

  // goalLine 为负：主队让球，调整客队得分
  // goalLine 为正：主队受让，调整主队得分
  const adjustedHome = home + (gl > 0 ? gl : 0);
  const adjustedAway = away - (gl < 0 ? gl : 0);

  if (adjustedHome > adjustedAway) return { text: '让胜', color: '#00D68F' };
  if (adjustedHome < adjustedAway) return { text: '让负', color: '#FF4D6A' };
  return { text: '让平', color: '#3B82F6' };
}

/**
 * 半全场结果映射和颜色
 */
const HAFU_MAP: Record<string, string> = {
  HH: '胜/胜', HD: '胜/平', HA: '胜/负',
  DH: '平/胜', DD: '平/平', DA: '平/负',
  AH: '负/胜', AD: '负/平', AA: '负/负',
};

function getHafuColor(hafu: string): string {
  if (!hafu || hafu.length < 2) return '#8B8FA3';
  const ft = hafu[1]; // 全场结果
  if (ft === 'H') return '#00D68F';
  if (ft === 'D') return '#3B82F6';
  if (ft === 'A') return '#FF4D6A';
  return '#8B8FA3';
}

/**
 * 自定义暗色日历选择器
 * 完全替换原生日期选择器，暗色主题风格
 */
function CustomDatePicker({
  value,
  onChange,
  placeholder = '选择日期',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 当前显示的月份（用于日历导航）
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  // 当 value 变化时同步 viewDate
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  // 点击外部关闭
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayText = value || '';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 月份名称
  const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 星期标题
  const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

  // 上一月
  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  // 下一月
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // 上一年
  const prevYear = () => {
    setViewDate(new Date(year - 1, month, 1));
  };

  // 下一年
  const nextYear = () => {
    setViewDate(new Date(year + 1, month, 1));
  };

  // 生成日历格子
  const getCalendarDays = () => {
    const firstDay = new Date(year, month, 1).getDay(); // 本月1日是周几
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 本月天数
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // 上月天数

    const days: { day: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // 上月补位
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthIdx = month - 1;
      const prevYear = prevMonthIdx < 0 ? year - 1 : year;
      const realMonth = prevMonthIdx < 0 ? 11 : prevMonthIdx;
      days.push({
        day: d,
        dateStr: `${prevYear}-${String(realMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 本月
    const today = format(new Date(), 'yyyy-MM-dd');
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
      });
    }

    // 下月补位（凑满6行42格）
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = month + 1;
      const nextYear = nextMonthIdx > 11 ? year + 1 : year;
      const realMonth = nextMonthIdx > 11 ? 0 : nextMonthIdx;
      days.push({
        day: d,
        dateStr: `${nextYear}-${String(realMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  // 选择日期
  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* 触发按钮 */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="h-[38px] flex items-center gap-2 px-3 rounded-lg cursor-pointer transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${open ? '#00D68F' : '#2A2D3A'}`,
          minWidth: 140,
        }}
      >
        <Calendar size={14} color="#8B8FA3" className="flex-shrink-0" />
        <span className={`text-[13px] ${displayText ? 'text-white' : 'text-[#5A5D70]'}`}>
          {displayText || placeholder}
        </span>
      </div>

      {/* 日历面板 */}
      {open && (
        <div
          className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden z-[100]"
          style={{
            background: '#1E2130',
            border: '1px solid #2A2D3A',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            width: 280,
          }}
        >
          {/* 年月导航 */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={prevYear}
                className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#8B8FA3] hover:text-white hover:bg-white/5 transition-all"
                style={{ background: 'none', border: 'none' }}
              >
                «
              </button>
              <button
                onClick={prevMonth}
                className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#8B8FA3] hover:text-white hover:bg-white/5 transition-all"
                style={{ background: 'none', border: 'none' }}
              >
                ‹
              </button>
            </div>
            <span className="text-sm font-semibold text-white">
              {year}年{MONTH_NAMES[month]}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={nextMonth}
                className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#8B8FA3] hover:text-white hover:bg-white/5 transition-all"
                style={{ background: 'none', border: 'none' }}
              >
                ›
              </button>
              <button
                onClick={nextYear}
                className="w-6 h-6 rounded flex items-center justify-center cursor-pointer text-[#8B8FA3] hover:text-white hover:bg-white/5 transition-all"
                style={{ background: 'none', border: 'none' }}
              >
                »
              </button>
            </div>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 px-3">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="h-7 flex items-center justify-center text-[11px] font-medium"
                style={{ color: '#5A5D70' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 px-2.5 pb-2.5">
            {calendarDays.map(({ day, dateStr, isCurrentMonth, isToday }) => {
              const isSelected = dateStr === value;
              return (
                <div
                  key={dateStr}
                  onClick={() => handleSelect(dateStr)}
                  className="h-8 flex items-center justify-center rounded-md cursor-pointer text-[13px] transition-all"
                  style={{
                    color: isSelected
                      ? '#0F1117'
                      : isToday
                      ? '#00D68F'
                      : isCurrentMonth
                      ? '#FFFFFF'
                      : '#3A3D4A',
                    background: isSelected ? '#00D68F' : 'transparent',
                    fontWeight: isSelected || isToday ? 700 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* 底部：清除 + 今天 */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderTop: '1px solid #2A2D3A' }}
          >
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-[12px] cursor-pointer transition-colors"
              style={{ background: 'none', border: 'none', color: '#8B8FA3' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4D6A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
            >
              清除
            </button>
            <button
              onClick={() => handleSelect(format(new Date(), 'yyyy-MM-dd'))}
              className="text-[12px] cursor-pointer transition-colors"
              style={{ background: 'none', border: 'none', color: '#00D68F' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#00D68F')}
            >
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 自定义联赛下拉框
 * 简洁风格：无搜索框，无复选框，选中项高亮
 */
function LeagueDropdown({
  value,
  onChange,
  leagues,
}: {
  value: string;
  onChange: (v: string) => void;
  leagues: League[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayText = value || '全部联赛';

  return (
    <div ref={ref} className="relative" style={{ width: 160 }}>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-[38px] w-full flex items-center justify-between gap-2 px-3 rounded-lg cursor-pointer transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${open ? '#00D68F' : '#2A2D3A'}`,
        }}
      >
        <span className={`text-[13px] truncate ${value ? 'text-white' : 'text-[#5A5D70]'}`}>
          {displayText}
        </span>
        <ChevronDown
          size={14}
          color="#8B8FA3"
          className="flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {/* 下拉面板 */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-xl overflow-hidden z-[100]"
          style={{
            background: '#1E2130',
            border: '1px solid #2A2D3A',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* 全部联赛 */}
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            className="px-3.5 py-2 cursor-pointer text-[13px] transition-colors"
            style={{
              color: !value ? '#00D68F' : '#8B8FA3',
              fontWeight: !value ? 600 : 400,
              background: !value ? 'rgba(0,214,143,0.08)' : 'transparent',
            }}
            onMouseEnter={(e) => { if (value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { if (value) e.currentTarget.style.background = 'transparent'; }}
          >
            全部联赛
          </div>

          {/* 联赛列表 */}
          <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 200 }}>
          {leagues.map((l) => {
            const selected = value === l.leagueName;
            return (
              <div
                key={l.leagueName}
                onClick={() => { onChange(l.leagueName); setOpen(false); }}
                className="px-3.5 py-2 cursor-pointer text-[13px] transition-colors"
                style={{
                  color: selected ? '#00D68F' : '#FFFFFF',
                  fontWeight: selected ? 600 : 400,
                  background: selected ? 'rgba(0,214,143,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
              >
                {l.leagueName}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 半全场筛选下拉框
 */
function HafuDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayText = value ? (HAFU_MAP[value] || value) : '半全场';
  const options = ['HH', 'HD', 'HA', 'DH', 'DD', 'DA', 'AH', 'AD', 'AA'];

  return (
    <div ref={ref} className="relative" style={{ width: 140 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-[38px] w-full flex items-center justify-between gap-2 px-3 rounded-lg cursor-pointer transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${open ? '#00D68F' : '#2A2D3A'}`,
        }}
      >
        <span className={`text-[13px] truncate ${value ? 'text-white' : 'text-[#5A5D70]'}`}>
          {displayText}
        </span>
        <ChevronDown
          size={14}
          color="#8B8FA3"
          className="flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-xl overflow-hidden z-[100]"
          style={{
            background: '#1E2130',
            border: '1px solid #2A2D3A',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* 全部结果 */}
          <div
            onClick={() => { onChange(''); setOpen(false); }}
            className="px-3.5 py-2 cursor-pointer text-[13px] transition-colors"
            style={{
              color: !value ? '#00D68F' : '#8B8FA3',
              fontWeight: !value ? 600 : 400,
              background: !value ? 'rgba(0,214,143,0.08)' : 'transparent',
            }}
            onMouseEnter={(e) => { if (value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { if (value) e.currentTarget.style.background = 'transparent'; }}
          >
            全部结果
          </div>
          {/* 9种半全场 */}
          <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: 200 }}>
            {options.map((h) => {
              const selected = value === h;
              const ft = h[1]; // 全场结果决定颜色
              const color = ft === 'H' ? '#00D68F' : ft === 'D' ? '#3B82F6' : '#FF4D6A';
              return (
                <div
                  key={h}
                  onClick={() => { onChange(h); setOpen(false); }}
                  className="px-3.5 py-2 cursor-pointer text-[13px] transition-colors flex items-center gap-2"
                  style={{
                    background: selected ? `${color}12` : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span style={{ color: selected ? color : '#FFFFFF', fontWeight: selected ? 600 : 400 }}>
                    {HAFU_MAP[h]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 每页条数下拉框
 */
function PageSizeDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = [20, 50, 100];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-[30px] flex items-center gap-1.5 px-2.5 rounded-md cursor-pointer transition-colors text-[13px]"
        style={{
          background: '#252836',
          border: `1px solid ${open ? '#00D68F' : '#2A2D3A'}`,
          color: '#FFFFFF',
        }}
      >
        {value} 条
        <ChevronDown
          size={12}
          color="#8B8FA3"
          className="flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1 w-full rounded-lg overflow-hidden z-[100]"
          style={{
            background: '#1E2130',
            border: '1px solid #2A2D3A',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {options.map((s) => {
            const selected = s === value;
            return (
              <div
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="px-3 py-2 cursor-pointer text-[13px] transition-colors"
                style={{
                  color: selected ? '#00D68F' : '#FFFFFF',
                  fontWeight: selected ? 600 : 400,
                  background: selected ? 'rgba(0,214,143,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
              >
                {s} 条
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 球队搜索组件（含自动补全）
 */
function TeamSearch({
  placeholder,
  value,
  onChange,
  suggestions,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
}) {
  const [showSugg, setShowSugg] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filtered, setFiltered] = useState<string[]>([]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSugg(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const matches = v.trim().length >= 1
        ? suggestions.filter((t) => t.includes(v.trim())).slice(0, 6)
        : [];
      setFiltered(matches);
      setShowSugg(matches.length > 0);
    }, 400);
  };

  return (
    <div ref={ref} className="relative w-full sm:w-[230px]">
      <div
        className="h-[38px] flex items-center gap-1.5 px-2.5 rounded-lg transition-colors"
        style={{
          background: '#252836',
          border: `1px solid ${focused ? '#00D68F' : '#2A2D3A'}`,
        }}
      >
        <Search size={13} color="#8B8FA3" className="flex-shrink-0" />
        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => { setFocused(true); if (filtered.length > 0) setShowSugg(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-white min-w-0"
          style={{ caretColor: '#00D68F' }}
        />
        {value && (
          <button
            onClick={() => { onChange(''); setFiltered([]); setShowSugg(false); }}
            className="flex-shrink-0 p-0 cursor-pointer"
            style={{ background: 'none', border: 'none', color: '#5A5D70' }}
          >
            <X size={12} />
          </button>
        )}
      </div>
      {showSugg && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-[100]"
          style={{
            background: '#1E2130',
            border: '1px solid #2A2D3A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {filtered.map((t) => (
            <div
              key={t}
              onMouseDown={() => { onChange(t); setShowSugg(false); }}
              className="px-3.5 py-2 cursor-pointer text-[13px] text-white hover:bg-white/[0.06] transition-colors"
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 筛选标签组件
 */
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[20px] text-xs whitespace-nowrap"
      style={{
        background: 'rgba(0,214,143,0.08)',
        border: '1px solid rgba(0,214,143,0.2)',
        color: '#00D68F',
        padding: '3px 10px',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="flex items-center p-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        style={{ background: 'none', border: 'none', color: '#00D68F' }}
      >
        <X size={10} />
      </button>
    </span>
  );
}

/**
 * 导出弹窗（选择导出类型）
 */
function ExportModal({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: (type: 'default' | 'hafu') => void;
}) {
  const [exportType, setExportType] = useState<'default' | 'hafu'>('default');
  const isLarge = count > 5000;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[400px] rounded-2xl overflow-hidden"
        style={{
          background: '#1A1D28',
          border: '1px solid #2A2D3A',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          animation: 'pr-fadein 0.18s ease-out',
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #2A2D3A' }}>
          <span className="text-base font-bold text-white">导出历史赛事</span>
          <button
            onClick={onCancel}
            className="text-xl cursor-pointer p-0 transition-colors"
            style={{ background: 'none', border: 'none', color: '#8B8FA3' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8B8FA3')}
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-5">
          {/* 导出类型选择 */}
          <div className="flex flex-col gap-3 mb-5">
            {/* 默认导出 */}
            <label
              className="flex items-center gap-3 cursor-pointer rounded-lg px-4 py-3 transition-colors"
              style={{
                background: exportType === 'default' ? 'rgba(0,214,143,0.08)' : '#252836',
                border: `1px solid ${exportType === 'default' ? 'rgba(0,214,143,0.3)' : '#2A2D3A'}`,
              }}
            >
              <input
                type="radio"
                name="exportType"
                value="default"
                checked={exportType === 'default'}
                onChange={() => setExportType('default')}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${exportType === 'default' ? '#00D68F' : '#3A3D4A'}`,
                }}
              >
                {exportType === 'default' && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00D68F' }} />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">赛事数据</div>
                <div className="text-xs text-[#8B8FA3] mt-0.5">导出基础赛事信息：比赛时间、联赛、比分、让球等</div>
              </div>
            </label>

            {/* 半全场详情 */}
            <label
              className="flex items-center gap-3 cursor-pointer rounded-lg px-4 py-3 transition-colors"
              style={{
                background: exportType === 'hafu' ? 'rgba(0,214,143,0.08)' : '#252836',
                border: `1px solid ${exportType === 'hafu' ? 'rgba(0,214,143,0.3)' : '#2A2D3A'}`,
              }}
            >
              <input
                type="radio"
                name="exportType"
                value="hafu"
                checked={exportType === 'hafu'}
                onChange={() => setExportType('hafu')}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${exportType === 'hafu' ? '#00D68F' : '#3A3D4A'}`,
                }}
              >
                {exportType === 'hafu' && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00D68F' }} />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">半全场分析</div>
                <div className="text-xs text-[#8B8FA3] mt-0.5">导出半全场分析数据：半全场结果、赔率走势、校准统计等</div>
              </div>
            </label>
          </div>

          {/* 大数据量警告 */}
          {isLarge && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-5"
              style={{ background: 'rgba(255,183,77,0.08)', border: '1px solid rgba(255,183,77,0.2)' }}
            >
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-[#FFB74D]">
                共 <span className="font-semibold text-white">{count.toLocaleString()}</span> 条记录，建议先缩小筛选范围
              </span>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-lg text-sm cursor-pointer transition-all"
              style={{ background: 'none', border: '1px solid #2A2D3A', color: '#8B8FA3' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A3D4A'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3A'; e.currentTarget.style.color = '#8B8FA3'; }}
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(exportType)}
              className="flex-1 h-11 rounded-lg text-sm font-bold cursor-pointer"
              style={{ background: '#00D68F', border: 'none', color: '#0F1117' }}
            >
              确认导出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();

  // 联赛列表
  const [leagues, setLeagues] = useState<League[]>([]);

  // 所有球队名（用于自动补全）
  const [allTeams, setAllTeams] = useState<string[]>([]);

  // 筛选条件
  const [filters, setFilters] = useState<HistoryQueryParams>({
    beginDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // 已应用的筛选（用于标签显示和数据过滤）
  const [appliedFilters, setAppliedFilters] = useState<HistoryQueryParams>({ ...filters });

  // 半全场筛选（接口入参）
  const [hafuFilter, setHafuFilter] = useState<string>('');
  const hafuInitRef = useRef(true);

  // 数据
  const [matches, setMatches] = useState<HistoryMatch[]>([]);
  const [total, setTotal] = useState(0);
  const [, setLoading] = useState(false);
  const [pageState, setPageState] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading');

  // 半全场变化时触发查询（跳过首次渲染）
  useEffect(() => {
    if (hafuInitRef.current) {
      hafuInitRef.current = false;
      return;
    }
    setFilters((f) => ({ ...f, hafuResult: hafuFilter || undefined, pageNum: 1 }));
  }, [hafuFilter]);

  // 导出
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // 快捷日期
  const [quickDate, setQuickDate] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  // 加载联赛列表
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const res = await getLeagues();
        setLeagues(res.data || []);
      } catch (error) {
        console.error('加载联赛列表失败:', error);
      }
    };
    loadLeagues();
  }, []);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    setPageState('loading');
    try {
      const res = await queryHistory(filters);
      const list = res.data?.list || [];
      setMatches(list);
      setTotal(res.data?.total || 0);
      setPageState(list.length === 0 ? 'empty' : 'loaded');
      // 提取球队名用于自动补全
      const teams = new Set<string>();
      list.forEach((m: HistoryMatch) => { teams.add(m.homeTeam); teams.add(m.awayTeam); });
      setAllTeams((prev) => Array.from(new Set([...prev, ...teams])));
    } catch (error) {
      console.error('加载历史赛事失败:', error);
      setPageState('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(total / (filters.pageSize || DEFAULT_PAGE_SIZE)));

  // 更新筛选条件
  const updateFilter = <K extends keyof HistoryQueryParams>(
    key: K,
    value: HistoryQueryParams[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'pageNum' && key !== 'pageSize' ? { pageNum: 1 } : {}),
    }));
    // 联赛、球队筛选立即同步到 appliedFilters，使标签即时显示
    if (key === 'leagueName' || key === 'teamName') {
      setAppliedFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  // 重置筛选
  const handleReset = () => {
    const def: HistoryQueryParams = {
      beginDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      pageNum: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    setFilters(def);
    setAppliedFilters(def);
    setHafuFilter('');
    setQuickDate('30d');
  };

  // 搜索
  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setFilters((prev) => ({ ...prev, pageNum: 1 }));
  };

  // 快捷日期
  const applyQuickDate = (q: '7d' | '30d' | '90d') => {
    const days = q === '7d' ? 7 : q === '30d' ? 30 : 90;
    const begin = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const end = format(new Date(), 'yyyy-MM-dd');
    setFilters((f) => ({ ...f, beginDate: begin, endDate: end, pageNum: 1 }));
    setAppliedFilters((f) => ({ ...f, beginDate: begin, endDate: end }));
    setQuickDate(q);
  };

  // 导出
  const handleExport = () => {
    setShowExportModal(true);
  };

  const doExport = async (type: 'default' | 'hafu') => {
    setShowExportModal(false);
    setExporting(true);
    try {
      const res = await exportHistory({ ...filters, exportType: type });
      const date = format(new Date(), 'yyyyMMdd');
      downloadBlob(res, type === 'hafu' ? `半全场分析_${date}.xlsx` : `历史赛事_${date}.xlsx`);
      toast.success('导出成功');
    } catch (error: any) {
      console.error('导出失败:', error);
      // 拦截器已处理的错误不重复提示
      if (!error._handled) {
        toast.error('导出失败');
      }
    } finally {
      setExporting(false);
    }
  };

  // 点击行跳转详情
  const handleRowClick = (match: HistoryMatch) => {
    navigate(`/detail?matchId=${match.matchId}&source=history`);
  };

  // 构建筛选标签
  const filterTags: { label: string; remove: () => void }[] = [];
  if (appliedFilters.beginDate || appliedFilters.endDate) {
    filterTags.push({
      label: `${appliedFilters.beginDate || '—'} 至 ${appliedFilters.endDate || '—'}`,
      remove: () => {
        setAppliedFilters((f) => ({ ...f, beginDate: undefined, endDate: undefined }));
        setFilters((f) => ({ ...f, beginDate: undefined, endDate: undefined, pageNum: 1 }));
        setQuickDate('custom');
      },
    });
  }
  if (appliedFilters.leagueName) {
    filterTags.push({
      label: appliedFilters.leagueName,
      remove: () => {
        setAppliedFilters((f) => ({ ...f, leagueName: undefined }));
        setFilters((f) => ({ ...f, leagueName: undefined }));
      },
    });
  }
  if (appliedFilters.teamName) {
    filterTags.push({
      label: `球队: ${appliedFilters.teamName}`,
      remove: () => {
        setAppliedFilters((f) => ({ ...f, teamName: undefined }));
        setFilters((f) => ({ ...f, teamName: undefined }));
      },
    });
  }
  if (hafuFilter) {
    filterTags.push({
      label: HAFU_MAP[hafuFilter] || hafuFilter,
      remove: () => setHafuFilter(''),
    });
  }

  // 表格列头（flex比例分配）
  const COL_HEADS = [
    { label: '比赛时间', flex: 1.5 },
    { label: '联赛', flex: 1.3 },
    { label: '主队', flex: 1 },
    { label: '客队', flex: 1 },
    { label: '比分', flex: 0.7 },
    { label: '让球', flex: 1.2 },
    { label: '半全场', flex: 1 },
  ];

  return (
    <PageLayout>
      {/* 导出弹窗 */}
      {showExportModal && (
        <ExportModal
          count={total}
          onCancel={() => setShowExportModal(false)}
          onConfirm={doExport}
        />
      )}

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-4 md:mb-5 mt-3 md:mt-4">
        <div>
          <h1 className="text-xl md:text-[26px] font-bold text-white leading-tight">历史赛事</h1>
          <p className="text-xs md:text-[13px] text-[#5A5D70] mt-0.5 md:mt-1">查询和分析历史比赛数据</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="flex items-center gap-1.5 h-[38px] px-4 rounded-lg text-[13px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: exporting || total === 0 ? '#1A3D2E' : '#00D68F',
            color: exporting || total === 0 ? '#4A7A62' : '#0F1117',
            border: 'none',
          }}
        >
          {exporting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <Download size={13} />
              导出 Excel
            </>
          )}
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="rounded-xl mb-3 bg-[#1A1D28] p-3 md:p-5">
        {/* 移动端布局 */}
        <div className="block md:hidden">
          {/* 日期选择器 */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <CustomDatePicker
                value={filters.beginDate || ''}
                onChange={(v) => { updateFilter('beginDate', v); setQuickDate('custom'); setAppliedFilters((f) => ({ ...f, beginDate: v })); }}
                placeholder="开始日期"
              />
            </div>
            <span className="text-[#3A3D4A] flex items-center">-</span>
            <div className="flex-1">
              <CustomDatePicker
                value={filters.endDate || ''}
                onChange={(v) => { updateFilter('endDate', v); setQuickDate('custom'); setAppliedFilters((f) => ({ ...f, endDate: v })); }}
                placeholder="结束日期"
              />
            </div>
          </div>

          {/* 筛选条件 */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <LeagueDropdown
                  value={filters.leagueName || ''}
                  onChange={(v) => updateFilter('leagueName', v || undefined)}
                  leagues={leagues}
                />
              </div>
              <div className="flex-1">
                <HafuDropdown value={hafuFilter} onChange={setHafuFilter} />
              </div>
            </div>
            <TeamSearch
              placeholder="搜索主队或客队"
              value={filters.teamName || ''}
              onChange={(v) => updateFilter('teamName', v || undefined)}
              suggestions={allTeams}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 h-9 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              style={{ background: 'none', border: '1px solid #2A2D3A', color: '#8B8FA3' }}
            >
              <RotateCcw size={12} /> 重置
            </button>
            <button
              onClick={handleSearch}
              className="flex-[2] h-9 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
              style={{ background: '#00D68F', border: 'none', color: '#0F1117' }}
            >
              <Search size={13} /> 搜索
            </button>
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden md:block">
          {/* 第一行：日期 */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-xs text-[#5A5D70] flex-shrink-0">日期</span>
            {/* 快捷按钮 */}
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map((q) => {
                const lbl = q === '7d' ? '近 7 天' : q === '30d' ? '近 30 天' : '近 90 天';
                const active = quickDate === q;
                return (
                  <button
                    key={q}
                    onClick={() => applyQuickDate(q)}
                    className="h-7 px-2.5 rounded-md text-xs cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${active ? '#00D68F' : '#2A2D3A'}`,
                      background: active ? 'rgba(0,214,143,0.1)' : 'transparent',
                      color: active ? '#00D68F' : '#8B8FA3',
                    }}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
            {/* 分隔线 */}
            <div className="w-px h-5" style={{ background: '#2A2D3A' }} />
            {/* 日期输入 */}
            <div className="flex items-center gap-1.5">
              <CustomDatePicker
                value={filters.beginDate || ''}
                onChange={(v) => { updateFilter('beginDate', v); setQuickDate('custom'); setAppliedFilters((f) => ({ ...f, beginDate: v })); }}
                placeholder="开始日期"
              />
              <span className="text-[13px]" style={{ color: '#3A3D4A' }}>—</span>
              <CustomDatePicker
                value={filters.endDate || ''}
                onChange={(v) => { updateFilter('endDate', v); setQuickDate('custom'); setAppliedFilters((f) => ({ ...f, endDate: v })); }}
                placeholder="结束日期"
              />
            </div>
          </div>

          {/* 第二行：筛选条件 + 操作按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap flex-1">
              {/* 联赛下拉 */}
              <LeagueDropdown
                value={filters.leagueName || ''}
                onChange={(v) => updateFilter('leagueName', v || undefined)}
                leagues={leagues}
              />

              {/* 主客队搜索 */}
              <TeamSearch
                placeholder="主客队搜索"
                value={filters.teamName || ''}
                onChange={(v) => updateFilter('teamName', v || undefined)}
                suggestions={allTeams}
              />

              {/* 分隔线 */}
              <div className="w-px h-6 hidden sm:block" style={{ background: '#2A2D3A' }} />

              {/* 半全场筛选 */}
              <HafuDropdown value={hafuFilter} onChange={setHafuFilter} />
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="h-[38px] px-3.5 rounded-lg text-[13px] cursor-pointer flex items-center gap-1.5 transition-all"
                style={{ background: 'none', border: '1px solid #2A2D3A', color: '#8B8FA3' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A3D4A'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3A'; e.currentTarget.style.color = '#8B8FA3'; }}
              >
                <RotateCcw size={12} /> 重置
              </button>
              <button
                onClick={handleSearch}
                className="h-[38px] px-4 rounded-lg text-[13px] font-bold cursor-pointer flex items-center gap-1.5"
                style={{ background: '#00D68F', border: 'none', color: '#0F1117' }}
              >
                <Search size={13} /> 搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选标签 + 总数 */}
      {(filterTags.length > 0 || pageState === 'loaded') && (
        <div className="flex items-center gap-2 flex-wrap mb-3 min-h-[28px]">
          {filterTags.map((t, i) => (
            <FilterTag key={i} label={t.label} onRemove={t.remove} />
          ))}
          <span className="text-[13px] text-[#5A5D70] ml-auto">
            共 <span className="text-white font-semibold">{total.toLocaleString()}</span> 条
          </span>
        </div>
      )}

      {/* 数据表格 */}
      {pageState === 'loading' && (
        <div className="bg-[#1A1D28] rounded-xl overflow-hidden">
          <div className="h-[46px]" style={{ background: '#1E2130', borderBottom: '1px solid #2A2D3A' }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-5 px-5"
              style={{ height: 54, borderBottom: i < 9 ? '1px solid #232536' : 'none' }}
            >
              {[100, 50, 80, 80, 60, 110, 70].map((w, j) => (
                <div
                  key={j}
                  className="h-3 rounded-md"
                  style={{
                    width: w,
                    background: '#252836',
                    animation: `hsk 1.6s ease-in-out infinite ${j * 80}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {pageState === 'error' && (
        <ErrorState
          title="数据加载失败"
          description="请检查网络连接后重试"
          onRetry={() => { setPageState('loading'); loadData(); }}
        />
      )}

      {pageState === 'empty' && (
        <EmptyState />
      )}

      {/* 结果筛选后无数据 */}
      {pageState === 'loaded' && matches.length > 0 && (
        <>
          {/* 桌面端表格 - md 以上显示 */}
          <div className="hidden md:block bg-[#1A1D28] rounded-xl overflow-x-auto hide-scrollbar">
            {/* 表格最小宽度，保证列不被压缩 */}
            <div style={{ minWidth: 800 }}>
              {/* 表头 */}
              <div
                className="flex items-center px-5"
                style={{ height: 46, background: '#1E2130', borderBottom: '1px solid #2A2D3A' }}
              >
                {COL_HEADS.map(({ label, flex }) => (
                  <div
                    key={label}
                    className="text-[11px] font-bold tracking-wider uppercase text-center"
                    style={{ color: '#5A5D70', flex }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* 数据行 */}
              {matches.map((match, i) => (
                <div key={match.matchId}>
                  <MatchRow match={match} alt={i % 2 === 1} onClick={() => handleRowClick(match)} />
                  {i < matches.length - 1 && (
                    <div className="ml-[23px]" style={{ height: 1, background: '#232536' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 移动端卡片 - md 以下显示 */}
          <div className="block md:hidden space-y-2">
            {matches.map((match) => (
              <MatchCard key={match.matchId} match={match} onClick={() => handleRowClick(match)} />
            ))}
          </div>

          {/* 分页 */}
          <Pagination
            page={filters.pageNum || 1}
            totalPages={totalPages}
            pageSize={filters.pageSize || DEFAULT_PAGE_SIZE}
            onPage={(p) => {
              updateFilter('pageNum', p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSize={(s) => {
              updateFilter('pageSize', s);
              updateFilter('pageNum', 1);
            }}
          />
        </>
      )}

      {/* 动画关键帧 */}
      <style>{`
        @keyframes hsk { 0%,100%{opacity:.35} 50%{opacity:.7} }
        input::placeholder { color: #3A3D4A; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </PageLayout>
  );
}

/**
 * 表格行组件
 */
function MatchRow({ match, alt, onClick }: { match: HistoryMatch; alt: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center px-5 cursor-pointer transition-all"
      style={{
        height: 54,
        background: hovered ? '#1E2334' : alt ? '#1C1F2E' : '#1A1D28',
        borderLeft: `3px solid ${hovered ? '#00D68F' : 'transparent'}`,
      }}
    >
      {/* 比赛时间 */}
      <div className="text-center" style={{ flex: 1.5 }}>
        <div className="text-[13px] font-medium text-white">
          {format(new Date(match.matchTime), 'yyyy-MM-dd')}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: '#5A5D70' }}>
          {format(new Date(match.matchTime), 'HH:mm')}
        </div>
      </div>
      {/* 联赛 */}
      <div className="text-center truncate px-1" style={{ flex: 1.3 }}>
        <LeagueTag name={match.leagueName} />
      </div>
      {/* 主队 */}
      <div className="text-center text-[13px] font-medium text-white truncate px-1" style={{ flex: 1 }}>
        {match.homeTeam}
      </div>
      {/* 客队 */}
      <div className="text-center text-[13px] font-medium text-white truncate px-1" style={{ flex: 1 }}>
        {match.awayTeam}
      </div>
      {/* 比分 */}
      <div className="text-center" style={{ flex: 0.7 }}>
        <span className="text-[15px] font-extrabold" style={{ color: '#00D68F', letterSpacing: '0.02em' }}>
          {match.score || '-'}
        </span>
      </div>
      {/* 让球 */}
      <div className="text-center" style={{ flex: 1.2 }}>
        {(() => {
          const hr = getHandicapResult(match.score, match.goalLine);
          if (!hr) return <span className="text-xs text-[#8B8FA3]">-</span>;
          return (
            <span
              className="inline-block text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                color: hr.color,
                background: `${hr.color}15`,
                border: `1px solid ${hr.color}30`,
              }}
            >
              {hr.text}({match.goalLine})
            </span>
          );
        })()}
      </div>
      {/* 半全场 */}
      <div className="text-center" style={{ flex: 1 }}>
        {match.hafuResult ? (
          <span
            className="inline-block text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              color: getHafuColor(match.hafuResult),
              background: `${getHafuColor(match.hafuResult)}15`,
              border: `1px solid ${getHafuColor(match.hafuResult)}30`,
            }}
          >
            {HAFU_MAP[match.hafuResult] || match.hafuResult}
          </span>
        ) : (
          <span className="text-xs text-[#8B8FA3]">-</span>
        )}
      </div>
    </div>
  );
}

/**
 * 移动端卡片组件
 */
function MatchCard({ match, onClick }: { match: HistoryMatch; onClick: () => void }) {
  const hr = getHandicapResult(match.score, match.goalLine);

  return (
    <div
      onClick={onClick}
      className="bg-[#1A1D28] rounded-lg p-3 cursor-pointer touch-card active:bg-[#252836] transition-colors"
      style={{ border: '1px solid #2A2D3A' }}
    >
      {/* 顶部：联赛 + 时间 */}
      <div className="flex items-center justify-between mb-2">
        <LeagueTag name={match.leagueName} />
        <span className="text-xs" style={{ color: '#5A5D70' }}>
          {format(new Date(match.matchTime), 'MM-dd HH:mm')}
        </span>
      </div>

      {/* 中间：主队 vs 客队 + 比分 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white flex-1 truncate">{match.homeTeam}</span>
        <div className="px-3 flex items-center">
          <span className="text-lg font-extrabold" style={{ color: '#00D68F' }}>
            {match.score || '-'}
          </span>
        </div>
        <span className="text-sm font-medium text-white flex-1 truncate text-right">{match.awayTeam}</span>
      </div>

      {/* 底部：让球 + 半全场 */}
      <div className="flex items-center gap-2">
        {hr && (
          <span
            className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded"
            style={{
              color: hr.color,
              background: `${hr.color}15`,
              border: `1px solid ${hr.color}30`,
            }}
          >
            {hr.text}({match.goalLine})
          </span>
        )}
        {match.hafuResult && (
          <span
            className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded"
            style={{
              color: getHafuColor(match.hafuResult),
              background: `${getHafuColor(match.hafuResult)}15`,
              border: `1px solid ${getHafuColor(match.hafuResult)}30`,
            }}
          >
            {HAFU_MAP[match.hafuResult] || match.hafuResult}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 分页组件（完整页码 + 省略号）
 */
function Pagination({
  page,
  totalPages,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const pages = useMemo((): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr: (number | '…')[] = [1];
    if (page > 3) arr.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
    if (page < totalPages - 2) arr.push('…');
    arr.push(totalPages);
    return arr;
  }, [page, totalPages]);

  const pageBtn = (
    label: string | number,
    active: boolean,
    onClick: () => void,
    disabled = false
  ) => (
    <button
      key={String(label)}
      onClick={onClick}
      disabled={disabled}
      className="min-w-[34px] h-[34px] px-1.5 rounded-[7px] text-[13px] cursor-pointer transition-all disabled:cursor-not-allowed"
      style={{
        border: `1px solid ${active ? '#00D68F' : '#2A2D3A'}`,
        background: active ? 'rgba(0,214,143,0.12)' : 'transparent',
        color: active ? '#00D68F' : disabled ? '#2A2D3A' : '#8B8FA3',
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-1.5">
        <span className="text-[13px]" style={{ color: '#5A5D70' }}>每页</span>
        <PageSizeDropdown value={pageSize} onChange={onPageSize} />
      </div>
      <div className="flex items-center gap-1">
        {pageBtn('‹', false, () => onPage(Math.max(1, page - 1)), page === 1)}
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`el-${i}`}
              className="w-6 text-center text-[13px]"
              style={{ color: '#3A3D4A' }}
            >
              …
            </span>
          ) : (
            pageBtn(p, p === page, () => onPage(p as number))
          )
        )}
        {pageBtn('›', false, () => onPage(Math.min(totalPages, page + 1)), page === totalPages)}
      </div>
    </div>
  );
}
