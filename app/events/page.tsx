import { createClient } from '@/lib/supabase/server';
import { EventsPageClient } from '@/components/features/event/EventsPageClient';
import type { Event } from '@/lib/types';

export default async function EventsPage() {
  const supabase = await createClient();

  // イベントデータを取得
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('イベントデータ取得エラー:', error);
  }

  // 型変換
  const typedEvents: Event[] = (events || []).map((event) => ({
    ...event,
    tier: (event.tier as Event['tier']) || null,
    format_type: (event.format_type as Event['format_type']) || 'absolute-judge',
    block_results: event.block_results as Event['block_results'],
    schedules: event.schedules as Event['schedules'],
    ticket_urls: event.ticket_urls as Event['ticket_urls'],
  }));

  return <EventsPageClient events={typedEvents} />;
}
