'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean | 'google'>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const auth = getFirebaseAuth();

  const handleSuccessfulLogin = async (user: FirebaseUser) => {
    try {
      const idToken = await user.getIdToken();

      // Create user document and session cookie via API routes
      await fetch('/api/user/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      router.push('/uservista');
      router.refresh(); // Ensure server-side state is updated
    } catch (apiError: any) {
       setError(apiError.message || 'Failed to complete signup.');
       setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await handleSuccessfulLogin(userCredential.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(result.user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-balance text-muted-foreground">
            Create your TunnelVista account
          </p>
        </div>
        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!!loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={!!loading}>
            {loading === true && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}