import { createClient } from '@/lib/supabase/server';
import { PredictionsPageClient } from '@/components/features/predictions/PredictionsPageClient';
import { redirect } from 'next/navigation';
import { isPredictableEvent } from '@/lib/utils/predictionUtils';
import type { Event } from '@/lib/types';

export default async function PredictionsPage() {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/predictions');
  }

  // 予想可能なイベントを取得（主要4大会のみ）
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('イベントデータ取得エラー:', error);
  }

  // 予想可能なイベントのみをフィルタリング
  const predictableEvents: Event[] = (events || [])
    .filter((event) =>
      isPredictableEvent(event.brand, event.format_type || '')
    )
    .map((event) => ({
      ...event,
      tier: (event.tier as Event['tier']) || null,
      format_type: (event.format_type as Event['format_type']) || 'absolute-judge',
      block_results: event.block_results as Event['block_results'],
      schedules: event.schedules as Event['schedules'],
      ticket_urls: event.ticket_urls as Event['ticket_urls'],
    }));

  // ユーザーの予想を取得
  const { data: predictions } = await supabase
    .from('event_predictions')
    .select('*')
    .eq('user_id', user.id);

  return (
    <PredictionsPageClient
      events={predictableEvents}
      userPredictions={predictions || []}
    />
  );
}
