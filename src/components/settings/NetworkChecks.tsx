'use client';
import { useState, FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Server, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { AnimatedFlag } from '../ui/AnimatedFlag';
import { Skeleton } from '../ui/skeleton';

const NetworkChecks: FC = () => {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!ip) {
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
      // We are removing the genkit flow, you can replace this with any other IP checking service
      // For now, we'll just show a mock error.
      toast({
        title: 'Network Check Unavailable',
        description: 'The network check service is currently not available.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error checking IP:', error);
      toast({
        title: 'Error',
        description: 'Failed to check IP address.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const renderResult = (label: string, value: any, icon: React.ReactNode, status?: boolean) => (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <div className="flex items-center">
          {status !== undefined && (
            <span className="mr-2">{status ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}</span>
          )}
          <Badge variant={status ? 'default' : 'destructive'}>{value}</Badge>
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-6 bg-gray-900 border-gray-800">
      <h3 className="text-xl font-bold mb-4">Network Checks</h3>
      <div className="flex gap-2">
        <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Enter IP address" />
        <Button onClick={handleCheck} disabled={loading}>
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </div>

      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <AnimatedFlag countryCode={results.countryCode || ''} />
              <span className="ml-2">{results.ip}</span>
            </div>
            <Badge>{results.isp}</Badge>
          </div>
          {renderResult('DNS Resolution', 'Resolved', <Globe />, true)}
          {renderResult('TCP Port (443)', 'Open', <Server />, true)}
          {renderResult('Ping', '60ms', <Clock />, true)}
        </motion.div>
      )}
    </Card>
  );
};

export default NetworkChecks;