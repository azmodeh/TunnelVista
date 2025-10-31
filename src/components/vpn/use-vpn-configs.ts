'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { VpnConfig, VpnProtocol, Device } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { VPN_PROTOCOLS } from '@/lib/types';
import { useDevices } from '../devices/use-devices';
import { useMemo, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type DeviceVpnConfigSummary = {
  device: Device;
  protocols: Array<{
    protocol: VpnProtocol;
    config: VpnConfig | null;
  }>
}

// React Query Hooks
export const useVpnConfigs = () => {
  const { toast } = useToast();
  const { data: deviceData, isLoading: isLoadingDevices, isError: isErrorDevices } = useDevices();
  const devices = deviceData?.devices || [];
  
  const [vpnConfigs, setVpnConfigs] = useState<VpnConfig[]>([]);
  const [isLoadingVpns, setIsLoadingVpns] = useState(true);
  const [isErrorVpns, setIsErrorVpns] = useState<Error | null>(null);

  useEffect(() => {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const vpnConfigsCollection = collection(firestore, 'vpn_configs');
    const unsubscribe = onSnapshot(vpnConfigsCollection, 
      (snapshot) => {
        const configs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VpnConfig));
        setVpnConfigs(configs);
        setIsLoadingVpns(false);
      },
      async (error) => {
        const permissionError = new FirestorePermissionError({
            path: vpnConfigsCollection.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        console.error("Failed to fetch VPN configs:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load VPN configurations.' });
        setIsErrorVpns(error);
        setIsLoadingVpns(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);


  const summaries = useMemo(() => {
    if (isLoadingDevices) return [];
    
    return devices.map(device => {
      const deviceProtocols = VPN_PROTOCOLS.map(protocol => {
        const config = vpnConfigs?.find(c => c.deviceId === device.id && c.protocol === protocol) || null;
        return { protocol, config };
      });
      return { device, protocols: deviceProtocols };
    });

  }, [devices, vpnConfigs, isLoadingDevices]);
  
  return {
    data: summaries,
    devices,
    isLoading: isLoadingDevices || isLoadingVpns,
    isError: isErrorVpns || isErrorDevices,
  }
};

export const useAddVpnConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newConfig: Omit<VpnConfig, 'id' | 'status' | 'activePeers'>) => {
      const firestore = getFirebaseFirestore();
      const configData = {
        ...newConfig,
        status: 'deploying' as const,
        activePeers: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const vpnConfigsCollection = collection(firestore, 'vpn_configs');
      const docRef = await addDoc(vpnConfigsCollection, configData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: vpnConfigsCollection.path,
            operation: 'create',
            requestResourceData: configData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
      
      // Simulate deployment time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateDoc(docRef, { status: 'deployed' }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { status: 'deployed' },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
      
      return { ...configData, id: docRef.id, status: 'deployed' as const };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] }); 
      toast({
        title: 'Success',
        description: `${data.protocol} server deployed successfully on device ${data.deviceId}.`,
      });
    },
    onError: (err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to deploy ${variables.protocol} server.`,
      });
    },
  });
};

export const useUpdateVpnConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updatedConfig: Partial<VpnConfig> & { id: string }) => {
      const firestore = getFirebaseFirestore();
      const configRef = doc(firestore, 'vpn_configs', updatedConfig.id);
      const dataToUpdate = { ...updatedConfig, updatedAt: serverTimestamp() };
      updateDoc(configRef, dataToUpdate)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: configRef.path,
                operation: 'update',
                requestResourceData: dataToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      return updatedConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
      toast({
        title: 'Success',
        description: 'VPN configuration updated successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update VPN configuration.',
      });
    },
  });
};

export const useDeleteVpnConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (configId: string) => {
       const firestore = getFirebaseFirestore();
       const configRef = doc(firestore, 'vpn_configs', configId);
       deleteDoc(configRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: configRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
       return configId;
    },
    onSuccess: (configId) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
      toast({
        title: 'Success',
        description: 'VPN configuration deleted successfully.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete VPN configuration.',
      });
    },
  });
};

export const useRestartVpnConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (configId: string) => {
      const firestore = getFirebaseFirestore();
      const configRef = doc(firestore, 'vpn_configs', configId);
      
      await updateDoc(configRef, { status: 'restarting' }).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({path: configRef.path, operation: 'update', requestResourceData: { status: 'restarting' }}))
        throw serverError;
      });
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      await updateDoc(configRef, { status: 'deployed' }).catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({path: configRef.path, operation: 'update', requestResourceData: { status: 'deployed' }}))
        throw serverError;
      });

      return configId;
    },
    onSuccess: (configId) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
      toast({
        title: 'Success',
        description: `VPN service restarted.`,
      });
    },
    onError: (error, configId) => {
      queryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to restart VPN service.`,
      });
    },
  });
};
