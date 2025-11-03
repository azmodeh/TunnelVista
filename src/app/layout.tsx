import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';


export const metadata: Metadata = {
  title: 'TunnelVista AI',
  description: 'AI-Powered Network Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/alihosseini-design/react-flagpack@main/dist/index.css"
        />
      </head>
      <body className={cn('font-body antialiased bg-background text-foreground')}>
        <FirebaseClientProvider>
          <div className="flex h-svh flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
          </main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}