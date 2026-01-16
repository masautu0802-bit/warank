'use client';

import { useMemo } from 'react';
import type {
  Event,
  Performance,
  Comedian,
  PredictionEntry,
  PredictionResult,
} from '@/lib/types';
import {
  checkPredictionWin,
  getPredictionDetails,
} from '@/lib/utils/predictionUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PredictionResultDisplayProps {
  event: Event;
  prediction: {
    id: string;
    predictions: unknown;
    total_bet_points: number;
    paid_out: boolean;
    created_at: string;
  };
  performances: Performance[];
  comedians: Comedian[];
}

export function PredictionResultDisplay({
  event,
  prediction,
  performances,
  comedians,
}: PredictionResultDisplayProps) {
  // 予想データをパース
  const predictionEntries = useMemo(() => {
    try {
      const preds = prediction.predictions as PredictionEntry[];
      return Array.isArray(preds) ? preds : [];
    } catch {
      return [];
    }
  }, [prediction.predictions]);

  // 実際のパフォーマンス（順位確定済み）
  const actualPerformances = useMemo(() => {
    return performances
      .filter((p) => p.rank !== null)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999));
  }, [performances]);

  // 芸人名のマッピング
  const comedianNames = useMemo(() => {
    const names: Record<string, string> = {};
    comedians.forEach((c) => {
      names[c.id] = c.name;
    });
    return names;
  }, [comedians]);

  // 予想結果を計算
  const results = useMemo((): PredictionResult[] => {
    return predictionEntries.map((entry) => {
      const isWon = checkPredictionWin(
        entry.predictionType,
        entry.predictedComedianIds,
        actualPerformances
      );
      const odds = entry.odds || 1;
      const payout = isWon ? entry.betPoints * odds : 0;
      const profit = payout - entry.betPoints;

      const details = getPredictionDetails(
        entry.predictionType,
        entry.predictedComedianIds,
        actualPerformances,
        comedianNames
      );

      return {
        eventId: event.id,
        eventName: event.name,
        predictionType: entry.predictionType,
        isWon,
        betPoints: entry.betPoints,
        odds,
        payout,
        profit,
        details,
        predictedComedianNames: entry.predictedComedianIds.map(
          (id) => comedianNames[id] || '不明'
        ),
        actualComedianNames: actualPerformances
          .slice(0, entry.predictionType === 'winner' ? 1 : 3)
          .map((p) => comedianNames[p.comedian_id] || '不明'),
        createdAt: prediction.created_at,
      };
    });
  }, [
    predictionEntries,
    actualPerformances,
    comedianNames,
    event,
    prediction.created_at,
  ]);

  const totalProfit = results.reduce((sum, r) => sum + r.profit, 0);
  const isEventEnded = useMemo(() => {
    if (event.date_tbd) return false;
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }, [event.date, event.date_tbd]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>あなたの予想</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictionEntries.length === 0 ? (
            <p className="text-muted-foreground">予想データがありません</p>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {result.predictionType === 'winner'
                        ? '優勝予想'
                        : result.predictionType === 'top3'
                          ? '3位以内予想'
                          : '決勝進出予想'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      予想: {result.predictedComedianNames.join('、')}
                    </div>
                  </div>
                  {isEventEnded && (
                    <div
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        result.isWon
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {result.isWon ? '的中' : '外れ'}
                    </div>
                  )}
                </div>

                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">賭けポイント:</span>{' '}
                    {result.betPoints.toLocaleString()}pt
                  </div>
                  <div>
                    <span className="text-muted-foreground">オッズ:</span>{' '}
                    {result.odds.toFixed(1)}倍
                  </div>
                  {isEventEnded && (
                    <>
                      <div>
                        <span className="text-muted-foreground">払い戻し:</span>{' '}
                        {result.payout.toLocaleString()}pt
                      </div>
                      <div
                        className={`font-medium ${
                          result.profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {result.profit >= 0 ? '+' : ''}
                        {result.profit.toLocaleString()}pt
                      </div>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {result.details}
                </div>
              </div>
            ))
          )}

          {isEventEnded && results.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">合計損益</div>
              <div
                className={`text-2xl font-bold ${
                  totalProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {totalProfit >= 0 ? '+' : ''}
                {totalProfit.toLocaleString()}pt
              </div>
            </div>
          )}

          {!isEventEnded && (
            <Alert>
              <AlertDescription>
                イベント終了後に結果が確定します
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
