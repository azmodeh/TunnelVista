'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAddTunnel, useUpdateTunnel } from './use-tunnels';
import type { VpnTunnel, VpnTunnelProtocol, Device } from '@/lib/types';
import { X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { modalContentVariants, modalOverlayVariants } from '@/lib/animations';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { VPN_TUNNEL_PROTOCOLS } from '@/lib/types';


const tunnelSchema = z.object({
  sourceDeviceId: z.string().min(1, "Source device is required."),
  destinationDeviceId: z.string().min(1, "Destination device is required."),
  protocol: z.custom<VpnTunnelProtocol>(),
  autoOptimize: z.boolean().default(false),
}).refine(data => data.sourceDeviceId !== data.destinationDeviceId, {
    message: "Source and Destination cannot be the same.",
    path: ["destinationDeviceId"],
});

type TunnelFormData = z.infer<typeof tunnelSchema>;

interface TunnelDeployFormProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  tunnel?: VpnTunnel | null;
}

const TunnelDeployForm: React.FC<TunnelDeployFormProps> = ({ isOpen, onClose, devices, tunnel }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TunnelFormData>({
    resolver: zodResolver(tunnelSchema),
    defaultValues: {
      sourceDeviceId: '',
      destinationDeviceId: '',
      protocol: 'WireGuard',
      autoOptimize: false,
    },
  });

  const addTunnelMutation = useAddTunnel();
  const updateTunnelMutation = useUpdateTunnel();
  
  const isSubmitting = addTunnelMutation.isPending || updateTunnelMutation.isPending;

  useEffect(() => {
    if (isOpen) {
        reset({
          sourceDeviceId: tunnel?.sourceDeviceId || '',
          destinationDeviceId: tunnel?.destinationDeviceId || '',
          protocol: tunnel?.protocol || 'WireGuard',
          autoOptimize: tunnel?.autoOptimized || false,
        });
    }
  }, [tunnel, isOpen, reset]);

  const onSubmit = (data: TunnelFormData) => {
    if (tunnel) {
      updateTunnelMutation.mutate({ id: tunnel.id, ...data });
    } else {
      addTunnelMutation.mutate(data as Omit<VpnTunnel, 'id' | 'status'>);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            className="bg-[#0A0A0C]/90 p-8 rounded-xl border border-purple-teal-gradient relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X />
            </button>
            <h2 className="text-2xl font-headline text-white mb-2">
              {tunnel ? 'Edit Tunnel' : 'Add New Tunnel'}
            </h2>
             <p className="text-muted-foreground mb-6">Create a new connection between two devices.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Device</Label>
                  <Controller
                    name="sourceDeviceId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!tunnel}>
                        <SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger>
                        <SelectContent>
                          {devices.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sourceDeviceId && <p className="text-red-500 text-xs mt-1">{errors.sourceDeviceId.message}</p>}
                </div>
                <div>
                  <Label>Destination Device</Label>
                  <Controller
                    name="destinationDeviceId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!tunnel}>
                        <SelectTrigger><SelectValue placeholder="Select destination..." /></SelectTrigger>
                        <SelectContent>
                           {devices.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                   {errors.destinationDeviceId && <p className="text-red-500 text-xs mt-1">{errors.destinationDeviceId.message}</p>}
                </div>
              </div>
              
              <div>
                  <Label>Protocol</Label>
                  <Controller
                    name="protocol"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select protocol..." /></SelectTrigger>
                        <SelectContent>
                          {VPN_TUNNEL_PROTOCOLS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.protocol && <p className="text-red-500 text-xs mt-1">{errors.protocol.message}</p>}
              </div>


               <div className="flex items-center space-x-2 pt-2">
                    <Controller
                        name="autoOptimize"
                        control={control}
                        render={({ field }) => (
                            <Checkbox 
                                id="auto-optimize"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="auto-optimize" className="flex items-center gap-2 text-gray-300">
                      Auto-Optimize Protocol (AI ✨)
                    </Label>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : (tunnel ? 'Save Changes' : 'Create Tunnel')}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TunnelDeployForm;