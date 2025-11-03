'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './index';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  
  useEffect(() => {
    const firebaseApp = getFirebaseApp();
    const firebaseAuth = getFirebaseAuth();
    const firebaseFirestore = getFirebaseFirestore();
    
    setApp(firebaseApp);
    setAuth(firebaseAuth);
    setFirestore(firebaseFirestore);
  }, []);

  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(FirebaseContext);
};