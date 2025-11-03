'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const COLLECTIONS_TO_BACKUP = ['devices', 'tunnels', 'users', 'vpnConfigs', 'appSettings', 'apiKeys', 'auditLogs', 'logAnalysis'];

export function useBackup() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const createBackup = async () => {
        setIsBackingUp(true);
        toast({ title: 'Starting Backup', description: 'Fetching data from all collections...' });

        try {
            const backupData: Record<string, any[]> = {};

            for (const collectionName of COLLECTIONS_TO_BACKUP) {
                // We fetch the data directly from the query cache.
                // This assumes that the data is already loaded in the app.
                const queryState = queryClient.getQueryState([collectionName]);

                let dataToBackup = [];
                 if (queryState?.data) {
                    const data = queryState.data as any;
                    // Handle structures like { devices: [], total: X } vs just []
                    if (typeof data === 'object' && !Array.isArray(data)) {
                        const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
                        if (arrayKey) {
                            dataToBackup = data[arrayKey];
                        } else {
                            // It's a single object (like appSettings)
                            dataToBackup = [data];
                        }
                    } else if (Array.isArray(data)) {
                        dataToBackup = data;
                    }
                }
                backupData[collectionName] = dataToBackup;
            }
            
            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `tunnel-vista-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({ title: 'Backup Successful', description: 'Your data has been downloaded.' });
        } catch (error) {
            console.error('Backup failed:', error);
            toast({
                variant: 'destructive',
                title: 'Backup Failed',
                description: (error as Error).message || 'Could not create backup.',
            });
        } finally {
            setIsBackingUp(false);
        }
    };

    const restoreBackup = async (file: File) => {
        setIsRestoring(true);
        toast({ title: 'Starting Restore', description: 'This is a mock restore. No data will be changed on the server.' });

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log("Backup file selected:", file.name);
            console.warn("MOCK RESTORE: In a real app, this would trigger a secure backend process to restore Firestore data.");
            
            // For the demo, we could read the file and update the query cache,
            // but that could lead to an inconsistent state. We will just show a success message.

            toast({ title: 'Restore Processed (Mock)', description: 'In a real application, a backend process would now be restoring your data.' });
        } catch (error) {
            console.error('Restore failed:', error);
            toast({
                variant: 'destructive',
                title: 'Restore Failed',
                description: (error as Error).message || 'Could not restore data. Make sure the backup file is valid.',
            });
        } finally {
            setIsRestoring(false);
        }
    };

    return {
        createBackup,
        restoreBackup,
        isBackingUp,
        isRestoring,
    };
}