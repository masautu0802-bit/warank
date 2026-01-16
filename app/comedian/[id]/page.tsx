import { createClient } from '@/lib/supabase/server';
import { ComedianDetailClient } from '@/components/features/comedian/ComedianDetailClient';
import { notFound } from 'next/navigation';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import type { Comedian, Performance, Event } from '@/lib/types';

interface ComedianDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComedianDetailPage({
  params,
}: ComedianDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 芸人データを取得
  const { data: comedian, error: comedianError } = await supabase
    .from('comedians')
    .select('*')
    .eq('id', id)
    .single();

  if (comedianError || !comedian) {
    notFound();
  }

  // この芸人のパフォーマンスを取得
  const { data: performances } = await supabase
    .from('performances')
    .select('*')
    .eq('comedian_id', id)
    .order('created_at', { ascending: false });

  // 関連するイベントIDを取得
  const eventIds =
    performances?.map((p) => p.event_id).filter(Boolean) || [];

  // 関連するイベントデータを取得
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds.length > 0 ? eventIds : ['']);

  // 全データを取得してポイント計算
  const [allComediansResult, allEventsResult, allPerformancesResult] =
    await Promise.all([
      supabase.from('comedians').select('*'),
      supabase.from('events').select('*'),
      supabase.from('performances').select('*'),
    ]);

  const appData = calculateAppData({
    comedians: allComediansResult.data || [],
    events: allEventsResult.data || [],
    performances: allPerformancesResult.data || [],
  });

  // 型変換
  const typedComedian: Comedian = {
    ...comedian,
    trend: (comedian.trend as Comedian['trend']) || null,
  };

  const typedPerformances: Performance[] = (performances || []).map((p) => ({
    id: p.id,
    comedian_id: p.comedian_id,
    event_id: p.event_id,
    rank: p.rank,
    score: p.score,
    created_at: p.created_at,
  }));

  const typedEvents: Event[] = (events || []).map((e) => ({
    ...e,
    tier: (e.tier as Event['tier']) || null,
    format_type: (e.format_type as Event['format_type']) || 'absolute-judge',
    block_results: e.block_results as Event['block_results'],
    schedules: e.schedules as Event['schedules'],
    ticket_urls: e.ticket_urls as Event['ticket_urls'],
  }));

  // この芸人のランキング情報を取得
  const comedianWithPoints = appData.comedians[comedian.id];

  return (
    <ComedianDetailClient
      comedian={typedComedian}
      comedianWithPoints={comedianWithPoints}
      performances={typedPerformances}
      events={typedEvents}
    />
  );
}
