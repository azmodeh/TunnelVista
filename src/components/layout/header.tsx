'use client';

import { Button } from '@/components/ui/button';
import { Bell, Settings, UserCircle, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { getFirebaseAuth } from '@/firebase';
import { GlobalSearch } from './GlobalSearch';
import { HeaderTabs } from './header-tabs';
import { useRouter } from 'next/navigation';


export function Header() {
  const { user, loading } = useUser();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await getFirebaseAuth().signOut();
    // Redirect to login page after sign out
    router.push('/login');
  };


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <Logo />
      </div>
      
      <div className="flex flex-1 justify-center">
        {user && <HeaderTabs />}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {user && (
          <>
            <GlobalSearch />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {loading ? (
                <Skeleton className="h-5 w-5 rounded-full" />
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-5 w-5 rounded-full" />
              ) : (
                <UserCircle className="h-5 w-5" />
              )}
              <span className="sr-only">User Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  {user.displayName || user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Logout</span>
                </DropdownMenuItem>
              </>
            ) : (
                 <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4"/>
                      Login
                    </Link>
                 </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

const Logo = () => (
    <Link href="/dashboard" className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
            />
            <path d="M2 7L12 12L22 7" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 12V22" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="round" />
            <path
            d="M7 9.5L17 14.5"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            <path
            d="M17 9.5L7 14.5"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
    </Link>
);