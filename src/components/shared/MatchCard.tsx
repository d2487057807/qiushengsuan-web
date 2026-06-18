/**
 * 赛事卡片组件
 * 多行赔率布局、2个操作按钮（走势/详情）、彩色渐变球队头像
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { LeagueTag } from './LeagueTag';
import { cn } from '@/lib/utils';
import { TrendingUp, FileText } from 'lucide-react';

interface MatchCardProps {
  match: {
    matchId: number;
    matchNo: string;
    leagueName: string;
    leagueColor?: string;
    matchNum: string;
    homeTeam: string;
    awayTeam: string;
    matchTime: string;
    businessDate?: string;
    hadOdds?: {
      homeWin: string;
      draw: string;
      awayWin: string;
    };
    hhadOdds?: {
      goalLine: string;
      homeWin: string;
      draw: string;
      awayWin: string;
    };
  };
  // 未登录时的回调（由父组件控制登录弹窗）
  onLoginRequired?: () => void;
  isLoggedIn?: boolean;
}

// 根据球队名生成颜色
function getTeamColor(teamName: string | undefined, isHome: boolean): string {
  // 默认颜色
  if (!teamName) {
    return isHome
      ? 'linear-gradient(135deg, #6ABFFF 0%, #0066CC 100%)'
      : 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)';
  }
  // 简单哈希生成颜色
  const hash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  if (isHome) {
    return `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${hue}, 70%, 40%) 100%)`;
  }
  return `linear-gradient(135deg, hsl(${(hue + 180) % 360}, 70%, 60%) 0%, hsl(${(hue + 180) % 360}, 70%, 40%) 100%)`;
}

export function MatchCard({ match, onLoginRequired, isLoggedIn = true }: MatchCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);

  // 格式化比赛时间
  const formatTime = () => {
    try {
      return format(parseISO(match.matchTime), 'HH:mm');
    } catch {
      return match.matchTime;
    }
  };

  // 跳转到详情页
  const handleGoDetail = () => {
    navigate(`/detail?matchId=${match.matchNo}&source=onsale`);
  };

  // 查看赔率走势
  const handleOddsTrend = () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    setLoadingBtn('trend');
    setTimeout(() => {
      setLoadingBtn(null);
      handleGoDetail();
    }, 300);
  };

  // 查看详情
  const handleDetail = () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    setLoadingBtn('detail');
    setTimeout(() => {
      setLoadingBtn(null);
      handleGoDetail();
    }, 300);
  };

  // 操作按钮配置
  const actions = [
    { key: 'trend', icon: <TrendingUp size={14} />, label: '走势', onClick: handleOddsTrend },
    { key: 'detail', icon: <FileText size={14} />, label: '详情', onClick: handleDetail },
  ];

  // 球队颜色
  const homeColor = getTeamColor(match.homeTeam, true);
  const awayColor = getTeamColor(match.awayTeam, false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'bg-card rounded-xl p-4 md:p-5 transition-all duration-200 cursor-default',
        hovered ? 'border-primary' : 'border-border',
        'border'
      )}
      style={{ borderWidth: '1px' }}
    >
      {/* 头部：联赛 + 时间 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <LeagueTag name={match.leagueName} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime()}</span>
          <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded">
            在售
          </span>
        </div>
      </div>

      {/* 队伍区域 */}
      <div className="flex items-center justify-between mb-4">
        {/* 主队 */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: homeColor }}
          >
            {(match.homeTeam || '?').charAt(0)}
          </div>
          <span className="text-white text-base font-semibold truncate">
            {match.homeTeam || '未知'}
          </span>
        </div>

        {/* VS */}
        <div className="px-4 flex-shrink-0">
          <span className="text-muted-foreground text-sm font-medium">VS</span>
        </div>

        {/* 客队 */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-white text-base font-semibold truncate">
            {match.awayTeam || '未知'}
          </span>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: awayColor }}
          >
            {(match.awayTeam || '?').charAt(0)}
          </div>
        </div>
      </div>

      {/* 赔率区域 - 多行布局 */}
      <div className="bg-secondary rounded-lg px-4 py-3 mb-4 flex flex-col gap-2.5">
        {/* 胜平负 */}
        {match.hadOdds && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-[72px] flex-shrink-0">
              胜平负
            </span>
            <div className="flex gap-2 flex-1">
              {[
                { label: '胜', value: match.hadOdds.homeWin },
                { label: '平', value: match.hadOdds.draw },
                { label: '负', value: match.hadOdds.awayWin },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-muted-foreground text-[10px]">{label}</span>
                  <span className="text-white text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 让球胜平负 */}
        {match.hhadOdds && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-[72px] flex-shrink-0">
              让球({parseFloat(match.hhadOdds.goalLine)})
            </span>
            <div className="flex gap-2 flex-1">
              {[
                { label: '胜', value: match.hhadOdds.homeWin },
                { label: '平', value: match.hhadOdds.draw },
                { label: '负', value: match.hhadOdds.awayWin },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-muted-foreground text-[10px]">{label}</span>
                  <span className="text-white text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {actions.map(({ key, icon, label, onClick }) => {
          const loading = loadingBtn === key;
          return (
            <button
              key={key}
              onClick={onClick}
              disabled={loading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                'border border-border cursor-pointer',
                loading
                  ? 'text-gray-500 cursor-not-allowed opacity-60'
                  : 'text-muted-foreground hover:text-white hover:border-gray-500'
              )}
              style={{ background: 'none' }}
            >
              {loading ? (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                icon
              )}
              {loading ? '加载中...' : label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
