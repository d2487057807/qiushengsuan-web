/**
 * 赔率计算工具函数
 */

/**
 * 计算让球胜平负结果
 * @param homeScore 主队进球
 * @param awayScore 客队进球
 * @param goalLine 让球数（负数表示主队让球）
 * @returns 'H' 主胜 / 'D' 平 / 'A' 客胜
 */
export function calcHhadResult(
  homeScore: number,
  awayScore: number,
  goalLine: number
): 'H' | 'D' | 'A' {
  // 让球后的比分差
  const diff = homeScore + goalLine - awayScore;
  if (diff > 0) return 'H';
  if (diff < 0) return 'A';
  return 'D';
}

/**
 * 让球结果文本
 */
export function getHhadText(result: string): string {
  switch (result) {
    case 'H':
      return '让胜';
    case 'D':
      return '让平';
    case 'A':
      return '让负';
    default:
      return '-';
  }
}

/**
 * 半全场结果文本
 * @param hafu 如 "HH", "HD", "AA" 等
 */
export function getHafuText(hafu: string): string {
  const map: Record<string, string> = {
    HH: '胜胜',
    HD: '胜平',
    HA: '胜负',
    DH: '平胜',
    DD: '平平',
    DA: '平负',
    AH: '负胜',
    AD: '负平',
    AA: '负负',
  };
  return map[hafu] || '-';
}

/**
 * 格式化总进球数
 * >=7 显示为 "7+"
 */
export function formatGoals(val: string | number): string {
  const num = typeof val === 'string' ? parseInt(val, 10) : val;
  if (isNaN(num)) return '-';
  return num >= 7 ? '7+' : String(num);
}

/**
 * 赛事状态文本
 */
export function getMatchStatusText(status: string): string {
  switch (status) {
    case '0':
      return '数据缺失';
    case '2':
      return '已结束';
    default:
      return '未知';
  }
}

/**
 * 胜平负结果文本
 */
export function getWinFlagText(flag: string): string {
  switch (flag) {
    case 'H':
      return '胜';
    case 'D':
      return '平';
    case 'A':
      return '负';
    default:
      return '-';
  }
}

/**
 * 胜平负结果颜色类名
 */
export function getResultColorClass(result: string): string {
  switch (result) {
    case 'H':
      return 'text-green-400';
    case 'D':
      return 'text-blue-400';
    case 'A':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * 胜平负结果背景色
 */
export function getResultBgClass(result: string): string {
  switch (result) {
    case 'H':
      return 'bg-green-500/20 text-green-400';
    case 'D':
      return 'bg-blue-500/20 text-blue-400';
    case 'A':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

/**
 * 联赛颜色映射
 */
export function getLeagueColor(leagueName: string): string {
  const colors: Record<string, string> = {
    '英超': '#E03E3E',
    '西甲': '#F59E0B',
    '德甲': '#10B981',
    '法甲': '#3B82F6',
    '意甲': '#6B7280',
  };
  return colors[leagueName] || '#8B8FA3';
}

/**
 * 计算让球结果（从比分和让球数）
 */
export function calcHandicapResult(
  homeScore: number,
  awayScore: number,
  goalLine: number
): string {
  return calcHhadResult(homeScore, awayScore, goalLine);
}
