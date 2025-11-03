'use client';
    import Link from 'next/link';
    import { usePathname } from 'next/navigation';
    import { Home, Zap, Map, User, Settings, Server, Rocket } from 'lucide-react';
    import { cn } from '@/lib/utils';

    const navItems = [
      { href: '/', label: 'Home', icon: Home },
      { href: '/topology', label: 'Topology', icon: Map },
      { href: '/deploy', label: 'Deploy', icon: Rocket },
      { href: '/servers', label: 'Servers', icon: Server },
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings', label: 'Settings', icon: Settings },
    ];

    export default function Sidebar() {
      const pathname = usePathname();

      return (
        <aside className="w-64 bg-gray-900/70 backdrop-blur-lg border-r border-white/10 text-white flex-shrink-0">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="text-cyan-400" size={28} />
              <h1 className="text-2xl font-bold">TunnelVista</h1>
            </Link>
          </div>
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  pathname === item.href
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'hover:bg-white/10'
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
      );
    }