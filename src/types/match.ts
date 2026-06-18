/**
 * 赛事相关类型定义
 */

// 联赛信息
export interface League {
  leagueId: string;
  leagueName: string;
  leagueColor?: string;
}

// 赛事基本信息
export interface MatchInfo {
  matchId: number;
  matchNo: string;
  leagueName: string;
  leagueColor?: string;
  matchNum: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  businessDate: string;
  matchStatus: string; // '0' 数据缺失, '2' 已结束
}

// 在售赛事（含赔率）
export interface OnSaleMatch extends MatchInfo {
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
}

// 赛事详情（/match/detail 接口返回）
export interface MatchDetail extends MatchInfo {
  score: string;          // "3:1"
  halfScore: string;      // "1:0"
  winFlag: string;        // "H"/"D"/"A"
  hadList: HadOddsItem[];
  hhadList: HhadOddsItem[];
  ttgList: TtgOddsItem[];
  crsList: CrsOddsItem[];
  hafuList: HafuOddsItem[];
  result: MatchResult;
}

// 胜平负赔率项
export interface HadOddsItem {
  datetime: string;
  homeWin: number;
  draw: number;
  awayWin: number;
}

// 让球胜平负赔率项
export interface HhadOddsItem {
  datetime: string;
  goalLine: string;
  homeWin: number;
  draw: number;
  awayWin: number;
}

// 总进球赔率项
export interface TtgOddsItem {
  datetime: string;
  goal0: number;
  goal1: number;
  goal2: number;
  goal3: number;
  goal4: number;
  goal5: number;
  goal6: number;
  goal7: number;
}

// 比分赔率项
export interface CrsOddsItem {
  datetime: string;
  homeScore: number;
  awayScore: number;
  odds: number;
}

// 半全场赔率项
export interface HafuOddsItem {
  datetime: string;
  halfResult: string;
  fullResult: string;
  odds: number;
}

// 比赛结果
export interface MatchResult {
  hadResult: string;      // "H"/"D"/"A"
  hadOdds: number;
  hhadGoalLine: string;   // "-1"
  hhadResult: string;     // "H"/"D"/"A"
  hhadOdds: number;
  crsResult: string;      // "3:1"
  crsOdds: number;
  ttgResult: number;      // 0-7
  ttgOdds: number;
  hafuResult: string;     // "HH"
  hafuOdds: number;
}

// 赔率走势数据点
export interface OddsPoint {
  publishTime: string;
  homeWin: number;
  draw: number;
  awayWin: number;
}

// 让球赔率走势数据点
export interface HhadOddsPoint extends OddsPoint {
  goalLine: number;
}

// 比分赔率
export interface CrsOdds {
  score: string; // 如 "1:0", "2:1"
  odds: number;
}

// 总进球赔率
export interface TtgOdds {
  goals: string; // "0"-"6", "7+"
  odds: number;
}

// 半全场赔率
export interface HafuOdds {
  result: string; // "HH", "HD", "HA", "DH", "DD", "DA", "AH", "AD", "AA"
  odds: number;
}

// 校准统计行（/match/analysis/{playType} 接口返回）
export interface CalibrationRow {
  playType: string;       // "HAD"/"HHAD" 等
  outcome: string;        // "主胜"/"平局"/"客胜"
  impliedProb: number;    // 隐含概率（小数，如 0.7082）
  actualProb: number;     // 实际概率（小数）
  deviation: number;      // 偏差（小数）
  sampleCount: number;    // 样本数
}

// 相似比赛
// 相似比赛（/match/similar 接口返回）
export interface SimilarMatch {
  matchId: number;
  matchDate: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  score: string;          // "0:1"
  winFlag: string;        // "H"/"D"/"A"
  goalLine: string;       // "-1"
  hafuResult: string;     // "AA"
  similarity: number;     // 0-100
  roi: number;            // 投资回报率
}

// 历史赛事查询参数
export interface HistoryQueryParams {
  beginDate?: string;
  endDate?: string;
  leagueName?: string;
  hafuResult?: string;
  teamName?: string;
  pageNum: number;
  pageSize: number;
}

// 历史赛事
export interface HistoryMatch {
  matchId: number;
  matchNum: string;
  matchDate: string;
  matchTime: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  score: string;       // "3:1"
  winFlag: string;     // "H"/"D"/"A" 或空字符串
  goalLine: string;    // "-1"/"+1"
  hafuResult: string;  // "HH"/"DD"/"AA" 等
}

// 数据分析
export interface AnalysisData {
  // 赔率概率解读
  oddsProbability?: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  // 联赛特征
  leagueStats?: {
    homeWinRate: number;
    drawRate: number;
    awayWinRate: number;
    avgGoals: number;
    over25Rate: number;
  };
  // 球队近况
  teamForm?: {
    homeTeam: TeamForm;
    awayTeam: TeamForm;
  };
  // 交锋历史
  headToHead?: HeadToHeadMatch[];
  // 主客场差异
  homeAwayDiff?: {
    homeTeamHome: TeamPerformance;
    homeTeamAway: TeamPerformance;
    awayTeamHome: TeamPerformance;
    awayTeamAway: TeamPerformance;
  };
}

// 球队近况
export interface TeamForm {
  last5: {
    winRate: number;
    drawRate: number;
    loseRate: number;
    avgGoalsScored: number;
    avgGoalsConceded: number;
    unbeatenRate: number;
    cleanSheetRate: number;
  };
  last10: {
    winRate: number;
    drawRate: number;
    loseRate: number;
    avgGoalsScored: number;
    avgGoalsConceded: number;
    unbeatenRate: number;
    cleanSheetRate: number;
  };
}

// 交锋历史比赛
export interface HeadToHeadMatch {
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeHalfScore: number;
  awayHalfScore: number;
  result: string; // H/D/A
}

// 球队表现
export interface TeamPerformance {
  matches: number;
  winRate: number;
  drawRate: number;
  loseRate: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
}

// 赛事分组（按日期）
export interface MatchGroup {
  businessDate: string;
  matches: OnSaleMatch[];
}

// 玩法类型
export type PlayType = 'had' | 'hhad' | 'crs' | 'ttg' | 'hafu';
