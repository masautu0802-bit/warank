'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { AppData, EventTier } from '@/lib/types';
import { EventList } from '@/components/features/event/EventList';
import { RankingSidebar } from '@/components/features/ranking/RankingSidebar';
import { DateSlider } from '@/components/features/home/DateSlider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface HomePageClientProps {
  initialData: AppData;
}

export function HomePageClient({ initialData }: HomePageClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [maxTier, setMaxTier] = useState<EventTier>('E');
  const [showOnlyMajor4Brands, setShowOnlyMajor4Brands] = useState(false);
  const eventListRef = useRef<HTMLDivElement>(null);

  // 日付フィルタリング
  const filteredEvents = useMemo(() => {
    return Object.values(initialData.events).filter((event) => {
      // 日付マッチング（date_tbdがtrueのイベントは除外）
      if (selectedDate) {
        // 日付未定のイベントは除外
        if (event.date_tbd) return false;
        
        // 日付が一致しないイベントは除外
        const eventDate = event.date.split('T')[0];
        if (eventDate !== selectedDate) return false;
      }

      // ティアフィルタリング
      if (event.tier) {
        const tierOrder: Record<EventTier, number> = {
          S: 1,
          A: 2,
          B: 3,
          C: 4,
          D: 5,
          E: 6,
        };
        if (tierOrder[event.tier] > tierOrder[maxTier]) return false;
      }

      // 主要4大会フィルタリング
      if (showOnlyMajor4Brands) {
        const majorBrands = ['M1', 'R1', 'THE SECOND', 'キングオブコント'];
        if (!event.brand || !majorBrands.includes(event.brand)) return false;
      }

      return true;
    });
  }, [selectedDate, maxTier, showOnlyMajor4Brands, initialData.events]);

  // アニメーション（useEffectで安全に実行）
  useEffect(() => {
    if (eventListRef.current && eventListRef.current.children.length > 0) {
      const children = Array.from(eventListRef.current.children) as HTMLElement[];
      
      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(50, { from: 'start' }),
        duration: 500,
        ease: 'easeOutQuad',
      });
    }
  }, [filteredEvents]);

  // 上位10名のランキング
  const topRankings = useMemo(() => {
    return Object.values(initialData.comedians)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
  }, [initialData.comedians]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      {/* クイックアクセス */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">クイックアクセス</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Button asChild variant="outline" className="h-auto py-4 sm:py-5 md:py-6 flex-col">
            <Link href="/rankings">
              <span className="text-sm sm:text-base md:text-lg font-semibold mb-1">全ランキング</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                全芸人のランキングを見る
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 sm:py-5 md:py-6 flex-col">
            <Link href="/events">
              <span className="text-sm sm:text-base md:text-lg font-semibold mb-1">イベント一覧</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                全てのイベントを見る
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 sm:py-5 md:py-6 flex-col">
            <Link href="/predictions">
              <span className="text-sm sm:text-base md:text-lg font-semibold mb-1">予想</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                主要4大会の予想
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 sm:py-5 md:py-6 flex-col">
            <Link href="/prediction-analysis">
              <span className="text-sm sm:text-base md:text-lg font-semibold mb-1">予想分析</span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                予想結果を分析
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <DateSlider
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* フィルター */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {(['S', 'A', 'B', 'C', 'D', 'E'] as EventTier[]).map((tier) => (
                <Button
                  key={tier}
                  onClick={() => setMaxTier(tier)}
                  variant={maxTier === tier ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
                >
                  {tier}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setShowOnlyMajor4Brands(!showOnlyMajor4Brands)}
              variant={showOnlyMajor4Brands ? 'default' : 'outline'}
              size="sm"
              className="text-xs sm:text-sm"
            >
              主要4大会のみ
            </Button>
          </div>

          {/* イベント一覧（アニメーション対象） */}
          <div ref={eventListRef}>
            <EventList events={filteredEvents} />
          </div>
        </div>

        {/* ランキングサイドバー */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <RankingSidebar rankings={topRankings} />
        </div>
      </div>
    </div>
  );
}
