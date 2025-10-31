'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useDevices } from '@/components/devices/use-devices';
import { useUsers } from '@/hooks/use-users';
import { ALL_VPN_PROTOCOLS, VpnProtocolAll } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Download, QrCode } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const generationSchema = z.object({
  userId: z.string().min(1, 'User is required.'),
  serverId: z.string().min(1, 'Server is required.'),
  protocol: z.custom<VpnProtocolAll>(),
  port: z.coerce.number().min(1).max(65535),
});

type GenerationFormData = z.infer<typeof generationSchema>;

export function VpnGenerationForm() {
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: devicesData, isLoading: isLoadingDevices } = useDevices();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema),
    defaultValues: {
      protocol: 'WireGuard',
      port: 51820,
    },
  });

  const onSubmit = (data: GenerationFormData) => {
    console.log('Generating config with:', data);
    // Here we would call the useGenerateConfig mutation
  };

  const isLoading = isLoadingUsers || isLoadingDevices;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Configuration Generator</CardTitle>
          <CardDescription>
            Select a user, server, and protocol to generate a new VPN configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>User</Label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersData?.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>}
              </div>

              <div>
                <Label>Server</Label>
                <Controller
                  name="serverId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a server..." />
                      </SelectTrigger>
                      <SelectContent>
                        {devicesData?.devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({device.ip})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.serverId && <p className="text-red-500 text-xs mt-1">{errors.serverId.message}</p>}
              </div>

              <div>
                <Label>Protocol</Label>
                 <Controller
                  name="protocol"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a protocol..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_VPN_PROTOCOLS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="port">Port</Label>
                <Input id="port" type="number" {...register('port')} />
                 {errors.port && <p className="text-red-500 text-xs mt-1">{errors.port.message}</p>}
              </div>

              <Button type="submit" className="w-full">
                <Sparkles className="mr-2" />
                Generate Config
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      
      <Card className="glass-card sticky top-24">
        <CardHeader>
          <CardTitle>Generated Configuration</CardTitle>
          <CardDescription>
            The generated config will appear here. You can then deploy, download, or scan it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea readOnly className="h-64 font-mono text-xs bg-muted/50" placeholder="[Interface]&#10;PrivateKey = ...&#10;Address = ...&#10;..."/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" disabled><Sparkles className="mr-2"/>Deploy</Button>
                <Button variant="outline" disabled><Download className="mr-2"/>Download</Button>
                <Button variant="outline" disabled><QrCode className="mr-2"/>Show QR</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
