/**
 * 赛事详情页
 * 适配 /match/detail 接口：赔率数据从接口直接返回，无需额外请求
 * 5个Tab，禁用Tab显示tooltip，左2右1布局
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { OddsLineChart } from '@/components/charts/OddsLineChart';
import { CalibrationTable } from '@/components/charts/CalibrationTable';
import { LeagueTag } from '@/components/shared/LeagueTag';
import { getMatchDetail, getOnSaleDetail, getOddsCalibration, matchSimilar } from '@/api/match';
import {
  MatchDetail,
  CalibrationRow,
  SimilarMatch,
  PlayType,
} from '@/types/match';
import { ODDS_SERIES_COLORS } from '@/components/charts/ChartTheme';
import { getHafuText } from '@/utils/odds';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// Tab配置
const TABS: { key: PlayType; label: string }[] = [
  { key: 'had', label: '胜平负' },
  { key: 'hhad', label: '让球胜平负' },
  { key: 'crs', label: '比分' },
  { key: 'ttg', label: '总进球' },
  { key: 'hafu', label: '半全场' },
];

// 结果映射
const RESULT_TEXT: Record<string, string> = { H: '主胜', D: '平局', A: '客胜' };

// 半全场映射
const HAFU_MAP: Record<string, string> = {
  HH: '胜/胜', HD: '胜/平', HA: '胜/负',
  DH: '平/胜', DD: '平/平', DA: '平/负',
  AH: '负/胜', AD: '负/平', AA: '负/负',
};

// 半全场颜色（根据全场结果）
function getHafuColor(hafu: string): string {
  if (!hafu || hafu.length < 2) return '#8B8FA3';
  const ft = hafu[1];
  if (ft === 'H') return '#00D68F';
  if (ft === 'D') return '#3B82F6';
  if (ft === 'A') return '#FF4D6A';
  return '#8B8FA3';
}


/**
 * 禁用Tab（hover显示tooltip）
 */
