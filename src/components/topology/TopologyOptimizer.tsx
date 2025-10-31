'use client';

import { useState } from 'react';
import { optimizeNetworkTopology, type OptimizeNetworkTopologyOutput } from '@/ai/flows/network-topology-optimization';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Device, VpnTunnel } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface TopologyOptimizerProps {
    isOpen: boolean;
    onClose: () => void;
    devices: Device[];
    tunnels: VpnTunnel[];
}

const TopologyOptimizer: React.FC<TopologyOptimizerProps> = ({ isOpen, onClose, devices, tunnels }) => {
    const [goals, setGoals] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OptimizeNetworkTopologyOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!goals.trim()) {
            toast({
                variant: 'destructive',
                title: 'Goals Required',
                description: 'Please describe your optimization goals.',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const networkState = {
                devices: devices.map(d => ({ id: d.id, name: d.name, type: d.type, location: d.location })),
                tunnels: tunnels.map(t => ({ id: t.id, source: t.sourceDeviceId, destination: t.destinationDeviceId, protocol: t.protocol, status: t.status }))
            };
            
            const response = await optimizeNetworkTopology({
                currentTopology: JSON.stringify(networkState, null, 2),
                optimizationGoals: goals,
            });
            setResult(response);

        } catch (error) {
            console.error("Failed to get optimization suggestions:", error);
            toast({
                variant: 'destructive',
                title: 'Optimization Failed',
                description: (error as Error).message || 'An error occurred while fetching suggestions.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl w-full">
                <SheetHeader>
                    <SheetTitle>AI Network Optimizer</SheetTitle>
                    <SheetDescription>
                        Describe your network goals and let AI suggest an optimized topology.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="goals">Optimization Goals</Label>
                        <Textarea
                            id="goals"
                            placeholder="e.g., 'Reduce latency between Iran and Germany', 'Improve reliability for US servers', 'Create a redundant path for Frankfurt'."
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                     <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Generate Suggestions</>
                        )}
                    </Button>
                </div>
               
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                
                {result && (
                    <ScrollArea className="h-[calc(100vh-300px)]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 mt-4 pr-4"
                        >
                            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                                <h3 className="font-semibold text-accent flex items-center gap-2"><Lightbulb /> Analysis</h3>
                                <p className="text-sm text-accent/80 mt-2 whitespace-pre-wrap">{result.analysis}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                <h3 className="font-semibold text-primary flex items-center gap-2"><Sparkles /> Suggestions</h3>
                                <p className="text-sm text-primary/80 mt-2 whitespace-pre-wrap">{result.suggestions}</p>
                            </div>
                        </motion.div>
                    </ScrollArea>
                )}

                <SheetFooter className='mt-4'>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default TopologyOptimizer;
