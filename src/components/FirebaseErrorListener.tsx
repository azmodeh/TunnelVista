'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This component is a client-side listener that exists only to surface
// rich Firestore permission errors to the Next.js development overlay.
// It should not be used in production.
export function FirebaseErrorListener() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be caught by the Next.js
      // error overlay in development mode.
      throw error;
    };

    errorEmitter.on(handleError);

    return () => {
      errorEmitter.off(handleError);
    };
  }, []);

  return null;
}
