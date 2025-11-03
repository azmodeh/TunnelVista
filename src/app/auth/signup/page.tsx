'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | 'google'>(false);
  const router = useRouter();

  const handleSuccessfulLogin = async (user: FirebaseUser) => {
    try {
      const idToken = await user.getIdToken();

      await fetch('/api/user/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      router.push('/uservista');
      router.refresh();
    } catch (apiError: any) {
       setError(apiError.message || 'Failed to complete signup.');
       setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await handleSuccessfulLogin(userCredential.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-400">Join TunnelVista today!</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
              className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 bg-gray-700 border-gray-600 placeholder-gray-500"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!!loading}>
            {loading === true ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
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
        <div className="text-center text-gray-400">
          <p>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;