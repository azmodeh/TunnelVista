'use client';

import React, { useState } from 'react';
import { useVpnConfigs } from './use-vpn-configs';
import { Skeleton } from '../ui/skeleton';
import { VpnConfigTable } from './VpnConfigTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function VpnConfigManager() {
  const { data: summaries, isLoading, isError, devices } = useVpnConfigs();

  return (
    <div className="space-y-6">
       {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {isError && (
        <div className="text-red-500 p-4 rounded-md bg-red-900/20 border border-red-500/50">
          Failed to load VPN configurations. Please try again later.
        </div>
      )}
      {summaries && devices && devices.length > 0 ? (
        <VpnConfigTable 
          summaries={summaries}
        />
      ) : !isLoading && (
        <Card className="glass-card text-center">
            <CardHeader>
                <CardTitle>No Devices Found</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Server className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">You need to add a device before you can deploy a VPN server.</p>
                <Button asChild>
                    <Link href="/devices">
                        Add a Device
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
