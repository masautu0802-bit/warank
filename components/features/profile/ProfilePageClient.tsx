'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { FavoritesList } from '@/components/features/favorite/FavoritesList';

interface ProfilePageClientProps {
  user: User;
  profile: {
    id: string;
    balance: number;
    created_at: string;
  } | null;
  predictions: Array<{
    id: string;
    event_id: string;
    predictions: unknown;
    total_bet_points: number;
    paid_out: boolean;
    created_at: string;
  }>;
}

export function ProfilePageClient({
  user,
  profile,
  predictions,
}: ProfilePageClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'favorites'>('overview');

  // 初期ポイント（プロフィールがない場合）
  const balance = profile?.balance ?? 10000;

  // アニメーションは後で実装

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">プロフィール</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          アカウント情報と予想履歴を確認できます
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="predictions">予想履歴 ({predictions.length})</TabsTrigger>
          <TabsTrigger value="favorites">お気に入り</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* アカウント情報 */}
        <Card>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                メールアドレス
              </div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                ポイント残高
              </div>
              <div className="text-2xl font-bold">
                {balance.toLocaleString()}pt
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                登録日
              </div>
              <div className="font-medium">
                {new Date(user.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 予想統計 */}
        <Card>
          <CardHeader>
            <CardTitle>予想統計</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                予想総数
              </div>
              <div className="text-2xl font-bold">{predictions.length}件</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                総賭けポイント
              </div>
              <div className="text-xl font-semibold">
                {predictions
                  .reduce((sum, p) => sum + p.total_bet_points, 0)
                  .toLocaleString()}
                pt
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>予想履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div  className="space-y-2 sm:space-y-3">
                {predictions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    予想履歴がありません
                  </p>
                ) : (
                  predictions.map((prediction) => (
                    <Link
                      key={prediction.id}
                      h`}
                      className="block p-3 sm:p-4 rounded-lg border hover:bg-accent active:bg-accent transition-colors touch-manipulation"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            予想ID: {prediction.id.slice(0, 8)}...
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            賭けポイント: {prediction.total_bet_points.toLocaleString()}pt
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(prediction.created_at).toLocaleString('ja-JP')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {prediction.paid_out && (
                            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs">
                              払い戻し済み
                            </span>
                          )}
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                            詳細を見る
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesList userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
