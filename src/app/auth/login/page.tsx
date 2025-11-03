'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const idToken = await user.getIdToken();

      // Create session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      // Fetch user role to redirect correctly
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.isAdmin;

      if (isAdmin) {
        router.push('/tunnelvista');
      } else {
        router.push('/uservista');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md bg-glass backdrop-blur-lg border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">TunnelVista</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to access your secure dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full text-lg py-6 bg-white/10 hover:bg-white/20 border border-white/20"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <FcGoogle className="mr-3 h-7 w-7" />
              )}
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}