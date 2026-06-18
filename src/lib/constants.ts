/**
 * 常量定义
 */

// 联赛颜色映射
export const LEAGUE_COLORS: Record<string, string> = {
  '英超': '#E03E3E',
  '西甲': '#F59E0B',
  '德甲': '#10B981',
  '法甲': '#3B82F6',
  '意甲': '#6B7280',
};

// 半全场结果标签
export const HAFU_LABELS: Record<string, string> = {
  'HH': '胜胜',
  'HD': '胜平',
  'HA': '胜负',
  'DH': '平胜',
  'DD': '平平',
  'DA': '平负',
  'AH': '负胜',
  'AD': '负平',
  'AA': '负负',
};

// 半全场结果分组（按半场结果）
export const HAFU_GROUPS = {
  home: ['HH', 'HD', 'HA'], // 半场主胜
  draw: ['DH', 'DD', 'DA'], // 半场平局
  away: ['AH', 'AD', 'AA'], // 半场客胜
};

// 比分分组（按结果）
export const CRS_GROUPS = {
  homeWin: [
    '1:0', '2:0', '2:1', '3:0', '3:1', '3:2',
    '4:0', '4:1', '4:2', '5:0', '5:1', '5:2',
  ],
  draw: ['0:0', '1:1', '2:2', '3:3'],
  awayWin: [
    '0:1', '0:2', '1:2', '0:3', '1:3', '2:3',
    '0:4', '1:4', '2:4', '0:5', '1:5', '2:5',
  ],
  other: ['其他'],
};

// 总进球选项
export const TTG_OPTIONS = [
  { value: '0', label: '0球' },
  { value: '1', label: '1球' },
  { value: '2', label: '2球' },
  { value: '3', label: '3球' },
  { value: '4', label: '4球' },
  { value: '5', label: '5球' },
  { value: '6', label: '6球' },
  { value: '7', label: '7+球' },
];

// 玩法类型
export type PlayType = 'had' | 'hhad' | 'crs' | 'ttg' | 'hafu';

// 玩法名称
export const PLAY_TYPE_NAMES: Record<PlayType, string> = {
  had: '胜平负',
  hhad: '让球胜平负',
  crs: '比分',
  ttg: '总进球',
  hafu: '半全场',
};

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 20;

// 分页大小选项
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
