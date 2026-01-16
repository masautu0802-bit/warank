# UI/UX改善 - ライブラリ・コンポーネント提案

## 📦 追加すべきライブラリ

### 1. トースト通知（必須・優先度：高）
```bash
npm install sonner
```
- **理由**: shadcn/uiと統合しやすく、軽量でパフォーマンスが良い
- **用途**: お気に入り追加/削除、予想投稿、エラー通知など
- **代替案**: `react-hot-toast`（より軽量だが、shadcn/uiとの統合がやや複雑）

### 2. スケルトンローディング（必須・優先度：高）
shadcn/uiの`skeleton`コンポーネントを使用（追加インストール不要）
- **理由**: 既存のshadcn/uiエコシステムと統一
- **用途**: データ読み込み中のプレースホルダー表示

### 3. バッジ・ラベル表示（推奨・優先度：高）
shadcn/uiの`badge`コンポーネントを使用（追加インストール不要）
- **理由**: ランキング順位、イベントステータス、ティア表示に最適
- **用途**: 順位バッジ、ステータスバッジ、ティア表示

### 4. ダイアログ・モーダル（推奨・優先度：中）
shadcn/uiの`dialog`コンポーネントを使用
- **理由**: 確認ダイアログ、詳細表示などに使用
- **用途**: 予想確認、エラー詳細表示

### 5. ツールチップ（推奨・優先度：中）
shadcn/uiの`tooltip`コンポーネントを使用
- **理由**: ホバー時の詳細情報表示
- **用途**: ランキング変動の詳細、ポイント計算の説明

### 6. プログレスバー（推奨・優先度：中）
shadcn/uiの`progress`コンポーネントを使用
- **理由**: ローディング状態の視覚化
- **用途**: データ読み込み進捗、ポイント獲得進捗

### 7. セパレーター（推奨・優先度：低）
shadcn/uiの`separator`コンポーネントを使用
- **理由**: セクション区切りに使用
- **用途**: コンテンツの視覚的分離

### 8. アバター（推奨・優先度：中）
shadcn/uiの`avatar`コンポーネントを使用
- **理由**: 芸人画像の表示に最適化
- **用途**: ランキング、芸人詳細ページ

### 9. ドロップダウンメニュー（推奨・優先度：中）
shadcn/uiの`dropdown-menu`コンポーネントを使用
- **理由**: アクションメニューの実装
- **用途**: ユーザーメニュー、フィルターオプション

### 10. ポップオーバー（推奨・優先度：低）
shadcn/uiの`popover`コンポーネントを使用
- **理由**: コンテキストメニュー、詳細情報表示
- **用途**: イベント詳細のクイックビュー

---

## 🎨 shadcn/uiコンポーネント追加コマンド

### 優先度：高（必須）
```bash
# トースト通知（sonner使用）
npx shadcn@latest add sonner

# スケルトンローディング
npx shadcn@latest add skeleton

# バッジ
npx shadcn@latest add badge

# アバター
npx shadcn@latest add avatar
```

### 優先度：中（推奨）
```bash
# ダイアログ
npx shadcn@latest add dialog

# ツールチップ
npx shadcn@latest add tooltip

# プログレスバー
npx shadcn@latest add progress

# ドロップダウンメニュー
npx shadcn@latest add dropdown-menu
```

### 優先度：低（オプション）
```bash
# セパレーター
npx shadcn@latest add separator

# ポップオーバー
npx shadcn@latest add popover

# スイッチ（フィルター用）
npx shadcn@latest add switch

# ラジオグループ（フィルター用）
npx shadcn@latest add radio-group
```

---

## 🚀 追加のアニメーション・エフェクト（オプション）

### 1. framer-motion（高度なアニメーション）
```bash
npm install framer-motion
```
- **理由**: より複雑なアニメーション、ページ遷移、ジェスチャー対応
- **用途**: ページ遷移アニメーション、ドラッグ&ドロップ、複雑なインタラクション
- **注意**: anime.jsと併用可能。既存のanime.jsを置き換える必要はない

### 2. react-intersection-observer（スクロールアニメーション）
```bash
npm install react-intersection-observer
```
- **理由**: スクロール時の要素表示アニメーション
- **用途**: 要素がビューポートに入った時のアニメーション

---

## 📊 グラフ・可視化（既存）

### Recharts（既にインストール済み）
- **用途**: ランキング推移グラフ、統計表示
- **状態**: ✅ インストール済み

---

## 🎯 実装優先順位

### Phase 1: 必須コンポーネント（即座に実装）
1. ✅ `sonner` - トースト通知
2. ✅ `skeleton` - スケルトンローディング
3. ✅ `badge` - バッジ表示
4. ✅ `avatar` - アバター表示

### Phase 2: 推奨コンポーネント（短期実装）
5. ✅ `dialog` - モーダル
6. ✅ `tooltip` - ツールチップ
7. ✅ `progress` - プログレスバー
8. ✅ `dropdown-menu` - ドロップダウンメニュー

### Phase 3: オプションコンポーネント（中期実装）
9. ✅ `separator` - セパレーター
10. ✅ `popover` - ポップオーバー
11. ✅ `switch` - スイッチ
12. ✅ `radio-group` - ラジオグループ

### Phase 4: 高度な機能（長期実装）
13. ⚠️ `framer-motion` - 高度なアニメーション（オプション）
14. ⚠️ `react-intersection-observer` - スクロールアニメーション（オプション）

---

## 📝 実装例

### トースト通知の使用例
```typescript
import { toast } from 'sonner';

// 成功通知
toast.success('お気に入りに追加しました');

// エラー通知
toast.error('エラーが発生しました');

// ローディング通知
toast.loading('処理中...');
```

### スケルトンローディングの使用例
```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />
```

### バッジの使用例
```typescript
import { Badge } from '@/components/ui/badge';

<Badge variant="default">1位</Badge>
<Badge variant="secondary">開催中</Badge>
<Badge variant="destructive">終了</Badge>
```

---

## ⚠️ 注意事項

1. **shadcn/uiの一貫性**: 既存の`new-york`スタイルを維持
2. **パフォーマンス**: 不要なライブラリは追加しない
3. **バンドルサイズ**: 軽量なライブラリを優先
4. **アクセシビリティ**: shadcn/uiコンポーネントはアクセシビリティ対応済み

---

## 🔄 既存ライブラリとの統合

- ✅ **anime.js**: 既存のアニメーションと併用可能
- ✅ **lucide-react**: アイコンは既に使用中
- ✅ **next-themes**: ダークモード対応済み
- ✅ **Recharts**: グラフ表示用（既にインストール済み）

---

## 📦 一括インストールコマンド（推奨）

### 必須コンポーネントのみ
```bash
npm install sonner
npx shadcn@latest add sonner skeleton badge avatar
```

### 推奨コンポーネントまで
```bash
npm install sonner
npx shadcn@latest add sonner skeleton badge avatar dialog tooltip progress dropdown-menu
```

### 全コンポーネント
```bash
npm install sonner
npx shadcn@latest add sonner skeleton badge avatar dialog tooltip progress dropdown-menu separator popover switch radio-group
```
