import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function UserVistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
