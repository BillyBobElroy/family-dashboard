'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AuthFormProps = {
  mode: 'signin' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const isSignin = mode === 'signin';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow-md w-full max-w-sm mx-auto"
    >
      <h2 className="text-xl font-bold text-center mb-4">
        {isSignin ? 'Sign In to Your Family' : 'Create Your Account'}
      </h2>

      <div>
        <label htmlFor="email" className="block text-sm mb-1 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
          required
          placeholder="you@example.com"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm mb-1 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          required
          placeholder="••••••••"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-100"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Loading…' : isSignin ? 'Sign In' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-600 pt-2">
        {isSignin ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
