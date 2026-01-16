'use client';

import type { Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventListProps {
  events: Event[];
}

// イベントステータスを判定
function getEventStatus(event: Event): 'upcoming' | 'ongoing' | 'ended' {
  if (event.date_tbd) return 'upcoming';
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (eventDate < today) return 'ended';
  if (eventDate.getTime() === today.getTime()) return 'ongoing';
  return 'upcoming';
}

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <motion.div
        className="text-center py-12 text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="mb-4">該当するイベントがありません</p>
        <Button asChild variant="outline">
          <Link href="/events">イベント一覧を見る</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-3 sm:space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {events.map((event) => {
        const status = getEventStatus(event);
        const statusLabels = {
          upcoming: '開催予定',
          ongoing: '開催中',
          ended: '終了',
        };
        const statusVariants = {
          upcoming: 'secondary' as const,
          ongoing: 'default' as const,
          ended: 'outline' as const,
        };

        return (
          <motion.div
            key={event.id}
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              y: -4,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={`/event/${event.id}`}
              className="block touch-manipulation group"
            >
              <Card className="hover:shadow-lg active:bg-accent transition-shadow duration-200 cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* 画像 */}
                    {event.image_url ? (
                      <div className="relative w-full sm:w-32 h-48 sm:h-auto sm:flex-shrink-0 overflow-hidden">
                        <Image
                          src={event.image_url}
                          alt={event.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 128px"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full sm:w-32 h-48 sm:h-auto sm:flex-shrink-0 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">画像なし</span>
                      </div>
                    )}
                    {/* コンテンツ */}
                    <div className="flex-1 p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {event.name}
                        </h3>
                        <Badge variant={statusVariants[status]} className="shrink-0">
                          {statusLabels[status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                        {event.tier && (
                          <Badge variant="outline" className="text-xs">
                            ティア: {event.tier}
                          </Badge>
                        )}
                        {(event.date_display || event.date) && (
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {event.date_display || 
                              new Date(event.date).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                          </span>
                        )}
                        {event.brand && (
                          <Badge variant="secondary" className="text-xs">
                            {event.brand}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
