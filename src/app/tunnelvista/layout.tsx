import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function TunnelVistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  if (session.admin !== true) {
    redirect('/uservista');
  }

  return <>{children}</>;
}