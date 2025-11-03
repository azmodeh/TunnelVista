'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings, type AppSettings } from '@/hooks/use-settings';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, fadeInUpVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';


const notificationEvents = [
    { id: 'device-offline', label: 'Device goes offline' },
    { id: 'device-online', label: 'Device comes back online' },
    { id: 'vpn-disconnect', label: 'VPN tunnel disconnects' },
    { id: 'user-quota-exceeded', label: 'User quota exceeds 80%' },
    { id: 'new-device-detected', label: 'New unknown device detected' },
    { id: 'login-from-new-ip', label: 'Admin login from new IP address' },
];

export function NotificationsSettings() {
  const { data: settingsData } = useAppSettings();
  const updateSettingsMutation = useUpdateAppSettings();
  
  const { isUser } = useUser();
  const isReadOnly = isUser;
  
  const [formState, setFormState] = useState<Partial<AppSettings>>({});

  useEffect(() => {
    if (settingsData) {
      setFormState(settingsData);
    }
  }, [settingsData]);

  const handleInputChange = (key: string, value: any) => {
    setFormState(prevState => ({ ...prevState, [key]: value }));
  };

  const handleSaveChanges = () => {
    updateSettingsMutation.mutate(formState);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive alerts for important events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
          <motion.div 
            className="space-y-4 p-4 border rounded-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
              <motion.h3 variants={fadeInUpVariants} className="font-semibold">Channels</motion.h3>
              <motion.div variants={fadeInUpVariants} className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                      <Switch id='email-enabled' checked={formState.emailEnabled ?? false} onCheckedChange={value => handleInputChange('emailEnabled', value)} disabled={isReadOnly}/>
                      <Label htmlFor='email-enabled'>Email Notifications</Label>
                  </div>
                  <AnimatePresence>
                  {formState.emailEnabled && (
                      <motion.div 
                        initial={{opacity: 0, height: 0}} 
                        animate={{opacity: 1, height: 'auto'}} 
                        exit={{opacity: 0, height: 0}}
                        className='pl-8 overflow-hidden'
                      >
                          <Label htmlFor='email-address'>Recipient Email</Label>
                          <Input id='email-address' placeholder='admin@example.com' value={formState.emailAddress || ''} onChange={e => handleInputChange('emailAddress', e.target.value)} disabled={isReadOnly}/>
                      </motion.div>
                  )}
                  </AnimatePresence>
              </motion.div>
               <motion.div variants={fadeInUpVariants} className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                      <Switch id='webhook-enabled' checked={formState.webhookEnabled ?? false} onCheckedChange={value => handleInputChange('webhookEnabled', value)} disabled={isReadOnly}/>
                      <Label htmlFor='webhook-enabled'>Webhook Notifications</Label>
                  </div>
                  <AnimatePresence>
                  {formState.webhookEnabled && (
                      <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className='pl-8 overflow-hidden'>
                          <Label htmlFor='webhook-url'>Webhook URL</Label>
                          <Input id='webhook-url' placeholder='https://hooks.slack.com/services/...' value={formState.webhookUrl || ''} onChange={e => handleInputChange('webhookUrl', e.target.value)} disabled={isReadOnly}/>
                      </motion.div>
                  )}
                  </AnimatePresence>
              </motion.div>
          </motion.div>

          <motion.div 
            className="space-y-4 p-4 border rounded-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
              <motion.h3 variants={fadeInUpVariants} className="font-semibold">Event Triggers</motion.h3>
              <motion.p variants={fadeInUpVariants} className="text-sm text-muted-foreground">Select which events should trigger a notification.</motion.p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notificationEvents.map(event => (
                      <motion.div variants={fadeInUpVariants} key={event.id} className="flex items-center space-x-2">
                          <Checkbox 
                              id={event.id} 
                              checked={(formState.enabledEvents || []).includes(event.id)}
                              onCheckedChange={(checked) => {
                                  if (isReadOnly) return;
                                  const currentEvents = formState.enabledEvents || [];
                                  const newEvents = checked
                                      ? [...currentEvents, event.id]
                                      : currentEvents.filter(id => id !== event.id);
                                  handleInputChange('enabledEvents', newEvents);
                              }}
                              disabled={isReadOnly}
                          />
                          <Label htmlFor={event.id} className="font-normal">{event.label}</Label>
                      </motion.div>
                  ))}
              </div>
          </motion.div>
           <Button onClick={handleSaveChanges} disabled={isReadOnly || updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Notification Settings
           </Button>
      </CardContent>
    </Card>
  );
}