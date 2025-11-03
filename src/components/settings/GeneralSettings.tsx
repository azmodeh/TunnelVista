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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings, type AppSettings } from '@/hooks/use-settings';
import { motion } from 'framer-motion';
import { containerVariants, fadeInUpVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';

export function GeneralSettings() {
  const { data: settingsData } = useAppSettings();
  const updateSettingsMutation = useUpdateAppSettings();
  const { toast } = useToast();
  
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
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage your application's general configuration.
        </CardDescription>
      </CardHeader>
      <motion.div 
        className="space-y-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="domain">App Domain</Label>
            <Input id="domain" value={formState.appDomain || ''} onChange={e => handleInputChange('appDomain', e.target.value)} disabled={isReadOnly}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={formState.theme || 'dark'} onValueChange={value => handleInputChange('theme', value)} disabled={isReadOnly}>
              <SelectTrigger id="theme"><SelectValue placeholder="Select theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="log-retention">Log Retention (Days)</Label>
            <Input id="log-retention" type="number" value={formState.logRetention || 30} onChange={e => handleInputChange('logRetention', Number(e.target.value))} disabled={isReadOnly}/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="polling-interval">Agent Polling Interval (Seconds)</Label>
            <Input id="polling-interval" type="number" value={formState.pollingInterval || 60} onChange={e => handleInputChange('pollingInterval', Number(e.target.value))} disabled={isReadOnly}/>
          </div>
        </motion.div>
        <motion.div variants={fadeInUpVariants}>
          <Button onClick={handleSaveChanges} disabled={isReadOnly || updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </Card>
  );
}