'use client';

import { VpnConfigManager } from '@/components/vpn/VpnConfigManager';
import { QueryClient, QueryClientProvider, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const queryClient = new QueryClient();

function VpnPageContent() {
    const client = useTanstackQueryClient();
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-headline font-bold">VPN Servers</h1>
                <Button onClick={() => client.invalidateQueries({ queryKey: ['vpnConfigs'] })} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>
            <p className="text-muted-foreground">Deploy and manage VPN server instances on your devices.</p>
            <VpnConfigManager />
        </div>
    )
}

export default function VpnPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <VpnPageContent />
    </QueryClientProvider>
  );
}
