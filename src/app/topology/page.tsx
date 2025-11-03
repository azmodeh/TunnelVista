'use client';

import { NetworkGraph } from '@/components/topology/NetworkGraph';
import { useCallback, useState, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddTunnel, useDeleteTunnel } from '@/components/tunnels/use-tunnels';
import type { Connection } from 'reactflow';
import { useTopology } from '@/components/topology/use-topology';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';

const TopologyOptimizer = lazy(() => import('@/components/topology/TopologyOptimizer'));


const queryClient = new QueryClient();

function TopologyPageContent() {
  const tanstackQueryClient = useTanstackQueryClient();
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    isLoading, 
    isError, 
    devices, 
    tunnels 
  } = useTopology();

  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  
  const deleteTunnelMutation = useDeleteTunnel();
  const addTunnelMutation = useAddTunnel();
  
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
        addTunnelMutation.mutate({
            sourceDeviceId: connection.source,
            destinationDeviceId: connection.target,
            protocol: 'WireGuard',
        });
    }
  }, [addTunnelMutation]);


  const handleRefresh = () => {
    tanstackQueryClient.invalidateQueries({ queryKey: ['devices'] });
    tanstackQueryClient.invalidateQueries({ queryKey: ['tunnels'] });
  };
  

  return (
    <div className="h-full w-full flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-headline font-bold">Network Topology</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
            </Button>
            <Button onClick={() => setIsOptimizerOpen(true)}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Optimize with AI
            </Button>
        </div>
      </div>
      <motion.div 
        className="h-[60vh] w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : isError ? (
             <div className="flex items-center justify-center h-full text-destructive bg-destructive/10 rounded-lg">
                Failed to load topology data.
            </div>
          ) : (
            <NetworkGraph 
              nodes={nodes} 
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              fitViewOptions={{ maxZoom: 0.8 }}
            />
          )}
      </motion.div>
      <Suspense fallback={null}>
        <TopologyOptimizer 
          isOpen={isOptimizerOpen} 
          onClose={() => setIsOptimizerOpen(false)}
          devices={devices || []}
          tunnels={tunnels || []}
        />
      </Suspense>
    </div>
  );
}

export default function TopologyPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <TopologyPageContent />
        </QueryClientProvider>
    )
}