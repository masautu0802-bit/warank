'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PredictionsPageClientProps {
  events: Event[];
  userPredictions: Array<{
    id: string;
    event_id: string;
    predictions: unknown;
    created_at: string;
  }>;
}

export function PredictionsPageClient({
  events,
  userPredictions,
}: PredictionsPageClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // ブランドごとにグループ化
  const eventsByBrand = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach((event) => {
      const brand = event.brand || 'other';
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(event);
    });
    return grouped;
  }, [events]);

  // ブランド一覧
  const brands = useMemo(() => {
    return Object.keys(eventsByBrand).sort();
  }, [eventsByBrand]);

  // フィルタリングされたイベント
  const filteredEvents = useMemo(() => {
    if (selectedBrand === 'all') {
      return events;
    }
    return eventsByBrand[selectedBrand] || [];
  }, [selectedBrand, events, eventsByBrand]);

  // イベントのステータスを判定
  const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'ended' => {
    if (event.date_tbd) return 'upcoming';
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) return 'ended';
    if (eventDate.getTime() === today.getTime()) return 'ongoing';
    return 'upcoming';
  };

  // ユーザーが予想しているかどうか
  const hasPrediction = (eventId: string): boolean => {
    return userPredictions.some((p) => p.event_id === eventId);
  };

  // アニメーションは後で実装

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">予想一覧</h1>
        <p className="text-muted-foreground">
          主要4大会の予想を行えます
        </p>
      </div>

      {/* ブランドフィルター */}
      {brands.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedBrand('all')}
              variant={selectedBrand === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              すべて
            </Button>
            {brands.map((brand) => (
              <Button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                variant={selectedBrand === brand ? 'default' : 'outline'}
                size="sm"
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* イベント一覧 */}
      <div  className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              予想可能なイベントがありません
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const hasPred = hasPrediction(event.id);

            return (
              <Card key={event.id} className="hover:bg-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{event.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {event.date_display && <span>{event.date_display}</span>}
                        {event.tier && (
                          <span className="px-2 py-1 rounded bg-muted">
                            ティア: {event.tier}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded ${
                            status === 'upcoming'
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                              : status === 'ongoing'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                                : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {status === 'upcoming'
                            ? '開催予定'
                            : status === 'ongoing'
                              ? '開催中'
                              : '終了'}
                        </span>
                        {hasPred && (
                          <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                            予想済み
                          </span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant={hasPred ? 'outline' : 'default'}>
                      <Link h`}>
                        {hasPred ? '予想を確認' : '予想する'}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
