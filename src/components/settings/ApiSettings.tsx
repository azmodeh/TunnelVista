'use client';

import React, { useState, memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Copy, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useUsers } from '@/hooks/use-users';
import { useGenerateApiKey, useApiKeys, useRevokeApiKey } from '@/hooks/use-api-keys';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { containerVariants, fadeInUpVariants } from '@/lib/animations';
import { useUser } from '@/firebase/auth/use-user';

export const ApiSettings = memo(() => {
    const { isAdmin } = useUser();
    const { data: apiKeys, isLoading: isLoadingApiKeys } = useApiKeys();
    // We get all users to populate the dropdown. In a larger app, this might be a searchable select.
    const { data: usersData, isLoading: isLoadingUsers } = useUsers(); 
    const generateApiKeyMutation = useGenerateApiKey();
    const revokeApiKeyMutation = useRevokeApiKey();
    const { toast } = useToast();

    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    const [selectedScope, setSelectedScope] = useState('user:read');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const handleGenerateKey = () => {
        if (!selectedUserId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a user.' });
            return;
        }
        generateApiKeyMutation.mutate(
            { userId: selectedUserId, scope: selectedScope },
            {
                onSuccess: (data) => {
                    setGeneratedKey(data);
                }
            }
        );
    };

    const handleCopyKey = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            toast({ title: 'Copied!', description: 'API Key has been copied to your clipboard.' });
            setGeneratedKey(null); // Clear the key after copying for security
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Generate and manage API keys for system access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <motion.div 
                  className="p-4 border rounded-lg space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <motion.h3 variants={fadeInUpVariants} className="font-semibold text-lg">API Key Generator</motion.h3>
                    <motion.div variants={fadeInUpVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>User</Label>
                            <Select onValueChange={setSelectedUserId} value={selectedUserId} disabled={!isAdmin || isLoadingUsers}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {usersData?.users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.username} ({user.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Scope</Label>
                            <Select onValueChange={setSelectedScope} defaultValue={selectedScope} disabled={!isAdmin}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user:read">Read Access</SelectItem>
                                    <SelectItem value="user:write">Write Access</SelectItem>
                                    <SelectItem value="*">Full Access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0} className="w-full">
                                        <Button onClick={handleGenerateKey} disabled={!isAdmin || !selectedUserId || generateApiKeyMutation.isPending} className="w-full">
                                            {generateApiKeyMutation.isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
                                            Generate Key
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {!isAdmin && <TooltipContent><p>Only Admins can generate API keys.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                    </motion.div>
                     <AnimatePresence>
                    {generatedKey && (
                        <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}} className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-primary">New API Key Generated</p>
                                <p className="font-mono text-xs text-muted-foreground mt-1 break-all">{generatedKey}</p>
                                <p className="text-xs text-yellow-500 mt-2">Make sure to copy this key now. You won’t be able to see it again.</p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={handleCopyKey}><Copy className="h-5 w-5" /></Button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Generated Keys</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingApiKeys || isLoadingUsers ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Loading keys...</TableCell></TableRow>
                            ) : (apiKeys || []).map(key => {
                                const user = usersData?.users.find(u => u.id === key.userId);
                                return (
                                <TableRow key={key.id}>
                                    <TableCell className="font-mono text-xs">{key.keyId}</TableCell>
                                    <TableCell>{user?.username ?? key.userId}</TableCell>
                                    <TableCell><Badge variant="outline">{key.scope}</Badge></TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(key.expires), { addSuffix: true })}</TableCell>
                                    <TableCell className="text-right">
                                         <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span tabIndex={0}>
                                                        <Button variant="ghost" size="icon" onClick={() => revokeApiKeyMutation.mutate(key.id)} disabled={!isAdmin}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </span>
                                                </TooltipTrigger>
                                                {!isAdmin && <TooltipContent><p>Only Admins can revoke keys.</p></TooltipContent>}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
});
ApiSettings.displayName = 'ApiSettings';

    