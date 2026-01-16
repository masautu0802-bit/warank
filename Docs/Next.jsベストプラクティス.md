# Next.js ベストプラクティス

## 目次
1. [スタイル](#1-スタイル)
2. [ファイル構造とルーティング](#2-ファイル構造とルーティング)
3. [データフェッチング](#3-データフェッチング)
4. [パフォーマンス最適化](#4-パフォーマンス最適化)
5. [セキュリティ](#5-セキュリティ)
6. [型安全性](#6-型安全性)
7. [エラーハンドリング](#7-エラーハンドリング)
8. [環境変数](#8-環境変数)
9. [認証とセッション管理](#9-認証とセッション管理)
10. [コンポーネント設計](#10-コンポーネント設計)

---

## 1. スタイル

### 1.1 CSS Modules

**推奨**: CSS Modulesを使用してコンポーネント単位でスタイルを管理する

**使用例**:
```typescript
// components/Button.module.css
.button {
  padding: 0.5rem 1rem;
  background-color: blue;
  color: white;
}

// components/Button.tsx
import styles from './Button.module.css';

export function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

**ベストプラクティス**:
- コンポーネントごとにCSS Moduleファイルを作成
- クラス名はキャメルケースで記述
- グローバルスタイルは最小限に

### 1.2 Tailwind CSS

**推奨**: Tailwind CSSを使用する場合のベストプラクティス

**設定**:
- `tailwind.config.ts`でカスタムテーマを定義
- `globals.css`でベーススタイルを定義
- `@apply`ディレクティブは慎重に使用（コンポーネント内での使用は避ける）

**使用例**:
```typescript
// components/Button.tsx
export function Button({ children, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        }
      )}
    >
      {children}
    </button>
  );
}
```

**ベストプラクティス**:
- `cn()`ユーティリティ（clsx + tailwind-merge）を使用してクラス名を結合
- 条件付きクラスはオブジェクト形式で記述
- 再利用可能なスタイルはコンポーネント化

### 1.3 スタイルの優先順位

1. **CSS Modules**: コンポーネント固有のスタイル
2. **Tailwind CSS**: ユーティリティクラス
3. **グローバルCSS**: リセットやベーススタイルのみ

### 1.4 ダークモード対応

**推奨**: Tailwind CSSのダークモード機能を活用

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class', // または 'media'
  // ...
}

// コンポーネント内
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

## 2. ファイル構造とルーティング

### 2.1 App Router構造

**推奨ディレクトリ構造**:
```
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # ホームページ
├── globals.css         # グローバルスタイル
├── (auth)/             # 認証関連（ルートグループ）
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── comedian/
│   └── [id]/
│       └── page.tsx
└── api/                # API Routes
    └── predictions/
        └── route.ts
```

**ベストプラクティス**:
- ルートグループ `(folder)` を使用して論理的にグループ化
- 各ルートには `page.tsx` を配置
- 共通レイアウトは `layout.tsx` で定義

### 2.2 動的ルーティング

**推奨**: 動的セグメントを使用

```typescript
// app/comedian/[id]/page.tsx
export default async function ComedianPage({
  params,
}: {
  params: { id: string };
}) {
  const comedian = await getComedian(params.id);
  return <ComedianDetail comedian={comedian} />;
}
```

**ベストプラクティス**:
- 型安全性を確保（`params`の型を明示）
- Server Componentでデータフェッチング
- エラーハンドリングを実装

### 2.3 レイアウトの階層化

**推奨**: ネストされたレイアウトを使用

```typescript
// app/layout.tsx (ルートレイアウト)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

// app/(main)/layout.tsx (メインレイアウト)
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

---

## 3. データフェッチング

### 3.1 Server Components

**推奨**: 可能な限りServer Componentsを使用

```typescript
// app/comedian/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function ComedianPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: comedian } = await supabase
    .from('comedians')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!comedian) {
    notFound();
  }

  return <ComedianDetail comedian={comedian} />;
}
```

**ベストプラクティス**:
- データフェッチングはServer Componentで実行
- `async/await`を使用
- エラーハンドリングと`notFound()`を実装

### 3.2 Client Components

**推奨**: インタラクティブな機能のみClient Componentに

```typescript
'use client';

import { useState } from 'react';

export function PredictionForm() {
  const [prediction, setPrediction] = useState(null);
  // インタラクティブなロジック
}
```

**ベストプラクティス**:
- `'use client'`ディレクティブを明示
- 必要最小限のコンポーネントのみClient Componentに
- Server ComponentからClient Componentにpropsでデータを渡す

### 3.3 データフェッチングパターン

**推奨パターン**:
1. **Server Component**: 初期データ取得
2. **Client Component**: リアルタイム更新やユーザー操作
3. **API Routes**: 外部API呼び出しやサーバーサイド処理

```typescript
// app/api/predictions/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('event_predictions')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### 3.4 キャッシング戦略

**推奨**: Next.jsのキャッシング機能を活用

```typescript
// 静的生成（SSG）
export const revalidate = 3600; // 1時間ごとに再生成

// 動的レンダリング
export const dynamic = 'force-dynamic';

// キャッシュ無効化
import { unstable_cache } from 'next/cache';

const getCachedData = unstable_cache(
  async () => {
    // データ取得ロジック
  },
  ['key'],
  { revalidate: 3600 }
);
```

---

## 4. パフォーマンス最適化

### 4.1 画像最適化

**推奨**: Next.js Imageコンポーネントを使用

```typescript
import Image from 'next/image';

export function ComedianImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      priority // 重要画像の場合
      placeholder="blur" // ブラー効果
    />
  );
}
```

**ベストプラクティス**:
- 常に`width`と`height`を指定
- `priority`は重要な画像のみに使用
- `loading="lazy"`はデフォルト

### 4.2 コード分割

**推奨**: 動的インポートを使用

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 必要に応じて
});
```

**ベストプラクティス**:
- 大きなコンポーネントは動的インポート
- 初期表示に不要なコンポーネントは遅延読み込み
- ローディング状態を提供

### 4.3 メモ化

**推奨**: Reactのメモ化機能を適切に使用

```typescript
import { useMemo, useCallback, memo } from 'react';

// 計算結果のメモ化
const filteredEvents = useMemo(() => {
  return events.filter(event => event.tier === selectedTier);
}, [events, selectedTier]);

// 関数のメモ化
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);

// コンポーネントのメモ化
export const EventCard = memo(function EventCard({ event }: Props) {
  return <div>{event.name}</div>;
});
```

---

## 5. セキュリティ

### 5.1 環境変数

**推奨**: 適切な環境変数の管理

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx // サーバーサイドのみ

// 使用例
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

**ベストプラクティス**:
- `NEXT_PUBLIC_*`はクライアントに公開される
- 機密情報はサーバーサイドのみで使用
- `.env.local`は`.gitignore`に追加

### 5.2 RLS（Row Level Security）

**推奨**: SupabaseのRLSを活用

```typescript
// サーバーサイドで認証済みクライアントを作成
import { createClient } from '@/lib/supabase/server';

export async function getPredictions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('event_predictions')
    .select('*');
  // RLSポリシーにより、ユーザーは自分のデータのみアクセス可能
  return data;
}
```

### 5.3 入力検証

**推奨**: サーバーサイドでの入力検証

```typescript
import { z } from 'zod';

const predictionSchema = z.object({
  eventId: z.string().uuid(),
  betPoints: z.number().min(1).max(10000),
  predictions: z.array(z.object({
    comedianId: z.string(),
    predictionType: z.enum(['winner', 'trifecta']),
  })),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = predictionSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.errors },
      { status: 400 }
    );
  }
  
  // 処理続行
}
```

---

## 6. 型安全性

### 6.1 TypeScript設定

**推奨**: 厳格な型チェック

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 6.2 型定義

**推奨**: 明確な型定義

```typescript
// types/comedian.ts
export interface Comedian {
  id: string;
  name: string;
  imageUrl: string | null;
  agency: string | null;
  trend: 'up' | 'down' | 'stable';
  cheerCount: number;
  bio: string | null;
  createdAt: string;
}

// types/event.ts
export interface Event {
  id: string;
  name: string;
  date: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
  formatType: 'absolute-judge' | '3-choice' | 'block-elimination';
  // ...
}
```

### 6.3 Supabase型生成

**推奨**: Supabase CLIで型を自動生成

```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

```typescript
import { Database } from '@/types/supabase';

type Comedian = Database['public']['tables']['comedians']['Row'];
```

---

## 7. エラーハンドリング

### 7.1 Error Boundary

**推奨**: error.tsxでエラーハンドリング

```typescript
// app/comedian/[id]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}
```

### 7.2 Not Found

**推奨**: not-found.tsxで404処理

```typescript
// app/comedian/[id]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>芸人が見つかりません</h2>
      <Link href="/">ホームに戻る</Link>
    </div>
  );
}
```

### 7.3 グローバルエラーハンドリング

**推奨**: ルートレベルでエラーハンドリング

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>予期しないエラーが発生しました</h2>
        <button onClick={() => reset()}>再試行</button>
      </body>
    </html>
  );
}
```

---

## 8. 環境変数

### 8.1 環境変数の命名規則

**推奨**:
- `NEXT_PUBLIC_*`: クライアントサイドで使用可能
- それ以外: サーバーサイドのみ

```typescript
// .env.local
# クライアントサイド
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# サーバーサイドのみ
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=xxx
```

### 8.2 環境変数の型安全性

**推奨**: 環境変数の検証

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
```

---

## 9. 認証とセッション管理

### 9.1 Supabase認証

**推奨**: サーバーサイドとクライアントサイドで適切にクライアントを作成

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // サーバーコンポーネントでのクッキー設定は制限あり
          }
        },
      },
    }
  );
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 9.2 認証状態の管理

**推奨**: Middlewareで認証チェック

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response.cookies.set(name, value, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 保護されたルートのチェック
  if (!user && request.nextUrl.pathname.startsWith('/predictions')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 10. コンポーネント設計

### 10.1 コンポーネントの分割

**推奨**: 単一責任の原則

```typescript
// ❌ 悪い例: 大きなコンポーネント
export function EventPage() {
  // データ取得、フィルタリング、表示すべてを含む
}

// ✅ 良い例: 小さなコンポーネントに分割
export function EventPage() {
  return (
    <>
      <EventHeader />
      <EventFilters />
      <EventList />
    </>
  );
}
```

### 10.2 Props設計

**推奨**: 明確なProps型定義

```typescript
interface EventCardProps {
  event: Event;
  showTier?: boolean;
  onFavorite?: (eventId: string) => void;
  className?: string;
}

export function EventCard({
  event,
  showTier = true,
  onFavorite,
  className,
}: EventCardProps) {
  // 実装
}
```

### 10.3 コンポーネントの配置

**推奨ディレクトリ構造**:
```
components/
├── ui/              # shadcn/uiコンポーネント
│   ├── button.tsx
│   └── card.tsx
├── features/        # 機能別コンポーネント
│   ├── comedian/
│   │   ├── ComedianCard.tsx
│   │   └── ComedianDetail.tsx
│   └── event/
│       ├── EventCard.tsx
│       └── EventList.tsx
├── layout/          # レイアウトコンポーネント
│   ├── Header.tsx
│   └── Footer.tsx
└── shared/          # 共通コンポーネント
    ├── Loading.tsx
    └── ErrorMessage.tsx
```

---

## チェックリスト

コーディング時に確認すべき項目:

### スタイル
- [ ] CSS ModulesまたはTailwind CSSを使用しているか
- [ ] `cn()`ユーティリティでクラス名を結合しているか
- [ ] ダークモードに対応しているか

### ファイル構造
- [ ] App Routerの規約に従っているか
- [ ] 適切なディレクトリ構造になっているか
- [ ] ルートグループを適切に使用しているか

### データフェッチング
- [ ] Server Componentでデータフェッチングしているか
- [ ] Client Componentは必要最小限か
- [ ] キャッシング戦略を考慮しているか

### パフォーマンス
- [ ] Next.js Imageコンポーネントを使用しているか
- [ ] 大きなコンポーネントは動的インポートしているか
- [ ] メモ化を適切に使用しているか

### セキュリティ
- [ ] 環境変数は適切に管理されているか
- [ ] RLSポリシーが設定されているか
- [ ] 入力検証を実装しているか

### 型安全性
- [ ] TypeScriptの型を明示しているか
- [ ] Supabaseの型を生成しているか
- [ ] 型エラーがないか

### エラーハンドリング
- [ ] error.tsxを実装しているか
- [ ] not-found.tsxを実装しているか
- [ ] 適切なエラーメッセージを表示しているか

### 認証
- [ ] サーバーサイドとクライアントサイドで適切にクライアントを作成しているか
- [ ] Middlewareで認証チェックしているか
- [ ] セッション管理が適切か

### コンポーネント設計
- [ ] 単一責任の原則に従っているか
- [ ] Propsの型が明確か
- [ ] 適切なディレクトリに配置されているか

---

## 参考資料

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Supabase Next.jsガイド](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [shadcn/ui](https://ui.shadcn.com/)

---

**最終更新日**: 2025年1月
