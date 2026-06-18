/**
 * 联赛颜色标签组件
 */

import { cn } from '@/lib/utils';
import { getLeagueColor } from '@/utils/odds';

interface LeagueTagProps {
  name: string;
  className?: string;
}

export function LeagueTag({ name, className }: LeagueTagProps) {
  const color = getLeagueColor(name);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {name}
    </span>
  );
}
