'use client';

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let googleProvider: GoogleAuthProvider;


function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  googleProvider = new GoogleAuthProvider();

  return { firebaseApp, auth, firestore, googleProvider };
}

// Hooks to use in components
export const getFirebaseApp = () => {
  if (!firebaseApp) initializeFirebase();
  return firebaseApp;
};

export const getFirebaseAuth = () => {
  if (!auth) initializeFirebase();
  return auth;
};

export const getFirebaseFirestore = () => {
  if (!firestore) initializeFirebase();
  return firestore;
};

export const getGoogleProvider = () => {
  if (!googleProvider) initializeFirebase();
  return googleProvider;
}

export { useUser } from './auth/use-user';
export { FirebaseProvider } from './provider';
