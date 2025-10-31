import { getAuth } from 'firebase-admin/auth';
import { NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/firebase/admin';

/**
 * Exchanges a Firebase ID token for a session cookie.
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    // Session cookie expires in 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
      // Create the session cookie. This will also verify the ID token.
      const sessionCookie = await getAuth(adminApp).createSessionCookie(idToken, { expiresIn });
      const options = { 
        name: '__session', 
        value: sessionCookie, 
        maxAge: expiresIn, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' 
      };
      
      const response = NextResponse.json({ status: 'success' });
      // Set the session cookie on the browser.
      response.cookies.set(options);
      return response;

    } catch (error) {
      console.error('Failed to create session cookie:', error);
      return NextResponse.json({ error: 'Failed to create session cookie' }, { status: 401 });
    }
  }
  return NextResponse.json({ error: 'No token provided' }, { status: 400 });
}

/**
 * Deletes the session cookie.
 */
export async function DELETE() {
    const response = NextResponse.json({ status: 'success' });
    response.cookies.delete('__session');
    return response;
}
