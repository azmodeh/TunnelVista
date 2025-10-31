'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAddVpnConfig, useUpdateVpnConfig } from './use-vpn-configs';
import type { VpnConfig, VpnProtocol, Device } from '@/lib/types';
import { VPN_PROTOCOLS } from '@/lib/types';
import { X, ShieldCheck, Lock, Router, Waypoints, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { modalContentVariants, modalOverlayVariants } from '@/lib/animations';

const protocolIcons: Record<VpnProtocol, React.ElementType> = {
  WireGuard: Lock,
  OpenVPN: ShieldCheck,
  L2TP: Router,
  IKEv2: ShieldCheck,
  'Trojan (WS/Reality)': Waypoints,
  'VLESS (WS)': Zap,
};

const vpnConfigSchema = z.object({
  deviceId: z.string().min(1, 'Device is required'),
  protocol: z.enum(VPN_PROTOCOLS, {
    required_error: 'Protocol is required.',
  }),
  interfaceName: z.string().min(1, 'Interface name is required').regex(/^[a-z0-9-]+$/, 'Invalid interface name'),
  listenPort: z.coerce.number().min(1024, 'Port must be > 1024').max(65535, 'Port must be < 65535'),
  allowedIPs: z.string().min(1, 'Allowed IPs are required'),
});

type VpnConfigFormData = z.infer<typeof vpnConfigSchema>;

interface VpnConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  config?: VpnConfig | null;
}

const VpnConfigForm: React.FC<VpnConfigFormProps> = ({ isOpen, onClose, device, config }) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<VpnConfigFormData>({
    resolver: zodResolver(vpnConfigSchema),
    defaultValues: {
      deviceId: device.id,
      protocol: 'WireGuard',
      interfaceName: 'wg-vpn',
      listenPort: 51820,
      allowedIPs: '10.0.0.0/24',
    },
  });
  
  const selectedProtocol = watch('protocol');

  const addVpnConfigMutation = useAddVpnConfig();
  const updateVpnConfigMutation = useUpdateVpnConfig();

  useEffect(() => {
    if (isOpen) {
      if (config) {
        reset({
          deviceId: config.deviceId,
          protocol: config.protocol,
          interfaceName: config.interfaceName,
          listenPort: config.listenPort,
          allowedIPs: config.allowedIPs,
        });
      } else {
         reset({
          deviceId: device.id,
          protocol: 'WireGuard',
          interfaceName: `wireguard-vpn`,
          listenPort: 51820,
          allowedIPs: '10.0.0.0/24',
        });
      }
    }
  }, [config, isOpen, reset, device]);
  
  useEffect(() => {
    if(!config) { // only on create
        const interfaceName = `${selectedProtocol.toLowerCase().replace(/[^a-z0-9]/g, '')}-vpn`;
        reset({ ...watch(), interfaceName });
    }
  }, [selectedProtocol, reset, config, watch]);

  const onSubmit = (data: VpnConfigFormData) => {
    if (config) {
      updateVpnConfigMutation.mutate({ ...data, id: config.id });
    } else {
      addVpnConfigMutation.mutate(data);
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
            className="bg-[#0A0A0C]/90 p-8 rounded-xl border border-purple-teal-gradient relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X />
            </button>
            <h2 className="text-2xl font-headline text-white mb-6">
              {config ? `Edit ${config.protocol} on ${device.name}` : `Deploy VPN on ${device.name}`}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div>
                <Label className="text-gray-300">Protocol</Label>
                <Controller
                  name="protocol"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!config}>
                      <SelectTrigger className="text-white">
                        <SelectValue placeholder="Select a protocol..." />
                      </SelectTrigger>
                      <SelectContent>
                        {VPN_PROTOCOLS.map((proto) => {
                          const Icon = protocolIcons[proto];
                          return (
                            <SelectItem key={proto} value={proto}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {proto}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.protocol && <p className="text-red-500 text-xs mt-1">{errors.protocol.message}</p>}
              </div>

               <div>
                <Label htmlFor="interfaceName" className="text-gray-300">Interface Name</Label>
                <Input id="interfaceName" {...register('interfaceName')} className="bg-transparent text-white" />
                {errors.interfaceName && <p className="text-red-500 text-xs mt-1">{errors.interfaceName.message}</p>}
              </div>

               <div>
                <Label htmlFor="listenPort" className="text-gray-300">Listen Port</Label>
                <Input id="listenPort" type="number" {...register('listenPort')} className="bg-transparent text-white" />
                {errors.listenPort && <p className="text-red-500 text-xs mt-1">{errors.listenPort.message}</p>}
              </div>

               <div>
                <Label htmlFor="allowedIPs" className="text-gray-300">Allowed IPs</Label>
                <Input id="allowedIPs" {...register('allowedIPs')} className="bg-transparent text-white" />
                {errors.allowedIPs && <p className="text-red-500 text-xs mt-1">{errors.allowedIPs.message}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg">
                  {config ? 'Save Changes' : 'Deploy VPN Server'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VpnConfigForm;
