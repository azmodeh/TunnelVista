'use client';

import React, { useState, Fragment, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, RefreshCcw, ChevronDown, ChevronRight, Rocket, ShieldCheck, Lock, Router, Waypoints, Zap, QrCode } from 'lucide-react';
import type { VpnConfig, VpnStatus, Device, VpnProtocol } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDeleteVpnConfig, useRestartVpnConfig, DeviceVpnConfigSummary, useAddVpnConfig } from './use-vpn-configs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { fadeInUpVariants, shakeAnimation } from '@/lib/animations';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/firebase/auth/use-user';
import { SoftRoundedCard } from '../ui/SoftRoundedCard';

const VpnConfigForm = lazy(() => import('./VpnConfigForm'));
const VpnClientConfigGenerator = lazy(() => import('./VpnClientConfigGenerator'));


const protocolStyles: Record<VpnProtocol, string> = {
  WireGuard: 'bg-teal-500/20 text-teal-300 border-teal-400/50',
  OpenVPN: 'bg-green-500/20 text-green-300 border-green-400/50',
  L2TP: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
  IKEv2: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
  'Trojan (WS/Reality)': 'bg-purple-500/20 text-purple-300 border-purple-400/50',
  'VLESS (WS)': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
};

const protocolIcons: Record<VpnProtocol, React.ElementType> = {
  WireGuard: Lock,
  OpenVPN: ShieldCheck,
  L2TP: Router,
  IKEv2: ShieldCheck,
  'Trojan (WS/Reality)': Waypoints,
  'VLESS (WS)': Zap,
};

const statusStyles: Record<VpnStatus, string> = {
  deployed: 'bg-teal-500/20 text-teal-300 border-teal-400',
  deploying: 'bg-yellow-500/20 text-yellow-300 border-yellow-400 animate-pulse',
  restarting: 'bg-blue-500/20 text-blue-300 border-blue-400 animate-pulse',
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400 animate-pulse',
  failed: 'bg-red-500/20 text-red-300 border-red-400',
  undeployed: 'bg-gray-500/20 text-gray-400 border-gray-500',
};


