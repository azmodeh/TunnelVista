import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/firebase/admin';

/**
 * Verifies the session cookie and returns the decoded token.
 * This should be called in server components or route handlers to protect routes.
 * @returns The decoded ID token, or null if the session is invalid.
 */
export async function getSession() {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // Initialize admin auth
    const auth = getAuth(adminApp);
    // Verify the session cookie. `checkRevoked` is true to check if the session is revoked.
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    // The cookie is invalid (e.g., expired, revoked), so we return null.
    // The component or page calling this function should handle the redirection.
    console.error("Error verifying session cookie:", error);
    return null;
  }
}