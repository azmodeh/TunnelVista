'use client';

import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { performIpCheck, IpCheckResult } from '@/ai/flows/ip-check-flow';
import { containerVariants } from '@/lib/animations';
import { Badge } from '../ui/badge';
import AnimatedFlag from '../ui/AnimatedFlag';
import { Skeleton } from '../ui/skeleton';

const statusStyles: Record<string, string> = {
    resolved: 'bg-green-500/20 text-green-300 border-green-400/50',
    failed: 'bg-red-500/20 text-red-300 border-red-400/50',
    open: 'bg-green-500/20 text-green-300 border-green-400/50',
    closed: 'bg-red-500/20 text-red-300 border-red-400/50',
    low: 'bg-green-500/20 text-green-300 border-green-400/50',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    high: 'bg-red-500/20 text-red-300 border-red-400/50',
    unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};


export function NetworkChecks() {
    const { toast } = useToast();
    const [ip, setIp] = useState('8.8.8.8');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<IpCheckResult | null>(null);

    const handleCheck = async (checkType: 'info' | 'dns' | 'tcp' | 'ping') => {
        setLoading(true);
        setResults(null);
        try {
            const res = await performIpCheck({ ip: ip, checkType });
            setResults(prev => ({...(prev || {}), ...res }));
            toast({ title: `Check Complete`, description: `Ran checks for ${res.ip || ip}` });
        } catch (e) {
            const error = e as Error;
            toast({ variant: 'destructive', title: 'Check Failed', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="glass-card">
            <CardHeader>
              <CardTitle>Network Checks</CardTitle>
              <CardDescription>Use the check-host.net API to run diagnostics on any IP or host.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <motion.div 
                  className="p-4 border rounded-lg space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <div className="space-y-2">
                        <Label htmlFor="ip-check">IP or Hostname</Label>
                        <Input id="ip-check" value={ip} onChange={e => setIp(e.target.value)} disabled={loading} />
                    </div>
                    <Button onClick={() => handleCheck('info')} disabled={loading || !ip} className="w-full">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Globe className="mr-2" />}
                        Run All Checks
                    </Button>
                </motion.div>
                
                <AnimatePresence>
                {(loading || results) && (
                    <motion.div 
                        className="p-4 border rounded-lg space-y-4"
                        initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                     >
                        <h3 className="font-semibold text-lg">{loading ? `Running checks for ${ip}...` : `Results for ${results?.ip}`}</h3>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {results?.country_code && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Location</Label>
                                        <div className="flex items-center gap-2">
                                            <AnimatedFlag code={results.country_code} />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{results.country}</span>
                                                <span className="text-xs text-muted-foreground">{results.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {results?.dns_status && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">DNS Status</Label>
                                        <div><Badge className={statusStyles[results.dns_status]}>{results.dns_status}</Badge></div>
                                    </div>
                                )}
                                {results?.tcp_status && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">TCP (443)</Label>
                                        <div><Badge className={statusStyles[results.tcp_status]}>{results.tcp_status}</Badge></div>
                                    </div>
                                )}
                                {results?.ping_status && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Ping</Label>
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusStyles[results.ping_status]}>{results.ping_status}</Badge>
                                            {results.latency_ms !== undefined && <span className="text-sm text-muted-foreground">{results.latency_ms}ms</span>}
                                        </div>
                                    </div>
                                )}
                                {results?.asn && (
                                    <div className="space-y-1 col-span-full">
                                        <Label className="text-muted-foreground">ASN (Whois-like Info)</Label>
                                        <p className="text-sm font-mono bg-muted/50 p-2 rounded-md">{results.asn}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}