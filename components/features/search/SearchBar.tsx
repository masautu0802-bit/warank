'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Comedian, Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    comedians: Comedian[];
    events: Event[];
  }>({ comedians: [], events: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // デバウンス処理（300ms）
  useEffect(() => {
    if (!query.trim()) {
      setResults({ comedians: [], events: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);

      try {
        const supabase = createClient();

        // 芸人検索
        const { data: comediansData } = await supabase
          .from('comedians')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(5);

        // イベント検索
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(5);

        setResults({
          comedians: (comediansData || []) as Comedian[],
          events: (eventsData || []) as Event[],
        });
      } catch (error) {
        console.error('検索エラー:', error);
        setResults({ comedians: [], events: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleComedianClick = (comedianId: string) => {
    router.push(`/comedian/${comedianId}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = results.comedians.length > 0 || results.events.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="芸人・イベントを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && hasResults) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10 w-full md:w-64 text-sm sm:text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && query.trim() && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 sm:max-h-96 overflow-y-auto scrollbar-hide">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                検索中...
              </div>
            ) : hasResults ? (
              <div className="divide-y">
                {/* 芸人検索結果 */}
                {results.comedians.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      芸人
                    </div>
                    {results.comedians.map((comedian) => (
                      <button
                        key={comedian.id}
                        onClick={() => handleComedianClick(comedian.id)}
                        className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md hover:bg-accent active:bg-accent transition-colors text-left touch-manipulation"
                      >
                        {comedian.image_url && (
                          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden relative">
                            <Image
                              src={comedian.image_url}
                              alt={comedian.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {comedian.name}
                          </div>
                          {comedian.agency && (
                            <div className="text-sm text-muted-foreground truncate">
                              {comedian.agency}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* イベント検索結果 */}
                {results.events.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      イベント
                    </div>
                    {results.events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event.id)}
                        className="w-full flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-md hover:bg-accent active:bg-accent transition-colors text-left touch-manipulation"
                      >
                        {event.image_url && (
                          <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden relative">
                            <Image
                              src={event.image_url}
                              alt={event.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {event.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.date_display || event.date.split('T')[0]}
                            {event.tier && ` | ティア: ${event.tier}`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                検索結果が見つかりませんでした
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
