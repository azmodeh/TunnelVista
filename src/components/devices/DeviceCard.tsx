
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Zap, Settings, Server, FileText, Wrench, HeartPulse } from 'lucide-react';
import type { Device, DeviceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCleanupDevice, useDeleteDevice, usePingDevice, useSetupDevice } from './use-devices';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { fadeInUpVariants } from '@/lib/animations';
import { CountryFlag } from '../ui/CountryFlag';
import { useUser } from '@/firebase/auth/use-user';
import { formatDistanceToNow } from 'date-fns';

const statusStyles: Record<DeviceStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
};

const pingStatusStyles: Record<string, string> = {
    good: 'text-green-400',
    slow: 'text-yellow-400',
    down: 'text-red-500'
}

const typeIcon: Record<Device['type'], React.ElementType> = {
    mikrotik: Server,
    linux: Server,
}

export const DeviceCard: React.FC<{ 
    device: Device; 
    onEdit: (d: Device) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
}> = React.memo(({ device, onEdit, isSelected, onSelect }) => {
    const setupDeviceMutation = useSetupDevice();
    const cleanupDeviceMutation = useCleanupDevice();
    const deleteDeviceMutation = useDeleteDevice();
    const pingDeviceMutation = usePingDevice();
    
    const { isAdmin, isOperator } = useUser();
    const canMutate = isAdmin || isOperator;

    const Icon = typeIcon[device.type];
    
    const isSetupComplete = device.tags?.includes('setup-complete');

  return (
    <motion.div
      layout
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
        <Card className={cn("glass-card overflow-hidden transition-all border", isSelected ? 'border-primary' : 'border-white/10')}>
            <div className="p-4 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => onSelect(device.id)}
                            className="h-5 w-5"
                        />
                        <Icon className="h-10 w-10 text-muted-foreground" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">{device.ip}</p>
                        </div>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(device)} disabled={!canMutate}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                             <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span tabIndex={0} className="w-full">
                                    <DropdownMenuItem onClick={() => setupDeviceMutation.mutate(device.id)} onSelect={(e) => e.preventDefault()} className="text-teal-400 focus:text-teal-500" disabled={!isAdmin || isSetupComplete || setupDeviceMutation.isPending}>
                                        <Wrench className="mr-2 h-4 w-4" />
                                        <span>{isSetupComplete ? 'Setup Complete' : (setupDeviceMutation.isPending ? 'Setting up...' : 'Run Setup')}</span>
                                    </DropdownMenuItem>
                                  </span>
                                </TooltipTrigger>
                                {!isAdmin && (
                                  <TooltipContent side="left">
                                    <p>Only Admins can run setup.</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                             <DropdownMenuItem onClick={() => pingDeviceMutation.mutate(device.id)} className="text-blue-400 focus:text-blue-500" disabled={!canMutate}>
                                <HeartPulse className="mr-2 h-4 w-4" />
                                <span>Manual Ping</span>
                            </DropdownMenuItem>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <span tabIndex={0} className="w-full">
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-400 focus:text-orange-500" disabled={!canMutate}>
                                            <Zap className="mr-2 h-4 w-4" />
                                            <span>Cleanup</span>
                                        </DropdownMenuItem>
                                     </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cleanup Device?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will remove unused VPN configs and logs from {device.name}. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => cleanupDeviceMutation.mutate(device.id)}>
                                        Cleanup
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span tabIndex={0} className="w-full">
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-600" disabled={!isAdmin}>
                                              <Trash className="mr-2 h-4 w-4" />
                                              <span>Delete</span>
                                          </DropdownMenuItem>
                                        </span>
                                      </TooltipTrigger>
                                      {!isAdmin && (
                                        <TooltipContent side="left">
                                          <p>Only Admins can delete devices.</p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will permanently delete the device and all associated data. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteDeviceMutation.mutate(device.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex justify-between items-center text-sm">
                     <div className="flex items-center gap-2">
                        {device.country_code && (
                           <CountryFlag code={device.country_code} size="sm" />
                        )}
                        <span className="text-muted-foreground">{device.location}</span>
                    </div>
                     <Badge variant="outline" className="capitalize">{device.type}</Badge>
                     <div className="flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full', statusStyles[device.status])} />
                        <span className="capitalize">{device.status}</span>
                    </div>
                    <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger>
                               <div className={cn('flex items-center gap-1.5', pingStatusStyles[device.ping_status || 'down'])}>
                                    <HeartPulse className="h-4 w-4"/>
                                    <span>{device.ping_ms === null ? 'N/A' : `${device.ping_ms}ms`}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='capitalize'>Ping: {device.ping_status || 'Unknown'}</p>
                                <p>Last ping: {device.last_ping ? formatDistanceToNow(new Date(device.last_ping), { addSuffix: true }) : 'N/A'}</p>
                            </TooltipContent>
                         </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </Card>
    </motion.div>
  );
});

DeviceCard.displayName = 'DeviceCard';
