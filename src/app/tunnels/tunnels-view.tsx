'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useTunnels, useDeleteTunnel } from '@/components/tunnels/use-tunnels';
import { useDevices } from '@/components/devices/use-devices';
import { Skeleton } from '@/components/ui/skeleton';
import { type VpnTunnel, type Device, VpnTunnelProtocol } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Edit, Network, ArrowRight, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TunnelDeployForm = lazy(() => import('@/components/tunnels/TunnelDeployForm'));
const QRScannerModal = lazy(() => import('@/components/tunnels/QRScannerModal'));

const statusStyles: Record<VpnTunnel['status'], string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};

const protocolStyles: Record<VpnTunnelProtocol, string> = {
  OpenVPN: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
  WireGuard: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
  IKEv2: 'bg-green-500/20 text-green-300 border-green-400/50',
  L2TP: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
  'Trojan (WS/Reality)': 'bg-pink-500/20 text-pink-300 border-pink-400/50',
  'VLESS (WS)': 'bg-purple-500/20 text-purple-300 border-purple-400/50',
  '6TO4': 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50',
  IPIP: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50',
  GRE: 'bg-orange-600/20 text-orange-400 border-orange-500/50',
  IPIPV6: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
  GRE6: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50',
  'MIX IPIPV6': 'bg-gray-600/20 text-gray-400 border-gray-500/50',
};


export default function TunnelsView() {
  const { data: tunnelsData, isLoading: tunnelsLoading, isError: tunnelsError } = useTunnels();
  const tunnels = tunnelsData?.tunnels || [];
  const { data: devicesData, isLoading: devicesLoading, isError: devicesError } = useDevices();
  const devices = devicesData?.devices || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingTunnel, setEditingTunnel] = useState<VpnTunnel | null>(null);

  const { isUser, isAdmin } = useUser();
  const canMutate = isAdmin || !isUser;

  const deleteTunnelMutation = useDeleteTunnel();

  const handleAddNew = () => {
    setEditingTunnel(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tunnel: VpnTunnel) => {
    setEditingTunnel(tunnel);
    setIsModalOpen(true);
  };
  
  const handleDelete = (tunnel: VpnTunnel) => {
    deleteTunnelMutation.mutate({ tunnelId: tunnel.id });
  };
  
  const handleScan = (data: string | null) => {
    if (data) {
      console.log('Scanned data:', data);
      // Here you would typically parse the data and create a new tunnel config
      // For now, we just log it.
      setIsScannerOpen(false);
    }
  }

  const deviceMap = useMemo(() => {
    return devices.reduce((acc: Record<string, Device>, device) => {
      acc[device.id] = device;
      return acc;
    }, {});
  }, [devices]);

  const filteredTunnels = useMemo(() => {
    if (!tunnels) return [];
    return tunnels.filter(tunnel => {
      const source = deviceMap[tunnel.sourceDeviceId];
      const destination = deviceMap[tunnel.destinationDeviceId];
      const query = searchQuery.toLowerCase();
      return (
        source?.name.toLowerCase().includes(query) ||
        destination?.name.toLowerCase().includes(query) ||
        tunnel.protocol.toLowerCase().includes(query)
      );
    });
  }, [tunnels, deviceMap, searchQuery]);
  
  const isLoading = tunnelsLoading || devicesLoading;
  const isError = tunnelsError || devicesError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-headline font-bold">Tunnels</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input 
            placeholder="Search by device or protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto"
          />
          <TooltipProvider>
             <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    onClick={() => setIsScannerOpen(true)}
                    variant="outline"
                    className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300"
                    disabled={!canMutate}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR
                  </Button>
                </span>
              </TooltipTrigger>
              {!canMutate && (
                <TooltipContent>
                  <p>You do not have permission to scan tunnels.</p>
                </TooltipContent>
              )}
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    onClick={handleAddNew}
                    className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg"
                    disabled={!canMutate}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Tunnel
                  </Button>
                </span>
              </TooltipTrigger>
              {!canMutate && (
                <TooltipContent>
                  <p>You do not have permission to add tunnels.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {isLoading && (
        <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
      )}
      
      {isError && (
        <div className="text-red-500 p-4 rounded-md bg-red-900/20 border border-red-500/50">
          Failed to load tunnels or devices. Please try again later.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="glass-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTunnels.map(tunnel => {
                const source = deviceMap[tunnel.sourceDeviceId];
                const destination = deviceMap[tunnel.destinationDeviceId];
                
                return (
                  <TableRow key={tunnel.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Network className="h-5 w-5 text-muted-foreground" />
                        <span>{source?.name || 'Unknown'}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                        <span>{destination?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(protocolStyles[tunnel.protocol])}>
                        {tunnel.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', statusStyles[tunnel.status])}>
                        {tunnel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild><span tabIndex={0}><Button variant="ghost" size="icon" onClick={() => handleEdit(tunnel)} className="hover:text-purple-400" disabled={!isAdmin}><Edit className="h-4 w-4" /></Button></span></TooltipTrigger>
                            {!isAdmin && <TooltipContent><p>Only Admins can edit.</p></TooltipContent>}
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:text-red-500" disabled={!isAdmin}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete Tunnel?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the {tunnel.protocol} tunnel between {source?.name} and {destination?.name}.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(tunnel)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </span>
                            </TooltipTrigger>
                            {!isAdmin && <TooltipContent><p>Only Admins can delete.</p></TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredTunnels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No tunnels found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-lg h-[60vh]" /></div>}>
          <TunnelDeployForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tunnel={editingTunnel}
            devices={devices}
          />
        </Suspense>
      )}
      
      {isScannerOpen && (
         <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-md h-[50vh]" /></div>}>
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
         </Suspense>
      )}
    </div>
  );
}
