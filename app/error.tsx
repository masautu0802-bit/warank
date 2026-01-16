'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('エラーが発生しました:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">エラーが発生しました</h1>
        <p className="text-muted-foreground mb-8">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>再試行</Button>
          <Button variant="outline" asChild>
            <a href="/">ホームに戻る</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
