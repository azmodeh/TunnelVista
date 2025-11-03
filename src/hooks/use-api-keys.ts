'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiKey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAddAuditLog } from '@/hooks/use-audit-log';
import { useMemo, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// React Query Hooks
export const useApiKeys = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const firestore = getFirebaseFirestore();
        if (!firestore) return;

        const apiKeysCollection = collection(firestore, 'apiKeys');
        const unsubscribe = onSnapshot(apiKeysCollection,
            (snapshot) => {
                const keys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiKey));
                setApiKeys(keys);
                setLoading(false);
            },
            async (err) => {
                const permissionError = new FirestorePermissionError({ path: apiKeysCollection.path, operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Failed to fetch API keys:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const userIds = useMemo(() => {
        if (!apiKeys) return [];
        const ids = apiKeys.map(key => key.userId);
        return [...new Set(ids)];
    }, [apiKeys]);
    

    return {
        data: apiKeys,
        userIds,
        isLoading: loading, 
        isError: !!error,
    };
};

export const useGenerateApiKey = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const addAuditLog = useAddAuditLog();
    
    return useMutation({
        mutationFn: async ({ userId, scope }: { userId: string; scope: string }): Promise<string> => {
            const plainKey = `tv_${uuidv4().replace(/-/g, '')}`;
            
            const newApiKey: Omit<ApiKey, 'id'> = {
                keyId: uuidv4().split('-')[0],
                hashedKey: plainKey, // Storing plain key for demo, VERY BAD PRACTICE
                userId: userId,
                scope: scope,
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: serverTimestamp(),
            };
            
            const firestore = getFirebaseFirestore();
            const apiKeysCollection = collection(firestore, 'apiKeys');
            await addDoc(apiKeysCollection, newApiKey).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: apiKeysCollection.path,
                  operation: 'create',
                  requestResourceData: newApiKey,
                });
                errorEmitter.emit('permission-error', permissionError);
                throw serverError;
            });

            addAuditLog({
                action: 'generate_api_key',
                details: `Generated API key with scope '${scope}' for user ${userId}`,
                targetId: userId,
            });

            return plainKey;
        },
        onSuccess: (plainKey) => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
            toast({
                title: 'API Key Generated',
                description: 'A new API key has been successfully generated. Copy it now.',
            });
            return plainKey;
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: (error as Error).message || 'Could not generate the API key.',
            });
        },
    });
};

export const useRevokeApiKey = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const addAuditLog = useAddAuditLog();

    return useMutation({
        mutationFn: async (apiKeyId: string) => {
            const firestore = getFirebaseFirestore();
            const apiKeyRef = doc(firestore, 'apiKeys', apiKeyId);
            await deleteDoc(apiKeyRef).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: apiKeyRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
                throw serverError;
            });
            return apiKeyId;
        },
        onSuccess: (apiKeyId) => {
             addAuditLog({
                action: 'revoke_api_key',
                details: `Revoked API key`,
                targetId: apiKeyId
            });
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
            toast({
                title: 'API Key Revoked',
                description: 'The API key has been successfully revoked.',
            });
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Revoke Failed',
                description: (error as Error).message || 'Could not revoke the API key.',
            });
        },
    });
};