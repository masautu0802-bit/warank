'use client';

import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PredictionResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface PredictionAnalysisPageClientProps {
  results: PredictionResult[];
}

export function PredictionAnalysisPageClient({
  results,
}: PredictionAnalysisPageClientProps) {

  // 統計を計算
  const stats = useMemo(() => {
    const total = results.length;
    const won = results.filter((r) => r.isWon).length;
    const winRate = total > 0 ? (won / total) * 100 : 0;
    const totalBet = results.reduce((sum, r) => sum + r.betPoints, 0);
    const totalPayout = results.reduce((sum, r) => sum + r.payout, 0);
    const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);

    return {
      total,
      won,
      winRate,
      totalBet,
      totalPayout,
      totalProfit,
    };
  }, [results]);

  // アニメーションは後で実装

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">予想分析</h1>
        <p className="text-muted-foreground">
          あなたの予想結果を分析します
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">予想総数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">的中数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.won}件</div>
            <div className="text-sm text-muted-foreground">
              的中率: {stats.winRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">総賭けポイント</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalBet.toLocaleString()}pt
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">総損益</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalProfit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {stats.totalProfit >= 0 ? '+' : ''}
              {stats.totalProfit.toLocaleString()}pt
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 予想結果一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>予想結果一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div  className="space-y-4">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                予想結果がありません
              </p>
            ) : (
              results.map((result, index) => (
                <Link
                  key={index}
                  h`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-2">{result.eventName}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">予想タイプ:</span>{' '}
                          {result.predictionType === 'winner'
                            ? '優勝予想'
                            : result.predictionType === 'top3'
                              ? '3位以内予想'
                              : '決勝進出予想'}
                        </div>
                        <div>
                          <span className="font-medium">予想:</span>{' '}
                          {result.predictedComedianNames.join('、')}
                        </div>
                        <div className="text-xs">{result.details}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          result.isWon
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {result.isWon ? '的中' : '外れ'}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          賭け: {result.betPoints.toLocaleString()}pt
                        </div>
                        <div className="text-sm text-muted-foreground">
                          オッズ: {result.odds.toFixed(1)}倍
                        </div>
                        <div
                          className={`font-semibold ${
                            result.profit >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {result.profit >= 0 ? '+' : ''}
                          {result.profit.toLocaleString()}pt
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
