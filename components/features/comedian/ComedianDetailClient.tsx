'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import type {
  Comedian,
  ComedianWithPoints,
  Performance,
  Event,
} from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/features/favorite/FavoriteButton';

interface ComedianDetailClientProps {
  comedian: Comedian;
  comedianWithPoints?: ComedianWithPoints;
  performances: Performance[];
  events: Event[];
}

export function ComedianDetailClient({
  comedian,
  comedianWithPoints,
  performances,
  events,
}: ComedianDetailClientProps) {
  const [activeTab, setActiveTab] = useState<
    'metrics' | 'achievements' | 'schedule' | 'analysis'
  >('metrics');
  const tabContentRef = useRef<HTMLDivElement>(null);

  // パフォーマンスとイベントを結合
  const performancesWithEvents = performances
    .map((perf) => {
      const event = events.find((e) => e.id === perf.event_id);
      return event ? { ...perf, event } : null;
    })
    .filter(
      (p): p is Performance & { event: Event } => p !== null
    )
    .sort((a, b) => {
      const dateA = new Date(a.event.date);
      const dateB = new Date(b.event.date);
      return dateB.getTime() - dateA.getTime();
    });

  // 3位以内の実績
  const top3Achievements = performancesWithEvents.filter(
    (p) => p.rank !== null && p.rank <= 3
  );

  // タブ切り替え時のアニメーション
  useEffect(() => {
    if (tabContentRef.current) {
      animate({
        targets: tabContentRef.current,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 芸人プロフィールヘッダー */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {comedian.image_url ? (
              <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={comedian.image_url}
                  alt={comedian.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
            ) : (
              <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-lg">
                  {comedian.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <CardTitle className="text-2xl sm:text-3xl">{comedian.name}</CardTitle>
                <FavoriteButton type="comedian" targetId={comedian.id} />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {comedianWithPoints && (
                  <div>
                    <span className="font-medium">ランキング:</span> {comedianWithPoints.rank}位
                  </div>
                )}
                {comedianWithPoints && (
                  <div>
                    <span className="font-medium">総ポイント:</span>{' '}
                    {comedianWithPoints.totalPoints.toLocaleString()}pt
                  </div>
                )}
                {comedian.agency && (
                  <div>
                    <span className="font-medium">所属事務所:</span> {comedian.agency}
                  </div>
                )}
                {comedian.bio && (
                  <div className="mt-4">
                    <p className="text-foreground">{comedian.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* タブナビゲーション */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="metrics">メトリクス</TabsTrigger>
          <TabsTrigger value="achievements">実績</TabsTrigger>
          <TabsTrigger value="schedule">予定</TabsTrigger>
          <TabsTrigger value="analysis">分析</TabsTrigger>
        </TabsList>

        <div ref={tabContentRef}>
          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ランキング情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comedianWithPoints ? (
                  <>
                    <div>
                      <span className="font-medium">現在のランキング:</span>{' '}
                      {comedianWithPoints.rank}位
                    </div>
                    <div>
                      <span className="font-medium">総獲得ポイント:</span>{' '}
                      {comedianWithPoints.totalPoints.toLocaleString()}pt
                    </div>
                    {comedian.trend && (
                      <div>
                        <span className="font-medium">トレンド:</span>{' '}
                        {comedian.trend === 'up'
                          ? '上昇'
                          : comedian.trend === 'down'
                            ? '下降'
                            : '安定'}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    ランキング情報がありません
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>3位以内の実績</CardTitle>
              </CardHeader>
              <CardContent>
                {top3Achievements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    3位以内の実績がありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {top3Achievements.map((perf) => (
                      <Link
                        key={perf.id}
                        href={`/event/${perf.event.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 text-center font-bold text-lg">
                          #{perf.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{perf.event.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {perf.event.date_display || perf.event.date.split('T')[0]}
                            {perf.event.tier && ` • ティア: ${perf.event.tier}`}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>パフォーマンス履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {performancesWithEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    パフォーマンス履歴がありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {performancesWithEvents.map((perf) => (
                      <Link
                        key={perf.id}
                        href={`/event/${perf.event.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          {perf.rank !== null ? (
                            <span className="font-bold">#{perf.rank}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{perf.event.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {perf.event.date_display || perf.event.date.split('T')[0]}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>今後の出演予定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  出演予定の情報がありません
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ランキング推移グラフ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  グラフ機能は今後実装予定です
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
