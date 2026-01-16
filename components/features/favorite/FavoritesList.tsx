'use client';

import { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { createClient } from '@/lib/supabase/client';
import type { UserFavorite, FavoriteType, Comedian, Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface FavoritesListProps {
  userId: string;
}

export function FavoritesList({ userId }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [comedians, setComedians] = useState<Record<string, Comedian>>({});
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'comedians' | 'events'>('all');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      const supabase = createClient();

      // お気に入りを取得
      const { data: favoritesData, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('お気に入り取得エラー:', error);
        setLoading(false);
        return;
      }

      const favoritesList = (favoritesData || []) as UserFavorite[];
      setFavorites(favoritesList);

      // 芸人IDとイベントIDを取得
      const comedianIds = favoritesList
        .filter((f) => f.favorite_type === 'comedian')
        .map((f) => f.favorite_id);
      const eventIds = favoritesList
        .filter((f) => f.favorite_type === 'event')
        .map((f) => f.favorite_id);

      // 芸人データを取得
      if (comedianIds.length > 0) {
        const { data: comediansData } = await supabase
          .from('comedians')
          .select('*')
          .in('id', comedianIds);

        const comediansMap: Record<string, Comedian> = {};
        (comediansData || []).forEach((c) => {
          comediansMap[c.id] = c as Comedian;
        });
        setComedians(comediansMap);
      }

      // イベントデータを取得
      if (eventIds.length > 0) {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        const eventsMap: Record<string, Event> = {};
        (eventsData || []).forEach((e) => {
          eventsMap[e.id] = e as Event;
        });
        setEvents(eventsMap);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, [userId]);

  // アニメーション
  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 0) {
      const children = Array.from(listRef.current.children) as HTMLElement[];
      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(50, { from: 'start' }),
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
  }, [favorites, activeTab]);

  const filteredFavorites = favorites.filter((f) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'comedians') return f.favorite_type === 'comedian';
    if (activeTab === 'events') return f.favorite_type === 'event';
    return true;
  });

  const comedianFavorites = filteredFavorites.filter((f) => f.favorite_type === 'comedian');
  const eventFavorites = filteredFavorites.filter((f) => f.favorite_type === 'event');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          読み込み中...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>お気に入り ({favorites.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            お気に入りがありません
          </p>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">すべて ({favorites.length})</TabsTrigger>
              <TabsTrigger value="comedians">芸人 ({comedianFavorites.length})</TabsTrigger>
              <TabsTrigger value="events">イベント ({eventFavorites.length})</TabsTrigger>
            </TabsList>

            <div ref={listRef} className="space-y-3">
              <TabsContent value="all" className="mt-0">
                {filteredFavorites.map((favorite) => {
                  if (favorite.favorite_type === 'comedian') {
                    const comedian = comedians[favorite.favorite_id];
                    if (!comedian) return null;
                    return (
                      <Link
                        key={favorite.id}
                        href={`/comedian/${comedian.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors touch-manipulation"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            {comedian.image_url && (
                              <AvatarImage src={comedian.image_url} alt={comedian.name} />
                            )}
                            <AvatarFallback className="text-xs">
                              {comedian.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{comedian.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {comedian.agency || '所属事務所不明'}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">芸人</span>
                        </div>
                      </Link>
                    );
                  } else {
                    const event = events[favorite.favorite_id];
                    if (!event) return null;
                    return (
                      <Link
                        key={favorite.id}
                        href={`/event/${event.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors touch-manipulation"
                      >
                        <div className="flex items-center gap-3">
                          {event.image_url ? (
                            <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden relative bg-muted">
                              <img
                                src={event.image_url}
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">画像なし</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{event.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.date_display ||
                                (event.date_tbd
                                  ? '日付未定'
                                  : new Date(event.date).toLocaleDateString('ja-JP', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    }))}
                              {event.tier && ` • ティア: ${event.tier}`}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">イベント</span>
                        </div>
                      </Link>
                    );
                  }
                })}
              </TabsContent>

              <TabsContent value="comedians" className="mt-0">
                {comedianFavorites.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    お気に入りの芸人がありません
                  </p>
                ) : (
                  comedianFavorites.map((favorite) => {
                    const comedian = comedians[favorite.favorite_id];
                    if (!comedian) return null;
                    return (
                      <Link
                        key={favorite.id}
                        href={`/comedian/${comedian.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors touch-manipulation"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            {comedian.image_url && (
                              <AvatarImage src={comedian.image_url} alt={comedian.name} />
                            )}
                            <AvatarFallback className="text-xs">
                              {comedian.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{comedian.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {comedian.agency || '所属事務所不明'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                {eventFavorites.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    お気に入りのイベントがありません
                  </p>
                ) : (
                  eventFavorites.map((favorite) => {
                    const event = events[favorite.favorite_id];
                    if (!event) return null;
                    return (
                      <Link
                        key={favorite.id}
                        href={`/event/${event.id}`}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors touch-manipulation"
                      >
                        <div className="flex items-center gap-3">
                          {event.image_url ? (
                            <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden relative bg-muted">
                              <img
                                src={event.image_url}
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">画像なし</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{event.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.date_display ||
                                (event.date_tbd
                                  ? '日付未定'
                                  : new Date(event.date).toLocaleDateString('ja-JP', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    }))}
                              {event.tier && ` • ティア: ${event.tier}`}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
