'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAddDevice, useUpdateDevice } from './use-devices';
import type { Device } from '@/lib/types';
import { X, Eye, EyeOff } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { modalContentVariants, modalOverlayVariants } from '@/lib/animations';

const deviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ip: z.string().ip('Invalid IP address'),
  type: z.enum(['mikrotik', 'linux']),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  ssh_key: z.string().optional(),
  api_key: z.string().optional(),
  tags: z.string().optional(),
  cloudflare_subdomain: z.string().optional(),
  local_ips: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface DeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  device?: Device | null;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ isOpen, onClose, device }) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      ip: '',
      type: 'mikrotik',
      username: 'admin',
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showApiKey, setShowApiKey] = React.useState(false);

  const addDeviceMutation = useAddDevice();
  const updateDeviceMutation = useUpdateDevice();

  useEffect(() => {
    if (isOpen) {
      if (device) {
        reset({
          name: device.name,
          ip: device.ip,
          type: device.type,
          username: device.username,
          password: device.password,
          ssh_key: device.ssh_key,
          api_key: device.api_key,
          tags: device.tags?.join(', '),
          cloudflare_subdomain: device.cloudflare_subdomain,
          local_ips: device.local_ips?.join(', '),
        });
      } else {
        reset({
          name: '',
          ip: '',
          type: 'mikrotik',
          username: 'admin',
          password: '',
          ssh_key: '',
          api_key: '',
          tags: '',
          cloudflare_subdomain: '',
          local_ips: '',
        });
      }
    }
  }, [device, isOpen, reset]);

  const onSubmit = (data: DeviceFormData) => {
    const submissionData = {
      ...data,
      tags: data.tags?.split(',').map(t => t.trim()).filter(Boolean),
      local_ips: data.local_ips?.split(',').map(t => t.trim()).filter(Boolean),
    }

    if (device) {
      updateDeviceMutation.mutate({ id: device.id, ...submissionData });
    } else {
      addDeviceMutation.mutate(submissionData as any);
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
            className="bg-[#0A0A0C]/90 p-8 rounded-xl border border-purple-teal-gradient relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X />
            </button>
            <h2 className="text-2xl font-headline text-white mb-6">
              {device ? 'Edit Device' : 'Add New Device'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <Input id="name" {...register('name')} className="bg-transparent text-white" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mikrotik">MikroTik</SelectItem>
                          <SelectItem value="linux">Linux</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ip" className="text-gray-300">Public IP Address</Label>
                <Input id="ip" {...register('ip')} className="bg-transparent text-white" />
                {errors.ip && <p className="text-red-500 text-xs mt-1">{errors.ip.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input id="username" {...register('username')} className="bg-transparent text-white" />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>
                <div className="relative">
                  <Label htmlFor="password">Password (Optional)</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="ssh_key">SSH Key (Optional)</Label>
                <Textarea id="ssh_key" {...register('ssh_key')} className="bg-transparent font-mono text-xs" rows={3}/>
                {errors.ssh_key && <p className="text-red-400 text-xs mt-1">{errors.ssh_key.message}</p>}
              </div>
              
              <div className="relative">
                <Label htmlFor="api_key">API Key (e.g. Cloudflare) (Optional)</Label>
                <Input id="api_key" type={showApiKey ? 'text' : 'password'} {...register('api_key')} className="bg-transparent"/>
                 <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-9 text-gray-400"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                {errors.api_key && <p className="text-red-400 text-xs mt-1">{errors.api_key.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" {...register('tags')} className="bg-transparent" placeholder="iran, router, primary"/>
                </div>
                 <div>
                  <Label htmlFor="cloudflare_subdomain">Cloudflare Subdomain</Label>
                  <Input id="cloudflare_subdomain" {...register('cloudflare_subdomain')} className="bg-transparent" placeholder="router1.tunnelvista.com"/>
                   {errors.cloudflare_subdomain && <p className="text-red-400 text-xs mt-1">{errors.cloudflare_subdomain.message}</p>}
                </div>
              </div>

               <div>
                <Label htmlFor="local_ips">Local IPs (comma-separated CIDR)</Label>
                <Input id="local_ips" {...register('local_ips')} className="bg-transparent" placeholder="192.168.1.0/24, 10.0.0.0/8"/>
              </div>


              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-purple-600/50 border border-purple-400 hover:bg-purple-600/80 text-white rounded-lg">
                  {device ? 'Save Changes' : 'Add Device'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeviceForm;