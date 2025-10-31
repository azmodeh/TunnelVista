
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Device } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getGeoDataForIp } from '@/lib/geoip';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFirebaseFirestore }from '@/firebase';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

// --- Actions with more realistic logic ---

const setupDevice = async (deviceId: string): Promise<{ ok: boolean }> => {
  console.log(`Simulating: Running advanced setup script for device ${deviceId}...`);
  const firestore = getFirebaseFirestore();
  const deviceRef = doc(firestore, 'devices', deviceId);

  // 1. Simulate Backup
  await new Promise(resolve => setTimeout(resolve, 1000));
  await updateDoc(deviceRef, { tags: arrayUnion('backup-complete') });
  console.log(`Simulating: Configuration backup for ${deviceId} created.`);
  
  // 2. Simulate Dependency Check
  await new Promise(resolve => setTimeout(resolve, 1000));
  await updateDoc(deviceRef, { tags: arrayUnion('dependencies-checked') });
  console.log(`Simulating: Dependencies (curl, wireguard-tools) checked on ${deviceId}.`);

  // 3. Main setup & agent installation
  await new Promise(resolve => setTimeout(resolve, 1500));
  await updateDoc(deviceRef, { 
    tags: arrayUnion('setup-complete', 'agent-installed'),
    updatedAt: serverTimestamp() 
  }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: deviceRef.path,
        operation: 'update',
        requestResourceData: { tags: arrayUnion('setup-complete') },
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
  });
  console.log(`Simulating: Device ${deviceId} registered with API and agent installed.`);

  // 4. Initial Heartbeat / Ping
  await pingDevice(deviceId);
  console.log(`Simulating: Initial heartbeat sent for ${deviceId}.`);

  return { ok: true };
};


// React Query Hooks
export const useDevices = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const firestore = getFirebaseFirestore();
        if (!firestore) return;
        
        const devicesCollection = collection(firestore, 'devices');
        const unsubscribe = onSnapshot(devicesCollection, 
            (snapshot) => {
                const devicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Device));
                
                // Post-process to fix stale geo-ip data
                devicesData.forEach(async (device) => {
                  if (device.ip && (!device.country_code || device.location === 'Unknown')) {
                      console.log(`Fixing stale geo-ip for device ${device.name} (${device.ip})`);
                      const { location, country_code } = await getGeoDataForIp(device.ip);
                      if (country_code && location !== 'Unknown') {
                          const deviceRef = doc(firestore, 'devices', device.id);
                          // Fire-and-forget update. The onSnapshot listener will catch the change.
                          updateDoc(deviceRef, { location, country_code }).catch(err => {
                              console.error(`Failed to auto-update geo-ip for ${device.id}:`, err);
                          });
                      }
                  }
                });

                setDevices(devicesData);
                setLoading(false);
            }, 
            async (err) => {
                const permissionError = new FirestorePermissionError({
                    path: devicesCollection.path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);

                console.error("Failed to fetch devices:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { data: { devices, total: devices.length }, isLoading: loading, isError: !!error };
};

export const useAddDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const setupMutation = useSetupDevice();

  return useMutation({
    mutationFn: async (
      newDevice: Omit<Device, 'id' | 'status' | 'last_seen' | 'ping_ms' | 'ping_status' | 'last_ping' | 'location' | 'country_code'>
    ) => {
      const firestore = getFirebaseFirestore();
      const { location, country_code } = await getGeoDataForIp(newDevice.ip);
      
      const deviceData = {
        ...newDevice,
        status: 'offline' as const,
        last_seen: serverTimestamp(),
        ping_ms: null,
        ping_status: 'down' as const,
        last_ping: null,
        location,
        country_code,
        x: Math.random() * 400,
        y: Math.random() * 400,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const devicesCollection = collection(firestore, 'devices');
      const docRef = await addDoc(devicesCollection, deviceData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: devicesCollection.path,
              operation: 'create',
              requestResourceData: deviceData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // re-throw to allow mutation to enter onError state
        });
        
      return { ...deviceData, id: docRef.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast({
        title: 'Device Added',
        description: 'Device added successfully. Running setup script...',
      });
      // Automatically run setup after adding the device
      setupMutation.mutate(data.id);
    },
    onError: (error) => {
      console.error('Failed to add device:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add device. Check permissions.',
      });
    },
  });
};

export const useUpdateDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedDevice: Partial<Device> & { id: string }) => {
      const firestore = getFirebaseFirestore();
      const deviceRef = doc(firestore, 'devices', updatedDevice.id);
      
      const dataToUpdate: Partial<Device> & { updatedAt: any } = {
        ...updatedDevice,
        updatedAt: serverTimestamp(),
      };

      // If IP is being changed, re-fetch geo data.
      if (updatedDevice.ip) {
        const { location, country_code } = await getGeoDataForIp(updatedDevice.ip);
        dataToUpdate.location = location;
        dataToUpdate.country_code = country_code;
      }

      updateDoc(deviceRef, dataToUpdate)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: deviceRef.path,
            operation: 'update',
            requestResourceData: dataToUpdate,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      return updatedDevice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if (!(Object.keys(data).length <= 3 && 'x' in data && 'y' in data && 'id' in data)) {
        toast({
          title: 'Success',
          description: 'Device updated successfully.',
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update device:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update device.',
      });
    },
  });
};

export const useDeleteDevice = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const firestore = getFirebaseFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      deleteDoc(deviceRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: deviceRef.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      return deviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast({
        title: 'Success',
        description: 'Device permanently deleted.',
      });
    },
    onError: (error) => {
      console.error('Failed to delete device:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete device.',
      });
    },
  });
};



const cleanupDevice = async (deviceId: string): Promise<{ ok: boolean; message?: string }> => {
  console.log(`Simulating: Running advanced cleanup script for device ${deviceId}...`);
  const firestore = getFirebaseFirestore();
  const deviceRef = doc(firestore, 'devices', deviceId);

  // 1. Simulate Backup
  await new Promise(resolve => setTimeout(resolve, 500));
  await updateDoc(deviceRef, { tags: arrayUnion('backup-taken') });
  console.log(`Simulating: Pre-cleanup backup for ${deviceId} created.`);

  // 2. Simulate Active Traffic Check
  await new Promise(resolve => setTimeout(resolve, 1000));
  const hasActiveTraffic = Math.random() < 0.2; // 20% chance of having "active traffic"
  if (hasActiveTraffic) {
    console.warn(`Simulating: Active traffic detected on ${deviceId}. Cleanup aborted.`);
    await updateDoc(deviceRef, { tags: arrayRemove('backup-taken') }); // Revert backup tag
    return { ok: false, message: 'Active traffic detected. Cleanup aborted to prevent disruption.' };
  }
  console.log(`Simulating: No active traffic detected. Proceeding with cleanup.`);

  // 3. Simulate removing configs and rules
  await new Promise(resolve => setTimeout(resolve, 1500));
  const cleanupTag = `cleaned-at-${new Date().toISOString().split('T')[0]}`;
  await updateDoc(deviceRef, { 
    tags: arrayUnion(cleanupTag),
    // Remove setup tags to indicate configs are gone
    updatedAt: serverTimestamp() 
  }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: deviceRef.path,
      operation: 'update',
      requestResourceData: { tags: arrayUnion(cleanupTag) },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
  console.log(`Simulating: Unused VPN configs and firewall rules removed for ${deviceId}.`);

  // 4. Simulate final heartbeat
  await pingDevice(deviceId);
  console.log(`Simulating: Post-cleanup heartbeat sent for ${deviceId}.`);

  return { ok: true, message: `Device ${deviceId} cleaned up successfully.` };
};

const pingDevice = async (deviceId: string): Promise<{ping_ms: number | null, status: string}> => {
  console.log(`Pinging device ${deviceId}...`);
  await new Promise(resolve => setTimeout(resolve, 700));
  const ping_ms = Math.floor(Math.random() * (200 - 10 + 1) + 10);
  const ping_status = ping_ms < 50 ? 'good' : ping_ms < 150 ? 'slow' : 'down';
  
  const firestore = getFirebaseFirestore();
  const deviceRef = doc(firestore, 'devices', deviceId);
  updateDoc(deviceRef, {
    ping_ms: ping_ms,
    ping_status: ping_status,
    status: ping_status === 'down' ? 'error' : 'online',
    last_ping: new Date().toISOString(), // Using client time for mock
    last_seen: new Date().toISOString()
  }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: deviceRef.path,
        operation: 'update',
        requestResourceData: {ping_ms, ping_status, status: 'online'},
      });
      errorEmitter.emit('permission-error', permissionError);
  });

  return { ping_ms, status: ping_status };
};

const bulkActionDevices = async ({ deviceIds, action }: { deviceIds: string[], action: 'cleanup' | 'delete' | 'health-check' }): Promise<{ ok: boolean, results?: any[] }> => {
  console.log(`Performing bulk ${action} on devices:`, deviceIds);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const firestore = getFirebaseFirestore();

  if (action === 'delete') {
    const deletePromises = deviceIds.map(id => {
      const deviceRef = doc(firestore, 'devices', id);
      return deleteDoc(deviceRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({ path: deviceRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        // We don't re-throw, to allow other deletions to proceed. Could be improved.
      });
    });
    await Promise.all(deletePromises);
    return { ok: true };
  }
  
  if (action === 'health-check') {
      const results = await Promise.all(deviceIds.map(async (id) => {
        const result = await pingDevice(id);
        return {id, ...result};
      }));
      return { ok: true, results };
  }

  if (action === 'cleanup') {
    const cleanupPromises = deviceIds.map(id => cleanupDevice(id));
    await Promise.all(cleanupPromises);
    return { ok: true };
  }
  
  console.warn(`Unknown bulk action: ${action}`);
  return { ok: false };
}

export const useSetupDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: setupDevice,
    onSuccess: (data, deviceId) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast({
        title: 'Setup Complete',
        description: `Device ${deviceId} setup script simulated successfully.`,
      });
    },
    onError: (error, deviceId) => {
      console.error(`Failed to setup device ${deviceId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to simulate setup for device ${deviceId}.`,
      });
    },
  });
};

export const useCleanupDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: cleanupDevice,
    onSuccess: (data, deviceId) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      if (data.ok) {
        toast({
          title: 'Cleanup Successful',
          description: data.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Cleanup Halted',
          description: data.message,
        });
      }
    },
    onError: (error, deviceId) => {
      console.error(`Failed to cleanup device ${deviceId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Cleanup Error',
        description: `An unexpected error occurred during cleanup for device ${deviceId}.`,
      });
    },
  });
};

export const usePingDevice = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: pingDevice,
        onSuccess: (data, deviceId) => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            toast({
                title: 'Ping Successful',
                description: data.ping_ms ? `Device responded in ${data.ping_ms}ms.` : `Device is offline.`,
            });
        },
        onError: (error, deviceId) => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            toast({
                variant: 'destructive',
                title: 'Ping Failed',
                description: `Device did not respond.`,
            });
        },
    });
};

export const useBulkActionDevices = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (props: { deviceIds: string[], action: 'cleanup' | 'delete' | 'health-check' }) => bulkActionDevices(props),
    onSuccess: (data, { deviceIds, action }) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      let description = `Successfully performed ${action} on ${deviceIds.length} devices.`;
      if (action === 'health-check' && data.results) {
        const reachable = data.results.filter(r => r.status !== 'down').length;
        description = `Health check complete: ${reachable} / ${deviceIds.length} devices are reachable.`;
      }
      toast({
        title: 'Bulk Action Successful',
        description: description,
      });
    },
    onError: (error, { action }) => {
      toast({
        variant: 'destructive',
        title: 'Bulk Action Failed',
        description: `Could not perform bulk ${action}. Please try again.`
      });
    }
  });
}
