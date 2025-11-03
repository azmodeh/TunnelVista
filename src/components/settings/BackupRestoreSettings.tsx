'use client';

import React, { useRef, memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Server, Archive, ArchiveRestore } from 'lucide-react';
import { useBackup } from '@/hooks/use-backup';

export const BackupRestoreSettings = memo(() => {
    const { createBackup, restoreBackup, isBackingUp, isRestoring } = useBackup();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            restoreBackup(file);
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Manage application data backups and restore points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <Archive className="h-12 w-12 text-muted-foreground mb-4"/>
                    <p className="text-muted-foreground mb-4">Create a full backup of your application's configuration.</p>
                    <Button variant="outline" onClick={createBackup} disabled={isBackingUp}>
                        {isBackingUp ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
                        {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <ArchiveRestore className="h-12 w-12 text-muted-foreground mb-4"/>
                    <p className="text-muted-foreground mb-4">Restore configuration from a previously created backup file.</p>
                    <Button variant="outline" onClick={handleRestoreClick} disabled={isRestoring}>
                        {isRestoring ? <Loader2 className="mr-2 animate-spin"/> : <Server className="mr-2"/>}
                        {isRestoring ? 'Restoring...' : 'Restore from File'}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
            </CardContent>
        </Card>
    );
});
BackupRestoreSettings.displayName = 'BackupRestoreSettings';