import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TunnelVistaPage() {
  const session = await getSession();

  // Redirect if no session or user is not an admin
  if (!session || session.admin !== true) {
    redirect('/uservista');
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">داشبورد ادمین (TunnelVista)</h1>
      <p>خوش آمدید، {session?.email}</p>
      <p className="mt-4 bg-primary/10 p-4 rounded-lg border border-primary/20">اینجا داشبورد ادمین است. فقط کاربران با نقش `admin` به این صفحه دسترسی دارند.</p>
    </div>
  );
}