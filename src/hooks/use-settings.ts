'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useUser } from '@/firebase/auth/use-user';


// Define a type for your settings for stronger type safety
export interface AppSettings {
  id: string;
  appDomain?: string;
  theme?: 'dark' | 'light';
  logRetention?: number;
  pollingInterval?: number;
  cloudflareEmail?: string;
  cloudflareKey?: string;
  cloudflareZoneId?: string;
  openaiEndpoint?: string;
  openaiModel?: string;
  openaiToken?: string;
  dbDriver?: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbName?: string;
  emailEnabled?: boolean;
  emailAddress?: string;
  webhookEnabled?: boolean;
  webhookUrl?: string;
  enabledEvents?: string[];
  updatedAt?: any;
}


// A fixed ID for the single settings document
const SETTINGS_DOC_ID = 'global-settings';


// React Query Hook to get settings
export const useAppSettings = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { isAdmin, loading: userLoading } = useUser();

    useEffect(() => {
        if (userLoading) {
            return; // Wait for user role to be determined
        }

        if (!isAdmin) {
            setLoading(false);
            setSettings(null); // Non-admins shouldn't see settings
            return;
        }

        const firestore = getFirebaseFirestore();
        if (!firestore) {
            setLoading(false);
            return;
        };

        const settingsDocRef = doc(firestore, 'app_settings', SETTINGS_DOC_ID);
        const unsubscribe = onSnapshot(settingsDocRef, 
            (docSnap) => {
                if (docSnap.exists()) {
                    setSettings({ id: docSnap.id, ...docSnap.data() } as AppSettings);
                } else {
                    // Document doesn't exist, maybe set default/initial state
                    setSettings({ id: SETTINGS_DOC_ID }); 
                }
                setLoading(false);
            }, 
            (err) => {
                const permissionError = new FirestorePermissionError({
                    path: settingsDocRef.path,
                    operation: 'get',
                } satisfies SecurityRuleContext);
                errorEmitter.emit(permissionError);
                
                console.error("Failed to fetch settings:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isAdmin, userLoading]);

    return { data: settings, isLoading: loading, isError: !!error };
};

// React Query Hook to update settings
export const useUpdateAppSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      settings: Partial<Omit<AppSettings, 'id'>>
    ) => {
      const firestore = getFirebaseFirestore();
      const settingsDocRef = doc(firestore, 'app_settings', SETTINGS_DOC_ID);
      const dataToSet = {
        ...settings,
        updatedAt: serverTimestamp(),
      };
      
      setDoc(settingsDocRef, dataToSet, { merge: true }).catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'update',
            requestResourceData: dataToSet,
          } satisfies SecurityRuleContext);
          errorEmitter.emit(permissionError);
      });
      
      return dataToSet;
    },
    onSuccess: (data) => {
      // Manually update the cache to reflect the change immediately
      queryClient.setQueryData(['appSettings'], (oldData: any) => ({...oldData, ...data}));
      toast({
        title: 'Success',
        description: 'Settings updated successfully.',
      });
    },
    onError: (error) => {
       // This will likely not be called for permission errors now, but kept for other potential errors.
       console.error('Failed to update settings:', error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: (error as Error).message || 'Failed to update settings.',
       });
    },
  });

  return mutation;
};