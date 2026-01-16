'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import type { FavoriteType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  type: FavoriteType;
  targetId: string;
  className?: string;
}

export function FavoriteButton({ type, targetId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // ユーザー認証状態を確認
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // お気に入り状態を確認
        checkFavoriteStatus(user.id);
      }
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkFavoriteStatus(session.user.id);
      } else {
        setIsFavorite(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [targetId, type]);

  const checkFavoriteStatus = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_type', type)
      .eq('favorite_id', targetId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('お気に入り確認エラー:', error);
    } else {
      setIsFavorite(!!data);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('ログインが必要です', {
        description: 'お気に入り機能を使用するにはログインしてください',
      });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isFavorite) {
        // お気に入りを削除
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorite_type', type)
          .eq('favorite_id', targetId);

        if (error) {
          console.error('お気に入り削除エラー:', error);
          toast.error('お気に入りの削除に失敗しました', {
            description: error.message,
          });
        } else {
          setIsFavorite(false);
          toast.success('お気に入りから削除しました');
        }
      } else {
        // お気に入りを追加
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            favorite_type: type,
            favorite_id: targetId,
          });

        if (error) {
          console.error('お気に入り追加エラー:', error);
          toast.error('お気に入りの追加に失敗しました', {
            description: error.message,
          });
        } else {
          setIsFavorite(true);
          toast.success('お気に入りに追加しました');
        }
      }
    } catch (err) {
      console.error('お気に入り操作エラー:', err);
      toast.error('エラーが発生しました', {
        description: 'しばらくしてから再度お試しください',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="icon"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={className}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
      />
    </Button>
  );
}
