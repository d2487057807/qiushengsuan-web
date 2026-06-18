/**
 * 日期标签切换组件
 * 水平滚动的日期标签，sticky 固定在导航栏下方
 */

import { cn } from '@/lib/utils';

interface DateTabsProps {
  dates: Array<{
    key: string;
    label: string;
    sub?: string;
  }>;
  selected: string;
  onChange: (key: string) => void;
}

export function DateTabs({ dates, selected, onChange }: DateTabsProps) {
  return (
    <div className="sticky top-14 md:top-16 bg-[#1A1D28] border-b border-[#2A2D3A] z-40">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex gap-0 overflow-x-auto hide-scrollbar">
          {dates.map((d) => {
            const active = selected === d.key;
            return (
              <button
                key={d.key}
                onClick={() => onChange(d.key)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 md:px-5 pt-3 md:pt-3.5 pb-0 bg-transparent border-0 border-b-2 cursor-pointer relative transition-colors duration-200"
                style={{
                  borderBottomColor: active ? '#00D68F' : 'transparent',
                }}
              >
                <span
                  className={cn(
                    'text-sm leading-relaxed transition-colors duration-200',
                    active ? 'text-white font-semibold' : 'text-[#8B8FA3] font-normal'
                  )}
                >
                  {d.label}
                  {d.sub && (
                    <span
                      className={cn(
                        'ml-1 text-xs transition-colors duration-200',
                        active ? 'text-[#00D68F] font-semibold' : 'text-[#8B8FA3] font-normal'
                      )}
                    >
                      {d.sub}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
