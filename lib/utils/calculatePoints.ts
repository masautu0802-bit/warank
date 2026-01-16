/**
 * ポイント計算ユーティリティ
 */

import type { Event, Performance, EventTier, FormatType } from '@/lib/types';

// ティアごとのマルチプライヤー
const TIER_MULTIPLIERS: Record<EventTier, number> = {
  S: 10,
  A: 7,
  B: 5,
  C: 3.5,
  D: 2,
  E: 1,
};

// ティアと順位に基づく基本ポイント
function getBasePoints(tier: EventTier | null, rank: number): number {
  if (!tier) return 0;

  // 順位に基づく基本ポイント（1位が最高）
  const rankPoints: Record<number, number> = {
    1: 100,
    2: 80,
    3: 60,
    4: 50,
    5: 40,
    6: 30,
    7: 25,
    8: 20,
    9: 15,
    10: 10,
  };

  const basePoints = rankPoints[rank] || Math.max(0, 10 - (rank - 10) * 2);
  return basePoints;
}

// イベントが過去かどうか
function isEventPast(event: Event): boolean {
  if (event.date_tbd) return false;
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}

// パフォーマンスのポイントを計算
export function calculatePerformancePoints(
  rank: number | null,
  event: Event
): number {
  if (!event.tier) return 0;

  // 順位が確定している場合
  if (rank !== null) {
    const basePoints = getBasePoints(event.tier, rank);
    const multiplier = TIER_MULTIPLIERS[event.tier];
    return Math.round(basePoints * multiplier);
  }

  // 順位がnullの場合は0（勝ち抜けポイントは別途実装が必要）
  return 0;
}

// 芸人の総ポイントを計算
export function calculateComedianTotalPoints(
  comedianId: string,
  performances: Performance[],
  events: Record<string, Event>
): number {
  // この芸人の全てのパフォーマンスを取得
  const comedianPerformances = performances.filter(
    (p) => p.comedian_id === comedianId
  );

  // シリーズごとにグループ化
  const seriesMap = new Map<
    string,
    { roundOrder: number; points: number }
  >();

  comedianPerformances.forEach((performance) => {
    const event = events[performance.event_id];
    if (!event || !isEventPast(event)) return;

    // ポイントを計算
    const points = calculatePerformancePoints(performance.rank, event);

    // シリーズ内では最も後のラウンドのみを選択
    if (event.series_id) {
      const roundOrder = event.round_order ?? 0;
      const existing = seriesMap.get(event.series_id);
      if (!existing || roundOrder > existing.roundOrder) {
        seriesMap.set(event.series_id, { roundOrder, points });
      }
    } else {
      seriesMap.set(`no-series-${performance.event_id}`, {
        roundOrder: 0,
        points,
      });
    }
  });

  // ポイントを合計
  let total = 0;
  seriesMap.forEach(({ points }) => {
    total += points;
  });

  return total;
}

// アプリケーションデータを計算
export function calculateAppData(params: {
  comedians: Array<{
    id: string;
    name: string;
    image_url: string | null;
    agency: string | null;
    trend: string | null;
    cheer_count: number;
    bio: string | null;
    created_at: string;
  }>;
  events: Array<{
    id: string;
    name: string;
    date: string;
    date_tbd: boolean;
    date_display: string | null;
    image_url: string | null;
    tier: string | null;
    format: string | null;
    format_type: string;
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
    block_results: unknown;
    schedules: unknown;
    ticket_urls: unknown;
    performers_confirmed: boolean;
    bio: string | null;
    created_at: string;
  }>;
  performances: Array<{
    id: string;
    comedian_id: string;
    event_id: string;
    rank: number | null;
    score: number | null;
    created_at: string;
  }>;
}): {
  comedians: Record<string, import('@/lib/types').ComedianWithPoints>;
  events: Record<string, Event>;
  performances: Performance[];
} {
  // イベントをRecordに変換
  const eventsRecord: Record<string, Event> = {};
  params.events.forEach((event) => {
    eventsRecord[event.id] = {
      ...event,
      tier: (event.tier as EventTier) || null,
      format_type: (event.format_type as FormatType) || 'absolute-judge',
      block_results: event.block_results as Record<string, unknown> | null,
      schedules: event.schedules as Event['schedules'],
      ticket_urls: event.ticket_urls as Event['ticket_urls'],
    };
  });

  // パフォーマンスを変換
  const performances: Performance[] = params.performances.map((p) => ({
    id: p.id,
    comedian_id: p.comedian_id,
    event_id: p.event_id,
    rank: p.rank,
    score: p.score,
    created_at: p.created_at,
  }));

  // 各芸人の総ポイントを計算
  const comediansWithPoints: Record<
    string,
    import('@/lib/types').ComedianWithPoints
  > = {};

  params.comedians.forEach((comedian) => {
    const totalPoints = calculateComedianTotalPoints(
      comedian.id,
      performances,
      eventsRecord
    );

    comediansWithPoints[comedian.id] = {
      ...comedian,
      trend: (comedian.trend as import('@/lib/types').Trend) || null,
      totalPoints,
      rank: 0, // 後でランク付け
    };
  });

  // ランク付け（総ポイント順）
  const sortedComedians = Object.values(comediansWithPoints).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  sortedComedians.forEach((comedian, index) => {
    comediansWithPoints[comedian.id].rank = index + 1;
  });

  return {
    comedians: comediansWithPoints,
    events: eventsRecord,
    performances,
  };
}
