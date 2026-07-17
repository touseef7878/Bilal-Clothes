'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';

// After login, check if user is admin and redirect accordingly
async function getPostLoginRedirect(userId: string, fallback: string): Promise<string> {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  // If they're an admin and no explicit redirect was set, send to admin panel
  if (data && (fallback === '/account' || fallback === '/')) {
    return '/admin';
  }
  return fallback;
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  // If already logged in, redirect to right place
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const dest = await getPostLoginRedirect(session.user.id, redirect);
        router.push(dest);
      }
    })();
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        if (data.session) {
          const dest = await getPostLoginRedirect(data.session.user.id, redirect);
          router.push(dest);
        } else {
          // Email confirmation required
          setError('');
          setLoading(false);
          // Show success message instead
          setMode('confirm' as any);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          const dest = await getPostLoginRedirect(data.session.user.id, redirect);
          router.push(dest);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Email confirmation pending state
  if ((mode as any) === 'confirm') {
    return (
      <div className="container-narrow max-w-md py-8 sm:py-12 animate-fade-in">
        <div className="rounded-xl border p-5 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMode('login')}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow max-w-md py-8 sm:py-12 animate-fade-in">
      <div className="rounded-xl border p-5 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-center mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Join Bilal Clothes for a better shopping experience'}
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Ahmed Ali"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-primary font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
