/**
 * 型定義
 */

// ティア
export type EventTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

// フォーマットタイプ
export type FormatType =
  | 'absolute-judge'
  | '3-choice'
  | 'block-elimination'
  | 'selection'
  | 'nomination-selection';

// トレンド
export type Trend = 'up' | 'down' | 'stable';

// 芸人
export interface Comedian {
  id: string;
  name: string;
  image_url: string | null;
  agency: string | null;
  trend: Trend | null;
  cheer_count: number;
  bio: string | null;
  created_at: string;
}

// イベント
export interface Event {
  id: string;
  name: string;
  date: string;
  date_tbd: boolean;
  date_display: string | null;
  image_url: string | null;
  tier: EventTier | null;
  format: string | null;
  format_type: FormatType;
  start_time: string | null;
  viewing_method: string | null;
  attendance_method: string | null;
  prize_money: number | null;
  venue: string | null;
  official_url: string | null;
  brand: string | null;
  series_id: string | null;
  round: string | null;
  round_order: number;
  block_results: Record<string, unknown> | null;
  schedules: Array<{
    date: string;
    dateDisplay: string;
    startTime?: string;
    endTime?: string;
  }> | null;
  ticket_urls: Array<{
    url: string;
    serviceName: string;
  }> | null;
  performers_confirmed: boolean;
  bio: string | null;
  created_at: string;
}

// パフォーマンス
export interface Performance {
  id: string;
  comedian_id: string;
  event_id: string;
  rank: number | null;
  score: number | null;
  created_at: string;
}

// 計算済み芸人データ（ポイント計算後）
export interface ComedianWithPoints extends Comedian {
  totalPoints: number;
  rank: number;
}

// アプリケーションデータ
export interface AppData {
  comedians: Record<string, ComedianWithPoints>;
  events: Record<string, Event>;
  performances: Performance[];
}

// 予想タイプ
export type PredictionType =
  | 'winner' // 優勝予想
  | 'top3' // 3位以内予想
  | 'finalist'; // 決勝進出予想

// 予想エントリー
export interface PredictionEntry {
  predictionType: PredictionType;
  predictedComedianIds: string[];
  betPoints: number;
  odds?: number;
}

// イベント予想
export interface EventPrediction {
  id: string;
  userId: string;
  eventId: string;
  predictions: PredictionEntry[];
  createdAt: string;
  updatedAt: string;
}

// 予想結果
export interface PredictionResult {
  eventId: string;
  eventName: string;
  predictionType: PredictionType;
  isWon: boolean;
  betPoints: number;
  odds: number;
  payout: number;
  profit: number;
  details: string;
  predictedComedianNames: string[];
  actualComedianNames: string[];
  createdAt: string;
}

// お気に入りタイプ
export type FavoriteType = 'comedian' | 'event';

// お気に入り
export interface UserFavorite {
  id: string;
  user_id: string;
  favorite_type: FavoriteType; // データベースのカラム名に合わせて変更
  favorite_id: string; // データベースのカラム名に合わせて変更
  created_at: string;
}
