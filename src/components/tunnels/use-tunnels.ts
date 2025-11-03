'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { VpnTunnel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState, useEffect } from 'react';
import { useAddAuditLog } from '@/hooks/use-audit-log';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  or
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// React Query Hooks
export const useTunnels = (deviceId?: string) => {
    const [tunnels, setTunnels] = useState<VpnTunnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const firestore = getFirebaseFirestore();
        if (!firestore) return;
        
        let q = query(collection(firestore, 'tunnels'));

        if (deviceId) {
            q = query(collection(firestore, 'tunnels'), or(
                where('sourceDeviceId', '==', deviceId),
                where('destinationDeviceId', '==', deviceId)
            ));
        }

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const tunnelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VpnTunnel));
                setTunnels(tunnelsData);
                setLoading(false);
            }, 
            async (err) => {
                const permissionError = new FirestorePermissionError({
                    path: 'tunnels',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                
                console.error("Failed to fetch tunnels:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [deviceId]);
    

    return { data: {tunnels, total: tunnels.length}, isLoading: loading, isError: !!error };
};

export const useAddTunnel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async (
      newTunnel: Omit<VpnTunnel, 'id' | 'status' | 'createdAt'>
    ) => {
      const firestore = getFirebaseFirestore();
      if (newTunnel.sourceDeviceId === newTunnel.destinationDeviceId) {
        throw new Error("Source and destination cannot be the same.");
      }
      
      const tunnelData = {
        ...newTunnel,
        status: 'inactive' as const,
        createdAt: serverTimestamp(),
      };
      
      const tunnelsCollection = collection(firestore, 'tunnels');
      const docRef = await addDoc(tunnelsCollection, tunnelData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: tunnelsCollection.path,
              operation: 'create',
              requestResourceData: tunnelData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });

      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateDoc(docRef, { status: 'active' })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'update',
              requestResourceData: { status: 'active' },
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      return { ...tunnelData, id: docRef.id, status: 'active' as const };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tunnels'] });
      queryClient.invalidateQueries({ queryKey: ['topology'] });
      addAuditLog({
        action: 'create_tunnel',
        details: `Created ${data.protocol} tunnel from ${data.sourceDeviceId} to ${data.destinationDeviceId}`,
        targetId: data.id,
      });
      toast({
        title: 'Success',
        description: 'Tunnel deployed successfully.',
      });
    },
    onError: (error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tunnels'] });
      queryClient.invalidateQueries({ queryKey: ['topology'] });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deploy tunnel. Check permissions.',
      });
    },
  });
};

export const useUpdateTunnel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async (
      updatedTunnel: Partial<VpnTunnel> & { id: string }
    ) => {
      const firestore = getFirebaseFirestore();
      const tunnelRef = doc(firestore, 'tunnels', updatedTunnel.id);
      updateDoc(tunnelRef, updatedTunnel)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: tunnelRef.path,
              operation: 'update',
              requestResourceData: updatedTunnel,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      return updatedTunnel;
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['tunnels'] });
        queryClient.invalidateQueries({ queryKey: ['topology'] });
        addAuditLog({
          action: 'update_tunnel',
          details: `Updated tunnel ${data.id}`,
          targetId: data.id,
        });
      toast({
        title: 'Success',
        description: 'Tunnel updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update Tunnel.',
      });
    },
  });
};

export const useDeleteTunnel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async ({tunnelId}: {tunnelId: string}) => {
        const firestore = getFirebaseFirestore();
        const tunnelRef = doc(firestore, 'tunnels', tunnelId);
        deleteDoc(tunnelRef)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                path: tunnelRef.path,
                operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        return {tunnelId};
    },
    onSuccess: ({tunnelId}) => {
       queryClient.invalidateQueries({ queryKey: ['tunnels'] });
       queryClient.invalidateQueries({ queryKey: ['topology'] });
       addAuditLog({
         action: 'delete_tunnel',
         details: `Deleted tunnel ${tunnelId}`,
         targetId: tunnelId,
       });
      toast({
        title: 'Success',
        description: 'Tunnel deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete Tunnel.',
      });
    },
  });
};


export const useRestartTunnel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addAuditLog = useAddAuditLog();

  return useMutation<VpnTunnel, Error, {tunnel: VpnTunnel}>({
    mutationFn: async ({tunnel}) => {
      const firestore = getFirebaseFirestore();
      const tunnelRef = doc(firestore, 'tunnels', tunnel.id);

      await updateDoc(tunnelRef, { status: 'inactive' })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: tunnelRef.path,
              operation: 'update',
              requestResourceData: { status: 'inactive' },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
      
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await updateDoc(tunnelRef, { status: 'active' })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: tunnelRef.path,
              operation: 'update',
              requestResourceData: { status: 'active' },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
      
      return { ...tunnel, status: 'active' };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tunnels'] });
      addAuditLog({
        action: 'restart_tunnel',
        details: `Restarted tunnel ${data.id}`,
        targetId: data.id,
      });

      toast({
        title: 'Success',
        description: `Tunnel for ${data.protocol} restarted.`,
      });
    },
    onError: (error, {tunnel}) => {
       queryClient.invalidateQueries({ queryKey: ['tunnels'] });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to restart tunnel.`,
      });
    },
  });
};