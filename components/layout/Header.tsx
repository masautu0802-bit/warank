'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/features/search/SearchBar';
import { ThemeToggle } from '@/components/features/theme/ThemeToggle';
import { toast } from 'sonner';

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 現在のユーザーを取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('ログアウトしました');
    // リロードして状態を更新
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'ホーム' },
    { href: '/rankings', label: 'ランキング' },
    { href: '/events', label: 'イベント' },
    { href: '/predictions', label: '予想', requiresAuth: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Wa-Rank</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-4">
          {navLinks.map((link) => {
            if (link.requiresAuth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {/* 検索バー */}
          <div className="flex-1 max-w-xs">
            <SearchBar />
          </div>
        </nav>

        {/* モバイルメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <nav className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <div className="container px-4 py-4 space-y-4">
              {/* モバイル検索バー */}
              <div className="pb-2 border-b">
                <SearchBar />
              </div>
              <div className="space-y-2">
                {navLinks.map((link) => {
                  if (link.requiresAuth && !user) return null;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                        pathname === link.href
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        )}

        {/* 認証ボタンとテーマ切り替え */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* テーマ切り替えボタン */}
          <ThemeToggle />
          
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          ) : user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/profile"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary"
              >
                プロフィール
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
