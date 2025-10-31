import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminApp } from '@/firebase/admin';

/**
 * Creates a user document in Firestore after signup.
 * This is called from the client-side signup page.
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];

    try {
      const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      const db = getFirestore(adminApp);
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      // Only create the document if it doesn't already exist.
      if (!userDoc.exists) {
        await userRef.set({
          username: name || email?.split('@')[0],
          email: email,
          role: 'user', // Default role
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isVip: false,
          quota: 100,
          quotaUsed: 0,
        });
      }
      
      return NextResponse.json({ status: 'success', userId: uid });

    } catch (error) {
      console.error('Failed to create user document:', error);
      return NextResponse.json({ error: 'Failed to create user document' }, { status: 401 });
    }
  }
  return NextResponse.json({ error: 'No token provided' }, { status: 400 });
}
