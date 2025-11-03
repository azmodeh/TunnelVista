'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { detectLogProblem, type DetectLogProblemOutput } from '@/ai/flows/log-problem-detection';
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, History } from 'lucide-react';
import { useAddLogAnalysis, useLogAnalyses } from '@/components/logs/use-log-analysis';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function LogHistory() {
    const { data, isLoading, isError } = useLogAnalyses();

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (isError) {
        return <p className="text-destructive">Failed to load analysis history.</p>
    }
    
    if (!data || data.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No analysis history found.</p>
    }

    return (
        <ScrollArea className="h-full max-h-96">
            <Accordion type="single" collapsible className="w-full">
                {data.map(item => (
                    <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between items-center w-full pr-4">
                               <div className="flex items-center gap-2">
                                 {item.problemDetected ? <AlertCircle className="h-5 w-5 text-destructive" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                 <span className="font-semibold text-sm">{item.problemDescription?.substring(0, 50) || "No problems found"}...</span>
                               </div>
                                <span className="text-xs text-muted-foreground">{item.timestamp ? formatDistanceToNow(new Date(item.timestamp.toDate()), { addSuffix: true }) : 'Just now'}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pl-2">
                           <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.problemDescription}</p>
                           {item.problemDetected && <p className="text-sm whitespace-pre-wrap"><strong className="text-accent">Suggestion:</strong> {item.suggestedSolutions}</p>}
                           <div className="pt-2">
                                <h4 className="text-xs font-semibold text-muted-foreground">Original Logs:</h4>
                                <Textarea readOnly value={item.logMessage} className="text-xs font-mono h-24 bg-background/50" />
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </ScrollArea>
    )
}

function LogsPageContent() {
  const [logs, setLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DetectLogProblemOutput | null>(null);
  const { toast } = useToast();
  const addLogAnalysisMutation = useAddLogAnalysis();


  const handleAnalyze = async () => {
    if (!logs.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please paste some logs to analyze.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await detectLogProblem({ logs });
      setAnalysisResult(result);
      addLogAnalysisMutation.mutate({
        logMessage: logs,
        analysisResult: result.problemDescription,
        ...result,
      });

    } catch (error) {
      console.error('Failed to analyze logs:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing the logs. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-4">
        <h1 className="text-3xl font-headline font-bold">AI Log Analysis</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Submit Logs</CardTitle>
                <CardDescription>
                  Paste your network or server logs below. The AI will analyze them for potential issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                  placeholder="[2023-10-27 10:00:00] INFO: User 'admin' logged in from 192.168.1.100..."
                  className="h-64 font-mono text-xs"
                  disabled={isLoading}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleAnalyze} disabled={isLoading} className='w-full'>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Logs'
                  )}
                </Button>
              </CardFooter>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Analysis History</CardTitle>
                <CardDescription>
                    View past log analysis reports.
                </CardDescription>
              </CardHeader>
               <CardContent>
                  <LogHistory />
               </CardContent>
            </Card>
          </div>
          <Card className="glass-card sticky top-24">
            <CardHeader>
              <CardTitle>AI Analysis Report</CardTitle>
              <CardDescription>
                The analysis results will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full min-h-[400px]">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>AI is thinking...</p>
                </div>
              )}
              {analysisResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {analysisResult.problemDetected ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-destructive">Problem Detected</h3>
                          <p className="text-sm text-destructive/80">{analysisResult.problemDescription}</p>
                        </div>
                      </div>
                       <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <Lightbulb className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                         <div>
                          <h3 className="font-semibold text-accent">Suggested Solutions</h3>
                          <p className="text-sm text-accent/80 whitespace-pre-wrap">{analysisResult.suggestedSolutions}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 text-green-400 mb-4" />
                        <h3 className="font-semibold text-lg text-foreground">No Problems Detected</h3>
                        <p className="text-sm">The AI analysis found no significant issues in the provided logs.</p>
                    </div>
                  )}
                </motion.div>
              )}
               {!isLoading && !analysisResult && (
                 <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <Lightbulb className="h-10 w-10 mb-4" />
                    <p>Your analysis report is pending.</p>
                    <p className="text-sm">Submit logs to begin.</p>
                </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}


export default function LogsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LogsPageContent />
    </QueryClientProvider>
  );
}