'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Globe, Server, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ipCheckFlow } from '@/ai/flows/ip-check-flow';
import { Badge } from '@/components/ui/badge';
import { AnimatedFlag } from '../ui/AnimatedFlag';
import { Skeleton } from '../ui/skeleton';

type CheckResult = {
  dns: any;
  tcp: any;
  ping: any;
  geo: any;
};

const NetworkChecks = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!ipAddress) {
      toast({
        title: 'Error',
        description: 'Please enter an IP address.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const response = await ipCheckFlow(ipAddress);
      setResults(response);
    } catch (error) {
      console.error('Network check failed:', error);
      toast({
        title: 'Check Failed',
        description: 'Could not retrieve network details for the IP address.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (label: string, value: any, status?: boolean) => {
    let statusIcon;
    if (status === true) {
      statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === false) {
      statusIcon = <XCircle className="h-4 w-4 text-red-500" />;
    }

    return (
      <div className="flex items-center justify-between text-sm py-2 border-b border-gray-700">
        <span className="text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-white">{value}</span>
          {statusIcon}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <span>Network & IP Diagnostics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="w-full">
              <Label htmlFor="ip-address">IP Address or Hostname</Label>
              <Input
                id="ip-address"
                placeholder="e.g., 8.8.8.8 or example.com"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleCheck} disabled={loading}>
              {loading ? 'Checking...' : 'Check'}
            </Button>
          </div>
          {loading && (
            <div className="space-y-4 pt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 space-y-4"
            >
              {results.geo && (
                 <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                   <AnimatedFlag countryCode={results.geo.country_code} />
                   <div>
                     <p className="font-bold text-lg">
                       {results.geo.city}, {results.geo.country_name}
                     </p>
                     <p className="text-sm text-gray-400 font-mono">
                       {results.geo.isp}
                     </p>
                   </div>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-base">DNS</CardTitle></CardHeader>
                  <CardContent>
                    {results.dns ? Object.entries(results.dns).map(([key, value]: [any, any]) => (
                      renderResult(value.type, value.ip, true)
                    )) : renderResult('No records', 'N/A', false)}
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">TCP Port</CardTitle></CardHeader>
                    <CardContent>
                        {results.tcp ? Object.entries(results.tcp).map(([key, value]: [any, any]) => (
                            renderResult(key, value.status, value.status === 'open')
                        )) : renderResult('No data', 'N/A', false)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Ping</CardTitle></CardHeader>
                    <CardContent>
                        {results.ping ? Object.entries(results.ping).map(([key, value]: [any, any]) => (
                            renderResult(key, `${value.latency_ms} ms`, true)
                        )) : renderResult('No data', 'N/A', false)}
                    </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkChecks;