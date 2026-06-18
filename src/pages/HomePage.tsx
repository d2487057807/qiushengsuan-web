/**
 * 首页 - 在售赛事列表
 * 使用 DateTabs 切换日期，支持无限滚动加载
 */

import { useState, useEffect, useRef } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DateTabs } from '@/components/shared/DateTabs';
import { MatchCard } from '@/components/shared/MatchCard';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoginModal } from '@/components/shared/LoginModal';
import { getOnSaleList } from '@/api/match';
import { OnSaleMatch } from '@/types/match';
import { useAuthStore } from '@/stores/auth';
import { format, parseISO, getDay } from 'date-fns';

type PageState = 'loading' | 'loaded' | 'empty' | 'error';

// 星期映射
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 分页配置
const PAGE_SIZE = 10;

export default function HomePage() {
  const { isLoggedIn } = useAuthStore();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [allMatches, setAllMatches] = useState<OnSaleMatch[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateTabs, setDateTabs] = useState<Array<{ key: string; label: string; sub?: string }>>([]);
  const [displayedMatches, setDisplayedMatches] = useState<OnSaleMatch[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 生成日期标签
  const generateDateTabs = (matches: OnSaleMatch[]) => {
    // 提取所有不同的日期
    const dateSet = new Set<string>();
    matches.forEach((match) => {
      if (match.businessDate) {
        dateSet.add(match.businessDate);
      }
    });

    // 转换为数组并排序
    const dates = Array.from(dateSet).sort();

    // 生成标签
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return dates.map((dateStr) => {
      try {
        const date = parseISO(dateStr);
        const formatted = format(date, 'MM/dd');
        const weekday = WEEKDAYS[getDay(date)];

        let sub: string | undefined;
        if (date.getTime() === today.getTime()) {
          sub = '今天';
        } else if (date.getTime() === tomorrow.getTime()) {
          sub = '明天';
        } else {
          sub = weekday;
        }

        return { key: dateStr, label: formatted, sub };
      } catch {
        return { key: dateStr, label: dateStr, sub: '' };
      }
    });
  };

  // 加载赛事列表
  const loadData = async () => {
    try {
      setPageState('loading');
      const res = await getOnSaleList();
      const rawData = res.data || [];

      // 转换 API 返回的嵌套结构为扁平数组
      const matches: OnSaleMatch[] = [];
      rawData.forEach((dateGroup: any) => {
        const businessDate = dateGroup.businessDate;
        if (dateGroup.subMatchList && Array.isArray(dateGroup.subMatchList)) {
          dateGroup.subMatchList.forEach((match: any) => {
            // 从 oddsList 中提取 HAD 和 HHAD 赔率
            const oddsList = match.oddsList || [];
            const hadOddsData = oddsList.find((o: any) => o.poolCode === 'HAD');
            const hhadOddsData = oddsList.find((o: any) => o.poolCode === 'HHAD');

            const onSaleMatch: OnSaleMatch = {
              matchId: match.matchId,
              matchNo: String(match.matchId),
              leagueName: match.leagueAbbName || '',
              matchNum: match.matchNumStr || '',
              homeTeam: match.homeTeamAbbName || '',
              awayTeam: match.awayTeamAbbName || '',
              matchTime: `${match.matchDate}T${match.matchTime}:00`,
              businessDate: businessDate,
              matchStatus: match.matchStatus === 'Selling' ? '0' : '2',
              hadOdds: hadOddsData?.h ? {
                homeWin: hadOddsData.h,
                draw: hadOddsData.d,
                awayWin: hadOddsData.a,
              } : undefined,
              hhadOdds: hhadOddsData?.h && hhadOddsData.goalLine ? {
                goalLine: hhadOddsData.goalLine,
                homeWin: hhadOddsData.h,
                draw: hhadOddsData.d,
                awayWin: hhadOddsData.a,
              } : undefined,
            };
            matches.push(onSaleMatch);
          });
        }
      });

      if (matches.length === 0) {
        setPageState('empty');
        setAllMatches([]);
        setDateTabs([]);
        return;
      }

      // 生成日期标签
      const tabs = generateDateTabs(matches);
      setDateTabs(tabs);

      // 默认选中第一个日期（或今天/明天）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayStr = format(today, 'yyyy-MM-dd');
      const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
      let defaultDate = tabs[0]?.key || '';
      if (tabs.some((t) => t.key === todayStr)) {
        defaultDate = todayStr;
      } else if (tabs.some((t) => t.key === tomorrowStr)) {
        defaultDate = tomorrowStr;
      }
      setSelectedDate(defaultDate);

      setAllMatches(matches);
      setPageState('loaded');
    } catch (error) {
      console.error('加载赛事失败:', error);
      setPageState('error');
    }
  };

  // 根据选中日期过滤赛事并重置分页
  useEffect(() => {
    if (!selectedDate || allMatches.length === 0) {
      setDisplayedMatches([]);
      setNoMore(false);
      return;
    }

    // 过滤当前日期的赛事（兼容不同日期格式）
    const filtered = allMatches.filter((m) => {
      // 直接匹配
      if (m.businessDate === selectedDate) return true;
      // 标准化后匹配（去除时间部分）
      const matchDate = m.businessDate?.split(' ')[0] || m.businessDate?.split('T')[0];
      const selected = selectedDate.split(' ')[0].split('T')[0];
      return matchDate === selected;
    });

    if (filtered.length === 0) {
      setDisplayedMatches([]);
      setNoMore(true);
      return;
    }

    // 显示第一页
    setDisplayedMatches(filtered.slice(0, PAGE_SIZE));
    setNoMore(filtered.length <= PAGE_SIZE);
  }, [selectedDate, allMatches]);

  // 无限滚动监听
  useEffect(() => {
    if (pageState !== 'loaded') return;
    const el = bottomRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && !noMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageState, loadingMore, noMore, displayedMatches.length]);

  // 加载更多
  const handleLoadMore = () => {
    if (loadingMore || noMore) return;

    setLoadingMore(true);
    // 模拟网络延迟
    setTimeout(() => {
      const filtered = allMatches.filter((m) => m.businessDate === selectedDate);
      const currentLength = displayedMatches.length;
      const nextItems = filtered.slice(currentLength, currentLength + PAGE_SIZE);

      setDisplayedMatches((prev) => [...prev, ...nextItems]);
      setNoMore(currentLength + nextItems.length >= filtered.length);
      setLoadingMore(false);
    }, 500);
  };

  // 初始加载
  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {/* DateTabs 需要固定在导航栏下方，放在 PageLayout 外面 */}
      {pageState === 'loaded' && dateTabs.length > 0 && (
        <DateTabs dates={dateTabs} selected={selectedDate} onChange={setSelectedDate} />
      )}

      <PageLayout className={dateTabs.length > 0 ? 'pt-24 md:pt-28' : ''}>
        {/* 内容区域 */}
        {pageState === 'loading' && (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {pageState === 'empty' && <EmptyState />}

        {pageState === 'error' && (
          <ErrorState
            title="加载失败"
            description="请检查网络连接后重试"
            onRetry={loadData}
          />
        )}

        {pageState === 'loaded' && (
          <>
            {/* 赛事列表 */}
            <div className="flex flex-col gap-3">
              {displayedMatches.map((match) => (
                <MatchCard
                  key={match.matchId}
                  match={match}
                  isLoggedIn={isLoggedIn}
                  onLoginRequired={() => setLoginModalOpen(true)}
                />
              ))}
            </div>

            {/* 加载更多 / 没有更多 */}
            <div ref={bottomRef} className="text-center py-8 pb-2">
              {loadingMore && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                  <span className="text-muted-foreground text-sm">加载中...</span>
                </div>
              )}
              {noMore && !loadingMore && displayedMatches.length > 0 && (
                <span className="text-gray-500 text-sm">— 没有更多了 —</span>
              )}
              {displayedMatches.length === 0 && (
                <span className="text-muted-foreground text-sm">该日期暂无赛事</span>
              )}
            </div>
          </>
        )}
      </PageLayout>

      {/* 登录引导弹窗 */}
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
