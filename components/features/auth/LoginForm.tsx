'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        toast.error('ログインに失敗しました', {
          description: error.message,
        });
        return;
      }

      // ログイン成功
      toast.success('ログインしました');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          メールアドレス
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          パスワード
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="パスワード"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'ログイン中...' : 'ログイン'}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-primary underline">
          アカウントをお持ちでない方はこちら
        </Link>
      </div>

      <div className="text-center text-sm">
        <Link
          href="/reset-password"
          className="text-muted-foreground hover:text-primary underline"
        >
          パスワードを忘れた場合
        </Link>
      </div>
    </form>
  );
}
