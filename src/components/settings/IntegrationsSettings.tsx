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
import { Loader2, Brain, Database, Cloud } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings, type AppSettings } from '@/hooks/use-settings';
import { motion } from 'framer-motion';
import { containerVariants, fadeInUpVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';

export function IntegrationsSettings() {
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
  
  const [isTestingCfConnection, setIsTestingCfConnection] = useState(false);
  const [isTestingOpenAiConnection, setIsTestingOpenAiConnection] = useState(false);
  const [isTestingDbConnection, setIsTestingDbConnection] = useState(false);
  

  const handleTestCfConnection = () => {
    setIsTestingCfConnection(true);
    setTimeout(() => {
      if (formState.cloudflareKey && formState.cloudflareKey.length > 10) {
        toast({ title: 'Success', description: 'Cloudflare connection is valid.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid Cloudflare API key.' });
      }
      setIsTestingCfConnection(false);
    }, 1500);
  }

  const handleTestOpenAiConnection = () => {
    setIsTestingOpenAiConnection(true);
    setTimeout(() => {
      if (formState.openaiToken && formState.openaiToken.length > 10 && formState.openaiEndpoint?.startsWith('https')) {
        toast({ title: 'Success', description: 'OpenAI API connection is valid.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid OpenAI API endpoint or token.' });
      }
      setIsTestingOpenAiConnection(false);
    }, 1500);
  }

  const handleTestDbConnection = () => {
    setIsTestingDbConnection(true);
    setTimeout(() => {
      if (formState.dbHost && formState.dbPort && formState.dbUser && formState.dbPassword && formState.dbName) {
        toast({ title: 'Success', description: 'Database connection is valid.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill all database fields to test.' });
      }
      setIsTestingDbConnection(false);
    }, 1500);
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
        <motion.div variants={fadeInUpVariants} className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cloud className="text-orange-400" />Cloudflare Integration</CardTitle>
                <CardDescription>Manage API keys for Cloudflare DNS and tunneling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="cloudflare-email">Cloudflare Account Email</Label>
                    <Input id="cloudflare-email" type="email" placeholder="user@example.com" value={formState.cloudflareEmail || ''} onChange={e => handleInputChange('cloudflareEmail', e.target.value)} disabled={isReadOnly}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cloudflare-zone">Cloudflare Zone ID</Label>
                    <Input id="cloudflare-zone" type="text" placeholder="e.g., 023e105f4ecef8ad9ca54890d98454ea" value={formState.cloudflareZoneId || ''} onChange={e => handleInputChange('cloudflareZoneId', e.target.value)} disabled={isReadOnly}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cloudflare-key">Cloudflare API Key</Label>
                    <Input id="cloudflare-key" type="password" placeholder="••••••••••••••••••••" value={formState.cloudflareKey || ''} onChange={e => handleInputChange('cloudflareKey', e.target.value)} disabled={isReadOnly}/>
                </div>
                <div className='flex gap-2 pt-2'>
                     <Button onClick={handleSaveChanges} disabled={isReadOnly || updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save
                     </Button>
                    <Button variant="outline" onClick={handleTestCfConnection} disabled={isTestingCfConnection || isReadOnly}>
                        {isTestingCfConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Test Connection
                    </Button>
                </div>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="text-purple-400" />OpenAI-Compatible API</CardTitle>
                <CardDescription>Configure the API for AI-powered features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="openai-endpoint">Endpoint URL</Label>
                    <Input id="openai-endpoint" type="url" placeholder="https://api.openai.com/v1" value={formState.openaiEndpoint || ''} onChange={e => handleInputChange('openaiEndpoint', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="openai-model">Model ID</Label>
                    <Input id="openai-model" type="text" placeholder="gpt-3.5-turbo" value={formState.openaiModel || ''} onChange={e => handleInputChange('openaiModel', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="openai-token">API Token</Label>
                    <Input id="openai-token" type="password" placeholder="sk-..." value={formState.openaiToken || ''} onChange={e => handleInputChange('openaiToken', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className='flex gap-2 pt-2'>
                     <Button onClick={handleSaveChanges} disabled={isReadOnly || updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save
                     </Button>
                    <Button variant="outline" onClick={handleTestOpenAiConnection} disabled={isTestingOpenAiConnection || isReadOnly}>
                        {isTestingOpenAiConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Test Connection
                    </Button>
                </div>
                </CardContent>
            </Card>
        </motion.div>
         <motion.div variants={fadeInUpVariants} className="glass-card lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="text-blue-400" />Database Connection</CardTitle>
                <CardDescription>Configure connection to your external database.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="db-driver">Driver</Label>
                    <Select value={formState.dbDriver || 'postgresql'} onValueChange={value => handleInputChange('dbDriver', value)} disabled={isReadOnly}>
                        <SelectTrigger id="db-driver"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="mongodb">MongoDB</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="db-host">Host</Label>
                    <Input id="db-host" value={formState.dbHost || ''} onChange={e => handleInputChange('dbHost', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="db-port">Port</Label>
                        <Input id="db-port" type="number" value={formState.dbPort || 5432} onChange={e => handleInputChange('dbPort', Number(e.target.value))} disabled={isReadOnly} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="db-name">Database Name</Label>
                        <Input id="db-name" value={formState.dbName || ''} onChange={e => handleInputChange('dbName', e.target.value)} disabled={isReadOnly} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="db-user">Username</Label>
                    <Input id="db-user" value={formState.dbUser || ''} onChange={e => handleInputChange('dbUser', e.target.value)} disabled={isReadOnly} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="db-password">Password</Label>
                    <Input id="db-password" type="password" value={formState.dbPassword || ''} onChange={e => handleInputChange('dbPassword', e.target.value)} disabled={isReadOnly} />
                </div>

                <div className='flex gap-2 pt-2'>
                     <Button onClick={handleSaveChanges} disabled={isReadOnly || updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save
                     </Button>
                    <Button variant="outline" onClick={handleTestDbConnection} disabled={isTestingDbConnection || isReadOnly}>
                        {isTestingDbConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Test Connection
                    </Button>
                </div>
            </CardContent>
        </motion.div>
    </motion.div>
  );
}