function DisabledTab({ label }: { label: string }) {
  const [showTip, setShowTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <div
      className="relative"
      onMouseEnter={() => { timer.current = setTimeout(() => setShowTip(true), 500); }}
      onMouseLeave={() => { if (timer.current) clearTimeout(timer.current); setShowTip(false); }}
    >
      <button className="px-5 py-3 text-sm whitespace-nowrap" style={{ background: 'none', border: 'none', color: '#8B8FA3', cursor: 'not-allowed' }}>
        {label}
      </button>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md text-xs text-[#8B8FA3] whitespace-nowrap z-10 pointer-events-none"
          style={{ background: '#252836', border: '1px solid #2A2D3A', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          该玩法未开售
          <div className="absolute top-full left-1/2 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #252836' }} />
        </div>
      )}
    </div>
  );
}

/**
 * 骨架屏
 */
function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#1A1D28] rounded-xl p-5 mb-[14px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2"><div className="w-20 h-5 bg-[#252836] rounded" /><div className="w-28 h-3.5 bg-[#252836] rounded mt-1" /></div>
          <div className="flex flex-col items-center gap-2.5"><div className="w-56 h-9 bg-[#252836] rounded" /><div className="w-24 h-10 bg-[#252836] rounded" /></div>
          <div className="w-16 h-7 bg-[#252836] rounded-full" />
        </div>
      </div>
      <div className="bg-[#1A1D28] rounded-xl p-4 mb-[14px]">
        <div className="w-16 h-5 bg-[#252836] rounded mb-3.5" />
        <div className="flex gap-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="flex-1 h-[60px] bg-[#252836] rounded-lg" />)}</div>
      </div>
      <div className="bg-[#1A1D28] rounded-xl h-12 mb-[14px]" />
      <div className="flex gap-5">
        <div className="flex-[2] flex flex-col gap-4"><div className="h-[340px] bg-[#1A1D28] rounded-xl" /><div className="h-[140px] bg-[#1A1D28] rounded-xl" /></div>
        <div className="flex-1"><div className="h-[500px] bg-[#1A1D28] rounded-xl" /></div>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const source = searchParams.get('source');

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlayType>('had');

  // 哪些Tab有数据
  const [availableTabs, setAvailableTabs] = useState<Set<PlayType>>(new Set());

  // Tab指示器
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 校准数据
  const [calibrationData, setCalibrationData] = useState<CalibrationRow[]>([]);
  const [calibrationLoading, setCalibrationLoading] = useState(false);

  // 比分走势选中的比分（最多5个）
  const [selectedScores, setSelectedScores] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, wasDragged: false });

  // 鼠标拖拽横滑
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
      wasDragged: false,
    };
    scrollRef.current.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 3) dragState.current.wasDragged = true;
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };
  const handleMouseUp = () => {
    dragState.current.isDown = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  // 相似比赛（独立加载）
  const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarVisible, setSimilarVisible] = useState(false);

  // 内容淡入
  const [contentVisible, setContentVisible] = useState(true);

  // 左侧面板高度（用于右侧自适应）
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!leftPanelRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setLeftHeight(entry.contentRect.height);
      }
    });
    observer.observe(leftPanelRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // 更新Tab指示器
  const updateIndicator = useCallback(() => {
    const idx = TABS.findIndex((t) => t.key === activeTab);
    const el = tabRefs.current[idx];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  useEffect(() => { updateIndicator(); }, [updateIndicator, loading]);

  // 加载赛事详情（赔率数据已包含在接口中）
  useEffect(() => {
    if (!matchId) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = source === 'history'
          ? await getMatchDetail(Number(matchId))
          : await getOnSaleDetail(matchId);
        const data = res.data as MatchDetail;
        setMatch(data);

        // 判断哪些Tab有赔率数据
        const available = new Set<PlayType>();
        if (data.hadList?.length > 0) available.add('had');
        if (data.hhadList?.length > 0) available.add('hhad');
        if (data.crsList?.length > 0) available.add('crs');
        if (data.ttgList?.length > 0) available.add('ttg');
        if (data.hafuList?.length > 0) available.add('hafu');
        setAvailableTabs(available);

        // 默认选中第一个有数据的Tab
        const firstTab = TABS.find((t) => available.has(t.key));
        if (firstTab) setActiveTab(firstTab.key);
      } catch (error: any) {
        console.error('加载赛事详情失败:', error);
        // 拦截器已处理的错误不重复提示
        if (!error._handled) {
          toast.error('加载赛事详情失败');
        }
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [matchId, source]);

  // 根据当前Tab计算赔率走势数据
  const getOddsData = () => {
    if (!match) return [];
    switch (activeTab) {
      case 'had':
        return match.hadList.map((item) => ({
          publishTime: item.datetime,
          homeWin: item.homeWin,
          draw: item.draw,
          awayWin: item.awayWin,
        }));
      case 'hhad':
        return match.hhadList.map((item) => ({
          publishTime: item.datetime,
          homeWin: item.homeWin,
          draw: item.draw,
          awayWin: item.awayWin,
        }));
      case 'ttg':
        return match.ttgList.map((item) => ({
          publishTime: item.datetime,
          '0球': item.goal0, '1球': item.goal1, '2球': item.goal2, '3球': item.goal3,
          '4球': item.goal4, '5球': item.goal5, '6球': item.goal6, '7+球': item.goal7,
        }));
      case 'hafu': {
        // 按时间分组，每组9种结果
        const grouped = new Map<string, Record<string, any>>();
        match.hafuList.forEach((item) => {
          const key = item.datetime;
          if (!grouped.has(key)) grouped.set(key, { publishTime: key });
          const result = item.halfResult + item.fullResult;
          grouped.get(key)![result] = item.odds;
        });
        return Array.from(grouped.values());
      }
      case 'crs': {
        // 比分赔率：按选中的比分分组
        const grouped = new Map<string, Record<string, any>>();
        match.crsList.forEach((item) => {
          const label = getScoreLabel(item.homeScore, item.awayScore);
          if (!selectedScores.has(label)) return;
          const time = item.datetime;
          if (!grouped.has(time)) grouped.set(time, { publishTime: time });
          grouped.get(time)![label] = item.odds;
        });
        return Array.from(grouped.values());
      }
      default:
        return [];
    }
  };

  // 比分显示名称（特殊比分转换）
  const getScoreLabel = (homeScore: number, awayScore: number): string => {
    if (homeScore === -1 && awayScore === 0) return '胜其他';
    if (homeScore === -2 && awayScore === 0) return '平其他';
    if (homeScore === -3 && awayScore === 0) return '负其他';
    return `${homeScore}:${awayScore}`;
  };

  // 获取比分分组（按出现次数排序）
  const getCrsScoreGroups = () => {
    if (!match) return [];
    const countMap = new Map<string, { label: string; count: number }>();
    match.crsList.forEach((item) => {
      const key = `${item.homeScore}:${item.awayScore}`;
      const existing = countMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(key, { label: getScoreLabel(item.homeScore, item.awayScore), count: 1 });
      }
    });
    return Array.from(countMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val]) => ({ key, label: val.label, count: val.count }));
  };

  // 切换比分选中状态（拖拽时不触发）
  const toggleScore = (label: string, checkDrag?: boolean) => {
    if (checkDrag && dragState.current.wasDragged) return;
    setSelectedScores((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else if (next.size < 5) {
        next.add(label);
      }
      return next;
    });
  };

  // 初始化选中的比分（默认选前5个）
  useEffect(() => {
    if (activeTab === 'crs' && match && selectedScores.size === 0) {
      const groups = getCrsScoreGroups();
      const initial = groups.slice(0, 5).map((g) => g.label);
      setSelectedScores(new Set(initial));
    }
  }, [activeTab, match]);

  // 图表系列配置
  const getChartSeries = () => {
    const CRS_COLORS = ['#00D68F', '#3B82F6', '#FF4D6A', '#FFB347', '#8B5CF6'];
    switch (activeTab) {
      case 'had':
      case 'hhad':
        return [
          { key: 'homeWin', name: '主胜', color: ODDS_SERIES_COLORS[0] },
          { key: 'draw', name: '平局', color: ODDS_SERIES_COLORS[1] },
          { key: 'awayWin', name: '客胜', color: ODDS_SERIES_COLORS[2] },
        ];
      case 'ttg':
        return [
          { key: '0球', name: '0球', color: '#8B8FA3' },
          { key: '1球', name: '1球', color: '#FF6B6B' },
          { key: '2球', name: '2球', color: '#FFB347' },
          { key: '3球', name: '3球', color: '#00D68F' },
          { key: '4球', name: '4球', color: '#3B82F6' },
          { key: '5球', name: '5球', color: '#8B5CF6' },
          { key: '6球', name: '6球', color: '#EC4899' },
          { key: '7+球', name: '7+球', color: '#F59E0B' },
        ];
      case 'hafu':
        return [
          { key: 'HH', name: '胜/胜', color: '#00D68F' },
          { key: 'HD', name: '胜/平', color: '#3B82F6' },
          { key: 'HA', name: '胜/负', color: '#FF4D6A' },
          { key: 'DH', name: '平/胜', color: '#10B981' },
          { key: 'DD', name: '平/平', color: '#6366F1' },
          { key: 'DA', name: '平/负', color: '#F59E0B' },
          { key: 'AH', name: '负/胜', color: '#8B5CF6' },
          { key: 'AD', name: '负/平', color: '#EC4899' },
          { key: 'AA', name: '负/负', color: '#6B7280' },
        ];
      case 'crs': {
        const scoreGroups = getCrsScoreGroups();
        const selected = scoreGroups.filter((s) => selectedScores.has(s.label));
        return selected.map((s, i) => ({
          key: s.label,
          name: s.label,
          color: CRS_COLORS[i % CRS_COLORS.length],
        }));
      }
      default:
        return [];
    }
  };

  // Tab切换（带淡入动画）
  const handleTabClick = (key: PlayType) => {
    if (!availableTabs.has(key)) return;
    setContentVisible(false);
    setActiveTab(key);
    setTimeout(() => setContentVisible(true), 20);
  };

  // 比赛结果
  const getOpeningResults = () => {
    if (!match?.result) return [];
    const r = match.result;
    return [
      { play: '胜平负', result: RESULT_TEXT[r.hadResult] || '—' },
      { play: `让球(${r.hhadGoalLine})`, result: RESULT_TEXT[r.hhadResult] || '—' },
      { play: '比分', result: r.crsResult || '—' },
      { play: '总进球', result: r.ttgResult !== undefined ? `${r.ttgResult}球` : '—' },
      { play: '半全场', result: r.hafuResult ? getHafuText(r.hafuResult) : '—' },
    ];
  };

  // 相似比赛分布
  const getDistribution = () => {
    const total = similarMatches.length;
    if (total === 0) return [];
    const h = similarMatches.filter((m) => m.winFlag === 'H').length;
    const d = similarMatches.filter((m) => m.winFlag === 'D').length;
    const a = similarMatches.filter((m) => m.winFlag === 'A').length;
    return [
      { label: '主胜', pct: Math.round((h / total) * 100), color: '#00D68F' },
      { label: '平局', pct: Math.round((d / total) * 100), color: '#3B82F6' },
      { label: '客胜', pct: Math.round((a / total) * 100), color: '#FF4D6A' },
    ];
  };

  // 加载校准数据（Tab切换时）
  useEffect(() => {
    if (!matchId) return;
    const loadCalibration = async () => {
      setCalibrationLoading(true);
      try {
        const res = await getOddsCalibration(Number(matchId), activeTab);
        setCalibrationData(res.data || []);
      } catch (error) {
        console.error('加载校准数据失败:', error);
      } finally {
        setCalibrationLoading(false);
      }
    };
    loadCalibration();
  }, [matchId, activeTab]);

  // 加载相似比赛
  useEffect(() => {
    if (!matchId) return;
    const loadSimilar = async () => {
      setSimilarLoading(true);
      try {
        const res = await matchSimilar(Number(matchId));
        setSimilarMatches(res.data || []);
        setTimeout(() => setSimilarVisible(true), 200);
      } catch (error) {
        console.error('加载相似比赛失败:', error);
      } finally {
        setSimilarLoading(false);
      }
    };
    loadSimilar();
  }, [matchId]);

  if (loading) return <PageLayout><PageSkeleton /></PageLayout>;

  if (!match) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">赛事不存在或已过期</p>
          <Link to="/" className="text-primary hover:underline mt-2 inline-block">返回首页</Link>
        </div>
      </PageLayout>
    );
  }

  const openingResults = getOpeningResults();
  const distribution = getDistribution();
  const oddsData = getOddsData();

  return (
    <PageLayout>
      {/* 面包屑 */}
      <div className="sticky top-14 md:top-16 z-40 bg-[#0F1117] border-b border-[#2A2D3A] -mx-4 md:-mx-6 px-4 md:px-6 mb-4 md:mb-6">
        <div className="flex items-center gap-2 py-2.5 md:py-3">
          <Link to={source === 'history' ? '/history' : '/'} className="text-xs md:text-sm text-[#8B8FA3] hover:text-white transition-colors">← 返回赛事列表</Link>
          <span className="text-[#2A2D3A] hidden sm:inline">·</span>
          <span className="text-xs md:text-sm text-[#8B8FA3] hidden sm:inline">{match.leagueName} · 赛事详情</span>
        </div>
      </div>

      {/* ① 顶部信息卡片 */}
      <div className="bg-[#1A1D28] rounded-xl p-4 md:p-5 mb-3 md:mb-[14px] relative">
        {/* 移动端：状态标签在顶部 */}
        <div className="flex items-center justify-between mb-3 md:hidden">
          <div className="flex items-center gap-2">
            <LeagueTag name={match.leagueName} />
            <span className="text-xs text-[#8B8FA3]">{match.matchTime}</span>
          </div>
          <div className="px-2.5 py-1 rounded-[16px] text-xs font-semibold"
            style={{ background: 'rgba(0,214,143,0.15)', border: '1px solid rgba(0,214,143,0.4)', color: '#00D68F' }}>
            {match.matchStatus === '2' ? '已完赛' : '进行中'}
          </div>
        </div>
        {/* 移动端：主队/VS/客队 居中纵向 */}
        <div className="flex items-center justify-between md:justify-between">
          <div className="hidden md:flex flex-col items-start gap-1.5">
            <LeagueTag name={match.leagueName} />
            <span className="text-xs text-[#8B8FA3]">{match.matchTime}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-center">
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-bold text-white">{match.homeTeam}</div>
              <div className="text-xs text-[#8B8FA3] mt-0.5">主队</div>
            </div>
            <div className="text-center min-w-[60px] sm:min-w-[100px]">
              {match.matchStatus === '2' ? (
                <>
                  <div className="text-2xl sm:text-4xl font-extrabold leading-none" style={{ color: '#00D68F' }}>{match.score}</div>
                  <div className="text-[10px] sm:text-[11px] text-[#8B8FA3] mt-1">半场 {match.halfScore}</div>
                </>
              ) : (
                <div className="text-xl sm:text-2xl text-muted-foreground font-bold">VS</div>
              )}
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-2xl font-bold text-white">{match.awayTeam}</div>
              <div className="text-xs text-[#8B8FA3] mt-0.5">客队</div>
            </div>
          </div>
          <div className="hidden md:block px-3.5 py-1.5 rounded-[20px] text-[13px] font-semibold"
            style={{ background: 'rgba(0,214,143,0.15)', border: '1px solid rgba(0,214,143,0.4)', color: '#00D68F' }}>
            {match.matchStatus === '2' ? '已完赛' : '进行中'}
          </div>
        </div>
      </div>

      {/* ② 比赛结果卡片 */}
      {match.matchStatus === '2' && openingResults.length > 0 && (
        <div className="bg-[#1A1D28] rounded-xl p-4 mb-[14px]">
          <div className="text-base font-bold text-white mb-3">比赛结果</div>
          <div className="flex gap-2.5">
            {openingResults.map(({ play, result }) => (
              <div key={play} className="flex-1 bg-[#252836] rounded-lg py-2.5 px-3 text-center">
                <div className="text-xs text-[#8B8FA3] mb-1.5">{play}</div>
                <div className="text-sm font-bold text-white">{result}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ③ Tab切换栏 */}
      <div className="bg-[#1A1D28] rounded-xl mb-3 md:mb-[14px] relative overflow-x-auto hide-scrollbar">
        <div className="flex">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            const isDisabled = !availableTabs.has(tab.key);
            if (isDisabled) return <DisabledTab key={tab.key} label={tab.label} />;
            return (
              <button key={tab.key} ref={(el) => { tabRefs.current[idx] = el; }}
                onClick={() => handleTabClick(tab.key)}
                className="px-5 py-3 text-sm whitespace-nowrap transition-colors"
                style={{ background: 'none', border: 'none', color: isActive ? '#FFFFFF' : '#8B8FA3', fontWeight: isActive ? 600 : 400, cursor: 'pointer' }}>
                {tab.label}
              </button>
            );
          })}
          <div className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width, background: '#00D68F' }} />
        </div>
      </div>

      {/* ④ Tab内容区 */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
        {/* 左侧：桌面端 2/3，移动端全宽 */}
        <div ref={leftPanelRef} className="w-full lg:flex-[2] min-w-0">
          <div style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 0.2s ease-out' }}>
            {/* 赔率走势 */}
            <div className="bg-[#1A1D28] rounded-xl mb-[14px]">
              <div className="p-5 pb-0">
                <h3 className="text-xl font-bold text-white mb-3.5">赔率走势</h3>
              </div>

              {/* 比分选择标签 - 横向滚动 */}
              {activeTab === 'crs' && (
                <div
                  ref={scrollRef}
                  className="px-5 pb-3 overflow-x-auto hide-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab', userSelect: 'none' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div className="flex items-center gap-2" style={{ width: 'max-content' }}>
                    {getCrsScoreGroups().map((s) => {
                      const active = selectedScores.has(s.label);
                      const CRS_COLORS = ['#00D68F', '#3B82F6', '#FF4D6A', '#FFB347', '#8B5CF6'];
                      const activeIndex = Array.from(selectedScores).indexOf(s.label);
                      const color = active ? CRS_COLORS[activeIndex % CRS_COLORS.length] : '#8B8FA3';
                      return (
                        <button
                          key={s.key}
                          onClick={() => toggleScore(s.label, true)}
                          className="px-3.5 py-1.5 text-sm rounded-lg transition-all flex-shrink-0"
                          style={{
                            background: active ? `${color}18` : '#252836',
                            border: `1px solid ${active ? `${color}60` : '#2A2D3A'}`,
                            color: active ? color : '#8B8FA3',
                            fontWeight: active ? 600 : 400,
                            cursor: selectedScores.size >= 5 && !active ? 'not-allowed' : 'pointer',
                            opacity: selectedScores.size >= 5 && !active ? 0.35 : 1,
                          }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="px-5 pb-5">
                {oddsData.length > 0 ? (
                  <OddsLineChart
                    data={oddsData}
                    series={getChartSeries()}
                    fullscreenExtra={activeTab === 'crs' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCrsScoreGroups().map((s) => {
                          const active = selectedScores.has(s.label);
                          const CRS_COLORS = ['#00D68F', '#3B82F6', '#FF4D6A', '#FFB347', '#8B5CF6'];
                          const activeIndex = Array.from(selectedScores).indexOf(s.label);
                          const color = active ? CRS_COLORS[activeIndex % CRS_COLORS.length] : '#8B8FA3';
                          return (
                            <button
                              key={s.key}
                              onClick={() => toggleScore(s.label)}
                              className="px-3.5 py-1.5 text-sm rounded-lg transition-all"
                              style={{
                                background: active ? `${color}18` : '#252836',
                                border: `1px solid ${active ? `${color}60` : '#2A2D3A'}`,
                                color: active ? color : '#8B8FA3',
                                fontWeight: active ? 600 : 400,
                              }}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : undefined}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-[#252836] rounded-xl text-[#8B8FA3] text-sm">
                    暂无走势数据
                  </div>
                )}
              </div>
            </div>

            {/* 赔率校准统计 */}
            <CalibrationTable data={calibrationData} loading={calibrationLoading} />
          </div>
        </div>

        {/* 右侧：桌面端 1/3，移动端全宽 */}
        <div className="w-full lg:flex-1 lg:min-w-[260px]">
          <div className="bg-[#1A1D28] rounded-xl p-4 md:p-5 flex flex-col" style={leftHeight ? { maxHeight: leftHeight, transition: 'max-height 0.3s ease-out' } : undefined}>
            <h3 className="text-xl font-bold text-white mb-4">历史相似比赛 TOP 20</h3>
            {similarLoading ? (
              <div className="text-center py-10">
                <div className="inline-flex flex-col items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '2px solid #2A2D3A', borderTopColor: '#8B8FA3' }} />
                  <span className="text-[13px] text-[#8B8FA3]">赔率特征计算中...</span>
                </div>
              </div>
            ) : similarMatches.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-[#8B8FA3]">暂无足够相似比赛数据</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
                    {distribution.map(({ label, pct, color }) => (
                      <div key={label} style={{ width: `${pct}%`, background: color }} />
                    ))}
                  </div>
                  <div className="flex gap-3.5">
                    {distribution.map(({ label, pct, color }) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                        <span className="text-[11px] text-[#8B8FA3]">{label} {pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {similarMatches.slice(0, 20).map((item, index) => (
                    <Link key={item.matchId} to={`/detail?matchId=${item.matchId}&source=history`}
                      className="flex items-center gap-2.5 p-2.5 rounded-[10px] no-underline transition-all duration-150"
                      style={{
                        background: '#252836', border: '1px solid #2A2D3A',
                        transform: similarVisible ? 'translateX(0)' : 'translateX(60px)',
                        opacity: similarVisible ? 1 : 0,
                        transition: `transform 0.35s ease-out ${index * 100}ms, opacity 0.35s ease-out ${index * 100}ms, border-color 0.15s, background 0.15s`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3A3D4A'; e.currentTarget.style.background = '#2D3044'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2D3A'; e.currentTarget.style.background = '#252836'; }}>
                      {/* 相似度 */}
                      <div className="text-xs font-bold text-center flex-shrink-0 min-w-[44px] py-0.5 px-1.5 rounded"
                        style={{ background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.3)', color: '#00D68F' }}>
                        {item.similarity.toFixed(1)}%
                      </div>
                      {/* 比赛信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-[#8B8FA3] mb-0.5">{item.matchDate} · {item.leagueName}</div>
                        <div className="text-[13px] font-semibold text-white truncate">
                          {item.homeTeam} <span className="text-[#8B8FA3] font-normal">vs</span> {item.awayTeam}
                        </div>
                      </div>
                      {/* 比分 */}
                      <span className="text-sm font-bold font-mono flex-shrink-0" style={{ color: '#00D68F' }}>{item.score}</span>
                      {/* 半全场 */}
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ color: getHafuColor(item.hafuResult), background: `${getHafuColor(item.hafuResult)}15`, border: `1px solid ${getHafuColor(item.hafuResult)}30` }}>
                        {HAFU_MAP[item.hafuResult] || item.hafuResult}
                      </span>
                      <ChevronRight size={14} color="#8B8FA3" className="flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
