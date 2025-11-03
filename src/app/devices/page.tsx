'use client';

import { DeviceCard } from '@/components/devices/DeviceCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Trash, Zap, HeartPulse } from 'lucide-react';
import { useState, Suspense } from 'react';
import type { Device } from '@/lib/types';
import { useDevices, useBulkActionDevices } from '@/components/devices/use-devices';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';
import { bulkActionsVariants, containerVariants } from '@/lib/animations';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/firebase/auth/use-user';


const queryClient = new QueryClient();

const DeviceForm = dynamic(() => import('@/components/devices/DeviceForm'), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><Skeleton className="w-full max-w-lg h-[90vh]" /></div>,
  ssr: false
});


function DevicesPageContent() {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const { data, isLoading, isError } = useDevices();
  const bulkActionMutation = useBulkActionDevices();
  const tanstackQueryClient = useTanstackQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const { isAdmin, isOperator } = useUser();
  const canMutate = isAdmin || isOperator;

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsFormOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingDevice(null);
  };

  const handleSelect = (id: string) => {
    setSelectedDevices(prev => 
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  }

  const handleBulkAction = (action: 'cleanup' | 'delete' | 'health-check') => {
    bulkActionMutation.mutate({ deviceIds: selectedDevices, action });
    setSelectedDevices([]);
  };
  
  const handleRefresh = () => {
    tanstackQueryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const filteredDevices = data?.devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (device.location && device.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleAll = () => {
    if (filteredDevices) {
      if (selectedDevices.length === filteredDevices.length) {
        setSelectedDevices([]);
      } else {
        setSelectedDevices(filteredDevices.map(d => d.id) || []);
      }
    }
  }

  const isAllSelected = filteredDevices ? selectedDevices.length === filteredDevices.length && filteredDevices.length > 0 : false;
  const isIndeterminate = selectedDevices.length > 0 && filteredDevices ? selectedDevices.length < filteredDevices.length : false;


  return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-headline font-bold">Devices</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Input 
              placeholder="Search by name, IP, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto"
            />
            <AnimatePresence>
              {selectedDevices.length > 0 && (
                <motion.div
                  variants={bulkActionsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex items-center gap-2"
                >
                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" onClick={() => handleBulkAction('health-check')} disabled={!canMutate}>
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Health Check ({selectedDevices.length})
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300" disabled={!canMutate}>
                        <Zap className="mr-2 h-4 w-4" />
                        Cleanup ({selectedDevices.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will run cleanup scripts on {selectedDevices.length} selected devices, removing unused configs and logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkAction('cleanup')}>
                          Run Cleanup
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <Button variant="destructive" disabled={!isAdmin}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete ({selectedDevices.length})
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!isAdmin && (
                            <TooltipContent>
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
                          This action cannot be undone. This will permanently delete {selectedDevices.length} devices and all their data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkAction('delete')} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              )}
            </AnimatePresence>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                      <Button 
                        className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg"
                        onClick={() => setIsFormOpen(true)}
                        disabled={!canMutate}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Device
                      </Button>
                  </span>
                </TooltipTrigger>
                {!canMutate && (
                  <TooltipContent>
                    <p>You do not have permission to add devices.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        )}
        {isError && (
          <div className="text-red-500 p-4 rounded-md bg-red-900/20 border border-red-500/50">
            Failed to load devices. Please try again later.
          </div>
        )}
        {filteredDevices && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox 
                  id="selectAll"
                  checked={isAllSelected}
                  onCheckedChange={toggleAll}
                  data-state={isIndeterminate ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked')}
                  className="h-5 w-5"
              />
              <label htmlFor="selectAll" className="text-sm font-medium">Select All</label>
            </div>
            <motion.div 
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredDevices.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onEdit={handleEdit}
                    isSelected={selectedDevices.includes(device.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
        {isFormOpen && (
          <DeviceForm 
              isOpen={isFormOpen}
              onClose={handleCloseModal}
              device={editingDevice}
          />
        )}
      </div>
  )
}

export default function DevicesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DevicesPageContent />
    </QueryClientProvider>
  )
}