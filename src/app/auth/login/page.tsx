'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useUser } from '@/firebase/auth/use-user';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ip, setIp] = useState('...');
  const [location, setLocation] = useState('...');
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!userLoading && user) {
      router.push(user.isAdmin ? '/tunnelvista' : '/uservista');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => {
        setIp(d.ip);
        setLocation(`${d.city}, ${d.country_name}`);
      }).catch(() => {
        setIp('N/A');
        setLocation('N/A');
      });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Call the API route to set the session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      setShowSuccess(true);
      // Let the useEffect handle redirection
      router.refresh();

    } catch (error: any) {
      alert('خطا: ' + error.message);
      setLoading(false);
    }
  };

  // Render a loading state while checking for an existing session
  if (userLoading || user) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center">
         <Loader2 className="w-10 h-10 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Loading session...</p>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center gap-6 p-6">
      <div className="w-[220px] h-[220px] flex items-center justify-center bg-muted/20 rounded-full">
         {showSuccess ? <span className='text-5xl'>✅</span> : <span className='text-5xl'>🔑</span>}
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TunnelVista
        </h1>
        <p className="text-sm text-muted-foreground">اتصال امن و سریع</p>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 text-center">
        <p>IP عمومی: {ip}</p>
        <p>موقعیت: {location}</p>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading || showSuccess}
        className="group flex items-center gap-3 px-8 py-4 bg-primary/10 text-foreground rounded-full border border-border/50 transition-all hover:scale-105 disabled:opacity-50 shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            در حال اتصال...
          </>
        ) : showSuccess ? (
          'موفقیت آمیز بود!'
        ) : (
          <>
            <FcGoogle className="w-5 h-5" />
            ورود با Google
          </>
        )}
      </button>
       <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="underline text-accent">
            Sign up
          </Link>
        </div>
    </div>
  );
}
