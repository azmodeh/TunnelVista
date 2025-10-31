'use client';

import { useEffect, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/firebase';

interface AppUser extends User {
  isAdmin?: boolean;
}

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getFirebaseAuth();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (authUser) => {
      if (authUser) {
        const tokenResult = await authUser.getIdTokenResult();
        const claims = tokenResult.claims;
        setUser({ ...authUser, isAdmin: claims.admin === true });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading, isAdmin: user?.isAdmin };
};
