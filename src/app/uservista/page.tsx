import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function UserVistaPage() {
  const session = await getSession();

  // If there's no session, redirect to login. This is a server-side check.
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">پنل کاربری (UserVista)</h1>
      <p>خوش آمدید، {session?.email}</p>
      <div className="mt-4 bg-accent/10 p-4 rounded-lg border border-accent/20">
        <p>اینجا پنل کاربری شماست. می‌توانید کانفیگ‌های VPN خود را در اینجا مشاهده و دانلود کنید.</p>
        <pre className="mt-4 p-2 bg-background/50 rounded text-xs text-muted-foreground whitespace-pre-wrap">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
