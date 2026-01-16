import { createClient } from '@/lib/supabase/server';
import { EventDetailClient } from '@/components/features/event/EventDetailClient';
import { notFound } from 'next/navigation';
import type { Event, Performance, Comedian } from '@/lib/types';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // イベントデータを取得
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // パフォーマンスデータを取得（参加芸人と順位）
  const { data: performances } = await supabase
    .from('performances')
    .select('*')
    .eq('event_id', id)
    .order('rank', { ascending: true, nullsLast: true });

  // 参加芸人のIDを取得
  const comedianIds =
    performances?.map((p) => p.comedian_id).filter(Boolean) || [];

  // 参加芸人のデータを取得
  const { data: comedians } = await supabase
    .from('comedians')
    .select('*')
    .in('id', comedianIds.length > 0 ? comedianIds : ['']);

  // 型変換
  const typedEvent: Event = {
    ...event,
    tier: (event.tier as Event['tier']) || null,
    format_type: (event.format_type as Event['format_type']) || 'absolute-judge',
    block_results: event.block_results as Event['block_results'],
    schedules: event.schedules as Event['schedules'],
    ticket_urls: event.ticket_urls as Event['ticket_urls'],
  };

  const typedPerformances: Performance[] = (performances || []).map((p) => ({
    id: p.id,
    comedian_id: p.comedian_id,
    event_id: p.event_id,
    rank: p.rank,
    score: p.score,
    created_at: p.created_at,
  }));

  const typedComedians: Comedian[] = (comedians || []).map((c) => ({
    ...c,
    trend: (c.trend as Comedian['trend']) || null,
  }));

  // ユーザーの予想を取得（認証済みの場合）
  let userPrediction = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: prediction } = await supabase
      .from('event_predictions')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();

    userPrediction = prediction;
  }

  return (
    <EventDetailClient
      event={typedEvent}
      performances={typedPerformances}
      comedians={typedComedians}
      userPrediction={userPrediction}
    />
  );
}
