'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event, EventTier } from '@/lib/types';
import { EventList } from '@/components/features/event/EventList';
import { Button } from '@/components/ui/button';

interface EventsPageClientProps {
  events: Event[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [selectedTier, setSelectedTier] = useState<EventTier | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>(
    'all'
  );

  // ブランド一覧を取得
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    events.forEach((event) => {
      if (event.brand) brandSet.add(event.brand);
    });
    return Array.from(brandSet).sort();
  }, [events]);

  // フィルタリング
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // ティアフィルタリング
      if (selectedTier !== 'all') {
        if (!event.tier || event.tier !== selectedTier) return false;
      }

      // ブランドフィルタリング
      if (selectedBrand !== 'all') {
        if (!event.brand || event.brand !== selectedBrand) return false;
      }

      // 日付フィルタリング
      if (dateFilter !== 'all') {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'upcoming' && eventDate < today) return false;
        if (dateFilter === 'past' && eventDate >= today) return false;
      }

      return true;
    });
  }, [events, selectedTier, selectedBrand, dateFilter]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">イベント一覧</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          お笑いイベントの一覧を表示します
        </p>
      </motion.div>

      {/* フィルター */}
      <motion.div
        className="mb-4 sm:mb-6 space-y-3 sm:space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* ティアフィルター */}
        <div>
          <label className="text-xs sm:text-sm font-medium mb-2 block">ティア</label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button
              onClick={() => setSelectedTier('all')}
              variant={selectedTier === 'all' ? 'default' : 'outline'}
              size="sm"
              className="text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] touch-manipulation"
            >
              すべて
            </Button>
            {(['S', 'A', 'B', 'C', 'D', 'E'] as EventTier[]).map((tier) => (
              <Button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                variant={selectedTier === tier ? 'default' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] touch-manipulation"
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>

        {/* ブランドフィルター */}
        {brands.length > 0 && (
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block">ブランド</label>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                onClick={() => setSelectedBrand('all')}
                variant={selectedBrand === 'all' ? 'default' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm touch-manipulation"
              >
                すべて
              </Button>
              {brands.map((brand) => (
                <Button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  variant={selectedBrand === brand ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs sm:text-sm touch-manipulation"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 日付フィルター */}
        <div>
          <label className="text-xs sm:text-sm font-medium mb-2 block">日付</label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {(['all', 'upcoming', 'past'] as const).map((filter) => (
              <Button
                key={filter}
                onClick={() => setDateFilter(filter)}
                variant={dateFilter === filter ? 'default' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm touch-manipulation"
              >
                {filter === 'all'
                  ? 'すべて'
                  : filter === 'upcoming'
                    ? '開催予定'
                    : '終了済み'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* イベント一覧（アニメーション対象） */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedTier}-${selectedBrand}-${dateFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EventList events={filteredEvents} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
