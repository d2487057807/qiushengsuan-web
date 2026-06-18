/**
 * Recharts 图表主题配置
 */

export const CHART_THEME = {
  // 颜色
  colors: {
    win: '#00D68F',      // 主胜 - 绿色（与设计稿一致）
    draw: '#3B82F6',     // 平局 - 蓝色
    lose: '#FF4D6A',     // 客负 - 红色（与设计稿一致）
    primary: '#00D68F',  // 主色
    warning: '#F59E0B',  // 警告色
    purple: '#8B5CF6',   // 紫色
    cyan: '#06B6D4',     // 青色
    pink: '#EC4899',     // 粉色
  },

  // 背景
  background: 'transparent',

  // 文字
  text: {
    primary: '#FFFFFF',
    secondary: '#8B8FA3',
  },

  // 网格
  grid: {
    stroke: '#2A2D3A',
    strokeDasharray: '3 3',
  },

  // 坐标轴
  axis: {
    stroke: '#2A2D3A',
    tickFill: '#8B8FA3',
  },

  // 提示框
  tooltip: {
    background: '#1A1D28',
    border: '#2A2D3A',
    text: '#FFFFFF',
  },
};

// 赔率走势图系列颜色
export const ODDS_SERIES_COLORS = [
  CHART_THEME.colors.win,   // 主胜
  CHART_THEME.colors.draw,  // 平局
  CHART_THEME.colors.lose,  // 客负
];

// 多系列颜色（用于比分、总进球、半全场等）
export const MULTI_SERIES_COLORS = [
  '#00D68F', // 绿（与设计稿一致）
  '#3B82F6', // 蓝
  '#FF4D6A', // 红（与设计稿一致）
  '#F59E0B', // 黄
  '#8B5CF6', // 紫
  '#06B6D4', // 青
  '#EC4899', // 粉
  '#14B8A6', // 青绿
];
