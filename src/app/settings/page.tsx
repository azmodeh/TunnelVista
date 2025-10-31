'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAppSettings } from '@/hooks/use-settings';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';
import { ApiSettings } from '@/components/settings/ApiSettings';
import { RbacSettings } from '@/components/settings/RbacSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { AuditLogSettings } from '@/components/settings/AuditLogSettings';
import { BackupRestoreSettings } from '@/components/settings/BackupRestoreSettings';
import { NetworkChecks } from '@/components/settings/NetworkChecks';

const queryClient = new QueryClient();

function SettingsPageContent() {
  const { isLoading: isLoadingSettings } = useAppSettings();

  if (isLoadingSettings) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Settings</h1>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="rbac">Access Control</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="backup">Backup/Restore</TabsTrigger>
          <TabsTrigger value="network">Network Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>
        
        <TabsContent value="api">
           <ApiSettings />
        </TabsContent>

        <TabsContent value="rbac">
           <RbacSettings />
        </TabsContent>

        <TabsContent value="notifications">
           <NotificationsSettings />
        </TabsContent>

        <TabsContent value="audit">
           <AuditLogSettings />
        </TabsContent>
        
        <TabsContent value="backup">
           <BackupRestoreSettings />
        </TabsContent>
        
        <TabsContent value="network">
           <NetworkChecks />
        </TabsContent>

      </Tabs>
    </div>
  );
}


export default function SettingsPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsPageContent />
        </QueryClientProvider>
    )
}
