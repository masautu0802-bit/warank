'use client';

import { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { ComedianWithPoints } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';

interface RankingsPageClientProps {
  rankings: ComedianWithPoints[];
}

export function RankingsPageClient({ rankings }: RankingsPageClientProps) {
  const rankingsRef = useRef<HTMLDivElement>(null);

  // アニメーション（anime.js使用）
  useEffect(() => {
    if (rankingsRef.current && rankingsRef.current.children.length > 0) {
      const children = Array.from(rankingsRef.current.children) as HTMLElement[];

      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(30, { from: 'start' }),
        duration: 500,
        ease: 'easeOutQuad',
      });
    }
  }, [rankings]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">全ランキング</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          全芸人のランキングを表示します（{rankings.length}名）
        </p>
      </div>

      <div ref={rankingsRef} className="space-y-2 sm:space-y-3">
        {rankings.map((comedian) => {
          // 順位に応じたバッジのバリアント
          const getRankBadgeVariant = (rank: number) => {
            if (rank === 1) return 'default';
            if (rank === 2) return 'secondary';
            if (rank === 3) return 'outline';
            return 'outline';
          };

          // トレンドアイコン
          const getTrendIcon = (trend: string | null) => {
            if (trend === 'up') return '↑';
            if (trend === 'down') return '↓';
            return '→';
          };

          const getTrendColor = (trend: string | null) => {
            if (trend === 'up') return 'text-green-600 dark:text-green-400';
            if (trend === 'down') return 'text-red-600 dark:text-red-400';
            return 'text-muted-foreground';
          };

          return (
            <Link
              key={comedian.id}
              href={`/comedian/${comedian.id}`}
              className="block touch-manipulation group"
            >
              <Card className="hover:shadow-md active:bg-accent transition-all duration-200 cursor-pointer">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* 順位バッジ */}
                    <div className="flex-shrink-0">
                      {comedian.rank <= 3 ? (
                        <Badge
                          variant={getRankBadgeVariant(comedian.rank)}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold p-0"
                        >
                          {comedian.rank}
                        </Badge>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-base sm:text-lg">
                          {comedian.rank}
                        </div>
                      )}
                    </div>
                    {/* アバター */}
                    {comedian.image_url ? (
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                        <AvatarImage src={comedian.image_url} alt={comedian.name} />
                        <AvatarFallback>
                          {comedian.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                        <AvatarFallback>
                          {comedian.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                        {comedian.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">
                          {comedian.agency || '所属事務所不明'}
                        </div>
                        {comedian.trend && (
                          <span
                            className={`text-xs font-medium ${getTrendColor(comedian.trend)}`}
                          >
                            {getTrendIcon(comedian.trend)}{' '}
                            {comedian.trend === 'up'
                              ? '上昇'
                              : comedian.trend === 'down'
                                ? '下降'
                                : '安定'}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* ポイント */}
                    <div className="flex-shrink-0 text-right">
                      <div className="font-bold text-lg sm:text-xl text-primary">
                        {comedian.totalPoints.toLocaleString()}pt
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
