'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // スクロール連動アニメーション
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [64, 56]);
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 6px -1px rgba(0,0,0,0.1)']
  );

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

  const navLinks = [
    { href: '/', label: 'ホーム' },
    { href: '/rankings', label: 'ランキング' },
    { href: '/events', label: 'イベント' },
    { href: '/predictions', label: '予想', requiresAuth: true },
  ];

  // モバイルメニューのアニメーション設定
  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative"
      style={{
        height: headerHeight,
        opacity: headerOpacity,
        boxShadow: headerShadow,
      }}
    >
      <div className="container flex h-full items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2">
          <motion.span
            className="text-xl font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Wa-Rank
          </motion.span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-4">
          {navLinks.map((link) => {
            if (link.requiresAuth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary relative ${
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeNav"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
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
          <motion.svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
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
          </motion.svg>
        </Button>

        {/* モバイルメニュー */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              className="absolute top-full left-0 right-0 bg-background border-b md:hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="container px-4 py-4 space-y-4">
                {/* モバイル検索バー */}
                <div className="pb-2 border-b">
                  <SearchBar />
                </div>
                <div className="space-y-2">
                  {navLinks.map((link, index) => {
                    if (link.requiresAuth && !user) return null;
                    return (
                      <motion.div
                        key={link.href}
                        custom={index}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
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
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

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
              <motion.button
                onClick={handleSignOut}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ログアウト
              </motion.button>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary"
              >
                ログイン
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
