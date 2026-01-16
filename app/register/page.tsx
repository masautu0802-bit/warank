import { RegisterForm } from '@/components/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">新規登録</h1>
          <p className="mt-2 text-muted-foreground">
            Wa-Rankアカウントを作成してください
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
