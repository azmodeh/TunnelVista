'use client';

import {
  BarChart3,
  GitMerge,
  Server,
  ShieldCheck,
  Route,
  UserCog,
  BookText,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/topology', label: 'Topology', icon: GitMerge },
  { href: '/devices', label: 'Devices', icon: Server },
  { href: '/vpn', label: 'VPN', icon: ShieldCheck },
  { href: '/tunnels', label: 'Tunnels', icon: Route },
  { href: '/users', label: 'Users', icon: UserCog },
  { href: '/logs', label: 'Logs', icon: BookText },
];

export function HeaderTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <nav className="flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 p-2">
          {menuItems.map((item) => {
            const isActive = (pathname.startsWith(item.href) && item.href !== '/') || (pathname === '/' && item.href === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-headline font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 z-0 rounded-md bg-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div whileHover={{ scale: 1.2, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <item.icon className="relative z-10 h-4 w-4" />
                </motion.div>
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}