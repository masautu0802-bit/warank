'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Event, Comedian, PredictionType, PredictionEntry } from '@/lib/types';
import { calculateOdds } from '@/lib/utils/predictionUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import { toast } from 'sonner';

// Zodスキーマの定義
const predictionSchema = z.object({
  predictionType: z.enum(['winner', 'top3', 'finalist']),
  selectedComedianIds: z
    .array(z.string())
    .min(1, '芸人を選択してください'),
  betPoints: z
    .number({ invalid_type_error: '数値を入力してください' })
    .min(1, '賭けポイントは1以上で入力してください')
    .max(10000, '賭けポイントは10000以下で入力してください'),
}).refine(
  (data) => {
    const maxSelections = data.predictionType === 'winner' ? 1 : data.predictionType === 'top3' ? 3 : 5;
    return data.selectedComedianIds.length <= maxSelections;
  },
  {
    message: '選択可能な芸人数を超えています',
    path: ['selectedComedianIds'],
  }
);

type PredictionFormData = z.infer<typeof predictionSchema>;

interface PredictionInputProps {
  event: Event;
  performers: Comedian[];
}

export function PredictionInput({ event, performers }: PredictionInputProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [appData, setAppData] = useState<Awaited<ReturnType<typeof calculateAppData>> | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      predictionType: 'winner',
      selectedComedianIds: [],
      betPoints: 100,
    },
  });

  const predictionType = watch('predictionType');
  const selectedComedianIds = watch('selectedComedianIds');
  const betPoints = watch('betPoints');

  // 予想タイプに応じて選択可能な芸人数を制限
  const maxSelections = predictionType === 'winner' ? 1 : predictionType === 'top3' ? 3 : 5;

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

  // 芸人の選択/解除
  const toggleComedian = (comedianId: string) => {
    const current = selectedComedianIds;
    if (current.includes(comedianId)) {
      setValue('selectedComedianIds', current.filter((id) => id !== comedianId));
    } else if (current.length < maxSelections) {
      setValue('selectedComedianIds', [...current, comedianId]);
    }
  };

  // 予想タイプ変更時に選択をリセット
  const handlePredictionTypeChange = (type: PredictionType) => {
    setValue('predictionType', type);
    setValue('selectedComedianIds', []);
  };

  // オッズを計算
  const calculateOddsForSelection = (): number => {
    if (!appData || selectedComedianIds.length === 0) return 1.0;
    const firstComedianId = selectedComedianIds[0];
    return calculateOdds(firstComedianId, event.id, predictionType, appData);
  };

  const odds = calculateOddsForSelection();

  // 予想を保存
  const onSubmit = async (data: PredictionFormData) => {
    setServerError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setServerError('ログインが必要です');
        return;
      }

      // 予想エントリーを作成
      const predictionEntry: PredictionEntry = {
        predictionType: data.predictionType,
        predictedComedianIds: data.selectedComedianIds,
        betPoints: data.betPoints,
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
            total_bet_points: data.betPoints,
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
            total_bet_points: data.betPoints,
            paid_out: false,
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      toast.success('予想を保存しました', {
        description: `${data.betPoints}ptで予想を投稿しました`,
      });
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || '予想の保存に失敗しました';
      setServerError(errorMessage);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* 予想タイプ選択 */}
          <div>
            <label className="text-sm font-medium mb-2 block">予想タイプ</label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => handlePredictionTypeChange('winner')}
                variant={predictionType === 'winner' ? 'default' : 'outline'}
                size="sm"
              >
                優勝予想
              </Button>
              <Button
                type="button"
                onClick={() => handlePredictionTypeChange('top3')}
                variant={predictionType === 'top3' ? 'default' : 'outline'}
                size="sm"
              >
                3位以内
              </Button>
              <Button
                type="button"
                onClick={() => handlePredictionTypeChange('finalist')}
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
            {errors.selectedComedianIds && (
              <p className="text-sm text-destructive mt-1">{errors.selectedComedianIds.message}</p>
            )}
          </div>

          {/* 賭けポイント */}
          <div>
            <label htmlFor="betPoints" className="text-sm font-medium mb-2 block">
              賭けポイント
            </label>
            <Controller
              name="betPoints"
              control={control}
              render={({ field }) => (
                <Input
                  id="betPoints"
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  aria-invalid={errors.betPoints ? 'true' : 'false'}
                />
              )}
            />
            {errors.betPoints && (
              <p className="text-sm text-destructive mt-1">{errors.betPoints.message}</p>
            )}
          </div>

          {/* オッズ表示 */}
          {selectedComedianIds.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">オッズ</div>
              <div className="text-2xl font-bold">{odds.toFixed(1)}倍</div>
              <div className="text-sm text-muted-foreground mt-1">
                的中時の払い戻し: {(betPoints * odds).toLocaleString()}pt
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || selectedComedianIds.length === 0} className="w-full">
            {isSubmitting ? '保存中...' : '予想を保存'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
