import { AuthForm } from '@/components/auth/AuthForm';
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      <RedirectIfAuthenticated />
      <div className="max-w-md w-full">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
