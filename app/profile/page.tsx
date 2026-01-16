import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfilePageClient } from '@/components/features/profile/ProfilePageClient';

export default async function ProfilePage() {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // ユーザープロフィールを取得
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // ユーザーの予想を取得
  const { data: predictions } = await supabase
    .from('event_predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <ProfilePageClient
      user={user}
      profile={profile}
      predictions={predictions || []}
    />
  );
}
