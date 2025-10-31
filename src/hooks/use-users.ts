'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client';


// React Query Hooks
export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const firestore = getFirebaseFirestore();
        if (!firestore) return;
        const usersCollection = collection(firestore, 'users');

        const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersData);
            setLoading(false);
        }, async (err) => {
            const permissionError = new FirestorePermissionError({
                path: usersCollection.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);

            console.error("Failed to fetch users:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { data: { users, total: users.length }, isLoading: loading, isError: !!error };
};

export const useAddUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newUser: Omit<User, 'id' | 'quotaUsed' | 'status'>
    ) => {
      const firestore = getFirebaseFirestore();
      // This is not a real user creation, just a DB entry.
      // A more robust solution would use a Cloud Function to create a Firebase Auth user as well.
      const id = newUser.email.replace(/[^a-zA-Z0-9]/g, '');
      const userRef = doc(firestore, 'users', id);
      
      const userData: Omit<User, 'id'> = {
          ...newUser,
          quotaUsed: 0,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      }
      
      setDoc(userRef, userData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'create',
              requestResourceData: userData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });

      return { ...userData, id } as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: 'User added successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add user.',
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      updatedUserData: Partial<User> & { id: string }
    ) => {
        const firestore = getFirebaseFirestore();
        const userRef = doc(firestore, 'users', updatedUserData.id);
        updateDoc(userRef, updatedUserData)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: updatedUserData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        return updatedUserData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user.',
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const firestore = getFirebaseFirestore();
      const userRef = doc(firestore, 'users', userId);
      deleteDoc(userRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: `User has been deleted.`,
      });
    },
    onError: (error, userId) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete user.`,
      });
    },
  });
};

export const useBulkActionUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userIds, action, days }: { userIds: string[], action: 'extend' | 'delete' | 'disable' | 'upgrade-vip', days?: number }) => {
        const firestore = getFirebaseFirestore();
        
        for (const id of userIds) {
          const userRef = doc(firestore, 'users', id);
          switch(action) {
              case 'extend':
                  await updateDoc(userRef, { 
                      expiration: addDays(new Date(), days || 30),
                      status: 'active'
                  }).catch(async (serverError) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({path: userRef.path, operation: 'update', requestResourceData: {status: 'active'}}))
                  });
                  break;
              case 'disable':
                  await updateDoc(userRef, { status: 'suspended' }).catch(async (serverError) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({path: userRef.path, operation: 'update', requestResourceData: {status: 'suspended'}}))
                  });
                  break;
              case 'upgrade-vip':
                  await updateDoc(userRef, { 
                      isVip: true, 
                      quota: Infinity, 
                      expiration: addDays(new Date(), 3650),
                      status: 'active'
                  }).catch(async (serverError) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({path: userRef.path, operation: 'update', requestResourceData: {isVip: true}}))
                  });
                  break;
              case 'delete':
                  await deleteDoc(userRef).catch(async (serverError) => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({path: userRef.path, operation: 'delete'}))
                  });
                  break;
          }
        }
        return { userIds, action };
    },
    onSuccess: (data, { action, userIds }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Bulk Action Successful',
        description: `Successfully performed "${action}" on ${userIds.length} users.`,
      });
    },
    onError: (error, { action }) => {
      toast({
        variant: 'destructive',
        title: 'Bulk Action Failed',
        description: `Could not perform bulk action "${action}". Please try again.`
      });
    }
  });
}
