/**
 * 数据分析面板
 * 包含赔率概率解读、联赛特征、球队近况、交锋历史、主客场差异
 */

import { AnalysisData } from '@/types/match';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalysisPanelProps {
  data: AnalysisData | null;
  loading?: boolean;
  className?: string;
}

export function AnalysisPanel({ data, loading, className }: AnalysisPanelProps) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        暂无分析数据
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 赔率概率解读 */}
      {data.oddsProbability && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-4">赔率概率解读</h3>
          <div className="space-y-3">
            <ProbabilityBar
              label="主胜"
              value={data.oddsProbability.homeWin}
              color="#10B981"
            />
            <ProbabilityBar
              label="平局"
              value={data.oddsProbability.draw}
              color="#3B82F6"
            />
            <ProbabilityBar
              label="客胜"
              value={data.oddsProbability.awayWin}
              color="#EF4444"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * 已扣除庄家利润，反映真实概率
          </p>
        </section>
      )}

      {/* 联赛特征 */}
      {data.leagueStats && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-4">联赛特征</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatItem label="主胜率" value={`${data.leagueStats.homeWinRate.toFixed(1)}%`} />
            <StatItem label="平局率" value={`${data.leagueStats.drawRate.toFixed(1)}%`} />
            <StatItem label="客胜率" value={`${data.leagueStats.awayWinRate.toFixed(1)}%`} />
            <StatItem label="场均进球" value={data.leagueStats.avgGoals.toFixed(2)} />
            <StatItem label="大2.5球率" value={`${data.leagueStats.over25Rate.toFixed(1)}%`} />
          </div>
        </section>
      )}

      {/* 球队近况 */}
      {data.teamForm && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-4">球队近况对比</h3>
          <div className="grid grid-cols-2 gap-4">
            <TeamFormCard
              title="近5场"
              homeTeam={data.teamForm.homeTeam.last5}
              awayTeam={data.teamForm.awayTeam.last5}
            />
            <TeamFormCard
              title="近10场"
              homeTeam={data.teamForm.homeTeam.last10}
              awayTeam={data.teamForm.awayTeam.last10}
            />
          </div>
        </section>
      )}

      {/* 交锋历史 */}
      {data.headToHead && data.headToHead.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-4">交锋历史</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-muted-foreground">日期</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">主队</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">比分</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">客队</th>
                  <th className="px-3 py-2 text-center text-muted-foreground">结果</th>
                </tr>
              </thead>
              <tbody>
                {data.headToHead.map((match, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{match.matchDate}</td>
                    <td className="px-3 py-2 text-white">{match.homeTeam}</td>
                    <td className="px-3 py-2 text-center font-mono text-white">
                      {match.homeScore}:{match.awayScore}
                    </td>
                    <td className="px-3 py-2 text-white">{match.awayTeam}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs',
                          match.result === 'H' && 'bg-green-500/20 text-green-400',
                          match.result === 'D' && 'bg-blue-500/20 text-blue-400',
                          match.result === 'A' && 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {match.result === 'H' ? '主胜' : match.result === 'D' ? '平局' : '客胜'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// 概率进度条
function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white w-12">{label}</span>
      <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full flex items-center px-3 transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            minWidth: '60px',
          }}
        >
          <span className="text-xs font-medium text-white">{value.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// 统计项
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// 球队近况卡片
function TeamFormCard({
  title,
  homeTeam,
  awayTeam,
}: {
  title: string;
  homeTeam: {
    winRate: number;
    drawRate: number;
    loseRate: number;
    avgGoalsScored: number;
    avgGoalsConceded: number;
  };
  awayTeam: {
    winRate: number;
    drawRate: number;
    loseRate: number;
    avgGoalsScored: number;
    avgGoalsConceded: number;
  };
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <h4 className="text-xs text-muted-foreground mb-3">{title}</h4>

      {/* 胜率条 */}
      <div className="flex h-2 rounded-full overflow-hidden mb-3">
        <div className="bg-green-500" style={{ width: `${homeTeam.winRate}%` }} />
        <div className="bg-blue-500" style={{ width: `${homeTeam.drawRate}%` }} />
        <div className="bg-red-500" style={{ width: `${homeTeam.loseRate}%` }} />
      </div>

      {/* 数据 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">进球/失球</div>
          <div className="text-white">
            {homeTeam.avgGoalsScored.toFixed(1)} / {homeTeam.avgGoalsConceded.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">进球/失球</div>
          <div className="text-white">
            {awayTeam.avgGoalsScored.toFixed(1)} / {awayTeam.avgGoalsConceded.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
