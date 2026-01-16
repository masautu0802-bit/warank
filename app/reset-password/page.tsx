import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">パスワードリセット</h1>
          <p className="mt-2 text-muted-foreground">
            パスワードリセット用のメールを送信します
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
