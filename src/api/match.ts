/**
 * 赛事相关 API
 */

import request from './request';
import type { ApiResponse, PageResult } from '@/types/api';
import type {
  OnSaleMatch,
  MatchDetail,
  League,
  SimilarMatch,
  OddsPoint,
  CalibrationRow,
  AnalysisData,
  HistoryQueryParams,
  HistoryMatch,
  PlayType,
} from '@/types/match';
import type { AxiosResponse } from 'axios';

/**
 * 获取在售赛事列表
 */
export function getOnSaleList(): Promise<ApiResponse<OnSaleMatch[]>> {
  return request.post('/match/onSale');
}

/**
 * 查询历史赛事
 */
export function queryHistory(params: HistoryQueryParams): Promise<ApiResponse<PageResult<HistoryMatch>>> {
  return request.post('/match/history', params);
}

/**
 * 获取历史赛事详情
 */
export function getMatchDetail(matchId: number): Promise<ApiResponse<MatchDetail>> {
  return request.post('/match/detail', { matchId });
}

/**
 * 获取在售赛事详情
 */
export function getOnSaleDetail(matchId: string): Promise<ApiResponse<MatchDetail>> {
  return request.post('/match/onSaleDetail', { matchId });
}

/**
 * 获取联赛列表
 */
export function getLeagues(): Promise<ApiResponse<League[]>> {
  return request.post('/match/leagues');
}

/**
 * 匹配相似比赛
 */
export function matchSimilar(matchId: number): Promise<ApiResponse<SimilarMatch[]>> {
  return request.post('/match/matchSimilar', { matchId });
}

/**
 * 获取赔率走势
 */
export function getOddsTrend(matchId: number, playType: PlayType): Promise<ApiResponse<OddsPoint[]>> {
  return request.post('/match/oddsTrend', { matchId, playType });
}

/**
 * 导出历史赛事 Excel
 */
export function exportHistory(params: HistoryQueryParams & { exportType?: string }): Promise<AxiosResponse<Blob>> {
  return request.post('/match/history/export', params, {
    responseType: 'blob',
  });
}

/**
 * 获取数据分析
 */
export function getMatchAnalysis(matchId: number): Promise<ApiResponse<AnalysisData>> {
  return request.post('/match/analysis', { matchId });
}

/**
 * 获取赔率校准统计
 */
export function getOddsCalibration(matchId: number, playType: PlayType): Promise<ApiResponse<CalibrationRow[]>> {
  return request.post(`/match/analysis/${playType}`, { matchId });
}
