'use client';

import { VpnGenerationForm } from '@/components/vpn/VpnGenerationForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient();

function ConfigureVpnPageContent() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-headline font-bold">Configure VPN</h1>
                <Button onClick={() => queryClient.invalidateQueries()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>
            <p className="text-muted-foreground">Generate and deploy VPN configurations for your users and devices.</p>
            <VpnGenerationForm />
        </div>
    )
}


export default function ConfigureVpnPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigureVpnPageContent />
        </QueryClientProvider>
    )
}