const VpnConfigRow: React.FC<{
  summary: DeviceVpnConfigSummary;
  onDeployClick: () => void;
  onEditClick: (config: VpnConfig) => void;
  onGenerateClick: (config: VpnConfig) => void;
}> = React.memo(({ summary, onDeployClick, onEditClick, onGenerateClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { isUser, isAdmin, isOperator } = useUser();
  const canMutate = isAdmin || isOperator;

  const deleteVpnConfigMutation = useDeleteVpnConfig();
  const restartVpnConfigMutation = useRestartVpnConfig();
  
  const getStatusTooltip = () => {
    if (summary.device.status === 'error') {
      return `Ping failed: High latency (${summary.device.ping_ms}ms).`;
    }
    if (summary.device.status === 'offline') {
      return `Last seen: ${summary.device.last_seen ? formatDistanceToNow(new Date((summary.device.last_seen as any).toDate()), { addSuffix: true }) : 'never'}`;
    }
    return `Device is ${summary.device.status}.`;
  };
  
  const rowAnimation = summary.device.status === 'error' ? shakeAnimation : {};


  return (
    <Fragment>
      <motion.tr
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted hover:bg-[#0A0A0C]/70 cursor-pointer"
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        whileHover={summary.device.status === 'error' ? "x" : ""}
      >
        <TableCell>
          <motion.div className="flex items-center gap-2" animate={rowAnimation}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className="font-medium">{summary.device.name}</span>
          </motion.div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {summary.protocols.map(({ protocol, config }) => {
               const Icon = protocolIcons[protocol];
               return (
                <Badge key={protocol} variant="outline" className={cn(
                  'text-xs',
                  config ? protocolStyles[protocol] : 'bg-gray-700/50 border-gray-600 text-gray-400'
                )}>
                  <Icon className="h-3 w-3 mr-1.5" />
                  {protocol}
                </Badge>
              )
            })}
          </div>
        </TableCell>
        <TableCell className="text-right">
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className={cn(
                    summary.device.status === 'online' ? 'text-green-400 border-green-500/50' : 
                    summary.device.status === 'offline' ? 'text-gray-400 border-gray-500/50' : 
                    'text-red-400 border-red-500/50'
                  )}>
                    {summary.device.status}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getStatusTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </TableCell>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            className="bg-black/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TableCell colSpan={3} className="p-0">
              <div className="p-4">
                 <div className="flex justify-end mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <span tabIndex={0}>
                              <Button size="sm" variant="outline" onClick={onDeployClick} disabled={!canMutate}>
                                  <Rocket className="mr-2 h-4 w-4" />
                                  Deploy New VPN
                              </Button>
                            </span>
                        </TooltipTrigger>
                         {!canMutate && <TooltipContent><p>You do not have permission to deploy.</p></TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Active Peers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.protocols.filter(p => p.config).map(({ protocol, config }) => {
                       const Icon = protocolIcons[protocol];
                      return (
                      <TableRow key={protocol} className="hover:bg-muted/10">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", config ? protocolStyles[protocol] : '')} />
                            {protocol}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('capitalize', statusStyles[config?.status ?? 'undeployed'])}>
                            {config?.status ?? 'undeployed'}
                          </Badge>
                        </TableCell>
                        <TableCell>{config?.listenPort ?? 'N/A'}</TableCell>
                        <TableCell>{config?.activePeers ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                          {config ? (
                            <>
                              {config.protocol === 'WireGuard' && config.status === 'deployed' && (
                                <Tooltip>
                                  <TooltipTrigger asChild><span tabIndex={0}><Button variant="ghost" size="icon" onClick={() => onGenerateClick(config)} className="hover:text-cyan-400" disabled={!canMutate}><QrCode className="h-4 w-4" /></Button></span></TooltipTrigger>
                                  <TooltipContent><p>Generate Client Config</p></TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild><span tabIndex={0}><Button variant="ghost" size="icon" onClick={() => onEditClick(config)} className="hover:text-purple-400" disabled={!isAdmin}><Edit className="h-4 w-4" /></Button></span></TooltipTrigger>
                                {!isAdmin && <TooltipContent><p>Only Admins can edit.</p></TooltipContent>}
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><span tabIndex={0}><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="hover:text-yellow-400" disabled={!canMutate || restartVpnConfigMutation.isPending}><RefreshCcw className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Restart {protocol} on {summary.device.name}?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => restartVpnConfigMutation.mutate(config.id)}>Restart</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></span></TooltipTrigger>
                                {!canMutate && <TooltipContent><p>You do not have permission to restart.</p></TooltipContent>}
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><span tabIndex={0}><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="hover:text-red-500" disabled={!isAdmin}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {protocol} on {summary.device.name}?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteVpnConfigMutation.mutate(config.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></span></TooltipTrigger>
                                {!isAdmin && <TooltipContent><p>Only Admins can delete.</p></TooltipContent>}
                              </Tooltip>
                            </>
                          ) : null}
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    )})}
                    {summary.protocols.filter(p => p.config).length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No VPNs deployed on this device.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TableCell>
          </motion.tr>
        )}
      </AnimatePresence>
    </Fragment>
  );
});
VpnConfigRow.displayName = 'VpnConfigRow';

interface VpnConfigTableProps {
  summaries: DeviceVpnConfigSummary[];
}

export const VpnConfigTable: React.FC<VpnConfigTableProps> = ({ summaries }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<VpnConfig | null>(null);

  const handleDeployClick = (device: Device) => {
    setSelectedDevice(device);
    setSelectedConfig(null);
    setIsFormOpen(true);
  }

  const handleEditClick = (config: VpnConfig) => {
    const device = summaries.find(s => s.device.id === config.deviceId)?.device;
    if (device) {
      setSelectedDevice(device);
      setSelectedConfig(config);
      setIsFormOpen(true);
    }
  }

  const handleGenerateClick = (config: VpnConfig) => {
    const device = summaries.find(s => s.device.id === config.deviceId)?.device;
    if (device) {
      setSelectedDevice(device);
      setSelectedConfig(config);
      setIsGeneratorOpen(true);
    }
  }

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setIsGeneratorOpen(false);
    setSelectedDevice(null);
    setSelectedConfig(null);
  }

  if (summaries.length === 0) {
    return (
        <div className="text-center py-10 glass-card rounded-lg">
            <p className="text-muted-foreground">No devices found.</p>
            <p className="text-sm text-muted-foreground/80 mt-2">Please add a device from the 'Devices' page to get started.</p>
        </div>
    )
  }
  return (
    <>
      <SoftRoundedCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Protocols</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.map((summary) => (
              <VpnConfigRow
                key={summary.device.id}
                summary={summary}
                onDeployClick={() => handleDeployClick(summary.device)}
                onEditClick={handleEditClick}
                onGenerateClick={handleGenerateClick}
              />
            ))}
          </TableBody>
        </Table>
      </SoftRoundedCard>

      {isFormOpen && selectedDevice && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-md h-[60vh]" /></div>}>
          <VpnConfigForm
            isOpen={isFormOpen}
            onClose={handleCloseModal}
            device={selectedDevice}
            config={selectedConfig}
          />
        </Suspense>
      )}

      {isGeneratorOpen && selectedConfig && selectedDevice && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-lg h-[70vh]" /></div>}>
            <VpnClientConfigGenerator
                isOpen={isGeneratorOpen}
                onClose={handleCloseModal}
                serverConfig={selectedConfig}
                device={selectedDevice}
            />
        </Suspense>
      )}
    </>
  );
};