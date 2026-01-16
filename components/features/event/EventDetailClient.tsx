'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event, Performance, Comedian } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PredictionInput } from '@/components/features/prediction/PredictionInput';
import { PredictionResultDisplay } from '@/components/features/prediction/PredictionResultDisplay';
import { isPredictableEvent } from '@/lib/utils/predictionUtils';
import { FavoriteButton } from '@/components/features/favorite/FavoriteButton';

interface EventDetailClientProps {
  event: Event;
  performances: Performance[];
  comedians: Comedian[];
  userPrediction?: {
    id: string;
    predictions: unknown;
    total_bet_points: number;
    paid_out: boolean;
    created_at: string;
  } | null;
}

// アニメーション設定
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export function EventDetailClient({
  event,
  performances,
  comedians,
  userPrediction,
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performers' | 'prediction'>(
    'overview'
  );
  
  // 予想可能かどうか
  const isPredictable = isPredictableEvent(event.brand, event.format_type);

  // パフォーマンスと芸人を結合
  const performancesWithComedians = performances
    .map((perf) => {
      const comedian = comedians.find((c) => c.id === perf.comedian_id);
      return comedian ? { ...perf, comedian } : null;
    })
    .filter((p): p is Performance & { comedian: Comedian } => p !== null)
    .sort((a, b) => {
      if (a.rank === null && b.rank === null) return 0;
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* イベント基本情報 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {event.image_url ? (
                <motion.div
                  className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={event.image_url}
                    alt={event.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 192px"
                  />
                </motion.div>
              ) : (
                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">画像なし</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <CardTitle className="text-2xl sm:text-3xl">{event.name}</CardTitle>
                  <FavoriteButton type="event" targetId={event.id} />
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(event.date_display || event.date) && (
                    <div>
                      <span className="font-medium">開催日:</span>{' '}
                      {event.date_display ||
                        (event.date_tbd
                          ? '未定'
                          : new Date(event.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }))}
                    </div>
                  )}
                  {event.tier && (
                    <div>
                      <span className="font-medium">ティア:</span> {event.tier}
                    </div>
                  )}
                  {event.brand && (
                    <div>
                      <span className="font-medium">ブランド:</span> {event.brand}
                    </div>
                  )}
                  {event.venue && (
                    <div>
                      <span className="font-medium">会場:</span> {event.venue}
                    </div>
                  )}
                  {event.bio && (
                    <div className="mt-4">
                      <p className="text-foreground">{event.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="performers">参加芸人</TabsTrigger>
          {isPredictable && (
            <TabsTrigger value="prediction">予想</TabsTrigger>
          )}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TabsContent value="overview" className="space-y-4" forceMount={activeTab === 'overview'}>
              <Card>
                <CardHeader>
                  <CardTitle>イベント情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.format && (
                    <div>
                      <span className="font-medium">フォーマット:</span> {event.format}
                    </div>
                  )}
                  {event.start_time && (
                    <div>
                      <span className="font-medium">開始時間:</span> {event.start_time}
                    </div>
                  )}
                  {event.viewing_method && (
                    <div>
                      <span className="font-medium">視聴方法:</span> {event.viewing_method}
                    </div>
                  )}
                  {event.prize_money && (
                    <div>
                      <span className="font-medium">賞金:</span> {event.prize_money.toLocaleString()}円
                    </div>
                  )}
                  {event.official_url && (
                    <div>
                      <span className="font-medium">公式サイト:</span>{' '}
                      <a
                        href={event.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {event.official_url}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performers" className="space-y-4" forceMount={activeTab === 'performers'}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    参加芸人 ({performancesWithComedians.length}名)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performancesWithComedians.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      参加芸人の情報がありません
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {performancesWithComedians.map((perf, index) => (
                        <motion.div
                          key={perf.id}
                          custom={index}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        >
                          <Link
                            href={`/comedian/${perf.comedian.id}`}
                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex-shrink-0 w-12 text-center font-bold">
                              {perf.rank !== null ? (
                                <span className="text-lg">#{perf.rank}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                            {perf.comedian.image_url && (
                              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={perf.comedian.image_url}
                                  alt={perf.comedian.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{perf.comedian.name}</div>
                              {perf.comedian.agency && (
                                <div className="text-sm text-muted-foreground">
                                  {perf.comedian.agency}
                                </div>
                              )}
                            </div>
                            {perf.score !== null && (
                              <div className="text-sm text-muted-foreground">
                                スコア: {perf.score}
                              </div>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isPredictable && (
              <TabsContent value="prediction" className="space-y-4" forceMount={activeTab === 'prediction'}>
                {userPrediction ? (
                  <PredictionResultDisplay
                    event={event}
                    prediction={userPrediction}
                    performances={performances}
                    comedians={comedians}
                  />
                ) : (
                  <PredictionInput
                    event={event}
                    performers={performancesWithComedians.map((p) => p.comedian)}
                  />
                )}
              </TabsContent>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
