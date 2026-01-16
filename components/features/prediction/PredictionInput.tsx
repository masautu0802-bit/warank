'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Event, Comedian, PredictionType, PredictionEntry } from '@/lib/types';
import { calculateOdds } from '@/lib/utils/predictionUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import { toast } from 'sonner';

interface PredictionInputProps {
  event: Event;
  performers: Comedian[];
}

export function PredictionInput({ event, performers }: PredictionInputProps) {
  const router = useRouter();
  const [predictionType, setPredictionType] = useState<PredictionType>('winner');
  const [selectedComedianIds, setSelectedComedianIds] = useState<string[]>([]);
  const [betPoints, setBetPoints] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appData, setAppData] = useState<Awaited<ReturnType<typeof calculateAppData>> | null>(null);

  // アプリケーションデータを取得（オッズ計算用）
  useEffect(() => {
    async function fetchAppData() {
      const supabase = createClient();
      const [comediansResult, eventsResult, performancesResult] = await Promise.all([
        supabase.from('comedians').select('*'),
        supabase.from('events').select('*'),
        supabase.from('performances').select('*'),
      ]);

      const data = calculateAppData({
        comedians: comediansResult.data || [],
        events: eventsResult.data || [],
        performances: performancesResult.data || [],
      });

      setAppData(data);
    }

    fetchAppData();
  }, []);

  // 予想タイプに応じて選択可能な芸人数を制限
  const maxSelections = predictionType === 'winner' ? 1 : predictionType === 'top3' ? 3 : 5;

  // 芸人の選択/解除
  const toggleComedian = (comedianId: string) => {
    setSelectedComedianIds((prev) => {
      if (prev.includes(comedianId)) {
        return prev.filter((id) => id !== comedianId);
      }
      if (prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, comedianId];
    });
  };

  // オッズを計算
  const calculateOddsForSelection = (): number => {
    if (!appData || selectedComedianIds.length === 0) return 1.0;

    // 最初の選択された芸人のオッズを計算
    const firstComedianId = selectedComedianIds[0];
    return calculateOdds(firstComedianId, event.id, predictionType, appData);
  };

  const odds = calculateOddsForSelection();

  // 予想を保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const points = parseInt(betPoints, 10);
    if (isNaN(points) || points < 1) {
      const errorMsg = '賭けポイントは1以上で入力してください';
      setError(errorMsg);
      setLoading(false);
      toast.error('入力エラー', {
        description: errorMsg,
      });
      return;
    }

    if (selectedComedianIds.length === 0) {
      const errorMsg = '芸人を選択してください';
      setError(errorMsg);
      setLoading(false);
      toast.error('入力エラー', {
        description: errorMsg,
      });
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      // 予想エントリーを作成
      const predictionEntry: PredictionEntry = {
        predictionType,
        predictedComedianIds: selectedComedianIds,
        betPoints: points,
        odds,
      };

      // 既存の予想を確認
      const { data: existing } = await supabase
        .from('event_predictions')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // 更新
        const { error: updateError } = await supabase
          .from('event_predictions')
          .update({
            predictions: [predictionEntry],
            total_bet_points: points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // 新規作成
        const { error: insertError } = await supabase
          .from('event_predictions')
          .insert({
            event_id: event.id,
            user_id: user.id,
            predictions: [predictionEntry],
            total_bet_points: points,
            paid_out: false,
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setLoading(false);
      toast.success('予想を保存しました', {
        description: `${points}ptで予想を投稿しました`,
      });
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || '予想の保存に失敗しました';
      setError(errorMessage);
      setLoading(false);
      toast.error('予想の保存に失敗しました', {
        description: errorMessage,
      });
    }
  };

  if (success) {
    return (
      <Alert>
        <AlertDescription>
          予想を保存しました！
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>予想を入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 予想タイプ選択 */}
          <div>
            <label className="text-sm font-medium mb-2 block">予想タイプ</label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  setPredictionType('winner');
                  setSelectedComedianIds([]);
                }}
                variant={predictionType === 'winner' ? 'default' : 'outline'}
                size="sm"
              >
                優勝予想
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setPredictionType('top3');
                  setSelectedComedianIds([]);
                }}
                variant={predictionType === 'top3' ? 'default' : 'outline'}
                size="sm"
              >
                3位以内
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setPredictionType('finalist');
                  setSelectedComedianIds([]);
                }}
                variant={predictionType === 'finalist' ? 'default' : 'outline'}
                size="sm"
              >
                決勝進出
              </Button>
            </div>
          </div>

          {/* 芸人選択 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              芸人を選択（最大{maxSelections}名）
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
              {performers.map((comedian) => {
                const isSelected = selectedComedianIds.includes(comedian.id);
                const isDisabled = !isSelected && selectedComedianIds.length >= maxSelections;

                return (
                  <button
                    key={comedian.id}
                    type="button"
                    onClick={() => toggleComedian(comedian.id)}
                    disabled={isDisabled}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-accent'
                    }`}
                  >
                    {comedian.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 賭けポイント */}
          <div>
            <label htmlFor="betPoints" className="text-sm font-medium mb-2 block">
              賭けポイント
            </label>
            <Input
              id="betPoints"
              type="number"
              min="1"
              value={betPoints}
              onChange={(e) => setBetPoints(e.target.value)}
              required
            />
          </div>

          {/* オッズ表示 */}
          {selectedComedianIds.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">オッズ</div>
              <div className="text-2xl font-bold">{odds.toFixed(1)}倍</div>
              <div className="text-sm text-muted-foreground mt-1">
                的中時の払い戻し: {(
                  parseInt(betPoints, 10) * odds
                ).toLocaleString()}pt
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading || selectedComedianIds.length === 0} className="w-full">
            {loading ? '保存中...' : '予想を保存'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
