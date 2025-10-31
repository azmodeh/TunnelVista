'use client';

import { QueryClient, QueryClientProvider, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { useDevices } from '@/components/devices/use-devices';
import { useTunnels } from '@/components/tunnels/use-tunnels';
import { useUsers } from '@/hooks/use-users';
import { useVpnConfigs } from '@/components/vpn/use-vpn-configs';
import { useMemo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceList } from '@/components/dashboard/device-list';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, ShieldCheck, Network, Users } from 'lucide-react';
import { AnimatedGreeting } from '@/components/dashboard/AnimatedGreeting';
import { DeviceStatusChart } from '@/components/dashboard/device-status-chart';
import { TunnelStatusChart } from '@/components/dashboard/tunnel-status-chart';
import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/animations';

const queryClient = new QueryClient();


function DashboardPageContent() {
  const { data: deviceData, isLoading: isLoadingDevices, isError: isErrorDevices } = useDevices();
  const { data: tunnelData, isLoading: isLoadingTunnels, isError: isErrorTunnels } = useTunnels();
  const { data: userData, isLoading: isLoadingUsers, isError: isErrorUsers } = useUsers();
  const { data: vpnData, isLoading: isLoadingVpns, isError: isErrorVpns } = useVpnConfigs();
  const tanstackQueryClient = useTanstackQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate queries to refetch data periodically
      tanstackQueryClient.invalidateQueries({ queryKey: ['devices'] });
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [tanstackQueryClient]);

  const isLoading = isLoadingDevices || isLoadingTunnels || isLoadingUsers || isLoadingVpns;
  const isError = isErrorDevices || isErrorTunnels || isErrorUsers || isErrorVpns;

  const stats = useMemo(() => {
    const activeTunnels = tunnelData?.tunnels?.filter(t => t.status === 'active').length || 0;
    const activeVpns = vpnData?.reduce((acc, summary) => {
        const deployedCount = summary.protocols.filter(p => p.config?.status === 'deployed').length;
        return acc + deployedCount;
    }, 0) || 0;
    
    return [
        { title: 'Total Devices', value: String(deviceData?.total || 0), icon: Server },
        { title: 'Active VPNs', value: String(activeVpns), icon: ShieldCheck },
        { title: 'Active Tunnels', value: String(activeTunnels), icon: Network },
        { title: 'Total Users', value: String(userData?.total || 0), icon: Users },
    ]
  }, [deviceData, tunnelData, vpnData, userData]);
  
  const handleRefresh = () => {
    tanstackQueryClient.invalidateQueries({ queryKey: ['devices'] });
    tanstackQueryClient.invalidateQueries({ queryKey: ['tunnels'] });
    tanstackQueryClient.invalidateQueries({ queryKey: ['users'] });
    tanstackQueryClient.invalidateQueries({ queryKey: ['vpnConfigs'] });
  };

  return (
    <>
    <AnimatedGreeting />
    <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
            <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
            </Button>
        </div>

        {isError && (
            <div className="text-red-500 p-4 rounded-md bg-red-900/20 border border-red-500/50">
              Failed to load dashboard data. Please try again later.
            </div>
        )}

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
        ) : (
          stats.map(stat => <StatCard key={stat.title} {...stat} />)
        )}
      </motion.div>
      
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            {isLoadingDevices ? <Skeleton className="h-full w-full" /> : <DeviceStatusChart devices={deviceData?.devices || []} />}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tunnel Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            {isLoadingTunnels ? <Skeleton className="h-full w-full" /> : <TunnelStatusChart tunnels={tunnelData?.tunnels || []} />}
          </CardContent>
        </Card>
      </motion.div>

       <motion.div className="grid grid-cols-1" variants={containerVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>All Devices</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoadingDevices ? <Skeleton className="h-[300px] w-full" /> : <DeviceList devices={deviceData?.devices || []} />}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
    </>
  );
}

export default function DashboardPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <DashboardPageContent />
        </QueryClientProvider>
    )
}
