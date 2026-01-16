'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppData, EventTier } from '@/lib/types';
import { EventList } from '@/components/features/event/EventList';
import { RankingSidebar } from '@/components/features/ranking/RankingSidebar';
import { DateSlider } from '@/components/features/home/DateSlider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HomePageClientProps {
  initialData: AppData;
}

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const quickAccessVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export function HomePageClient({ initialData }: HomePageClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [maxTier, setMaxTier] = useState<EventTier>('E');
  const [showOnlyMajor4Brands, setShowOnlyMajor4Brands] = useState(false);

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

  // 上位10名のランキング
  const topRankings = useMemo(() => {
    return Object.values(initialData.comedians)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
  }, [initialData.comedians]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      {/* クイックアクセス */}
      <motion.div
        className="mb-6 md:mb-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2
          className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
          variants={itemVariants}
        >
          クイックアクセス
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {[
            { href: '/rankings', title: '全ランキング', desc: '全芸人のランキングを見る' },
            { href: '/events', title: 'イベント一覧', desc: '全てのイベントを見る' },
            { href: '/predictions', title: '予想', desc: '主要4大会の予想' },
            { href: '/prediction-analysis', title: '予想分析', desc: '予想結果を分析' },
          ].map((item, index) => (
            <motion.div key={item.href} variants={quickAccessVariants}>
              <Button asChild variant="outline" className="h-auto py-4 sm:py-5 md:py-6 flex-col w-full">
                <Link href={item.href}>
                  <span className="text-sm sm:text-base md:text-lg font-semibold mb-1">{item.title}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {item.desc}
                  </span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <DateSlider
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* フィルター */}
          <motion.div
            className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
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
          </motion.div>

          {/* イベント一覧（アニメーション対象） */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedDate}-${maxTier}-${showOnlyMajor4Brands}`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
            >
              <EventList events={filteredEvents} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ランキングサイドバー */}
        <motion.div
          className="lg:col-span-1 order-1 lg:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <RankingSidebar rankings={topRankings} />
        </motion.div>
      </div>
    </div>
  );
}
