'use client';

    import { useState } from 'react';
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
    import { Lightbulb, Loader2, History } from 'lucide-react';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

    const queryClient = new QueryClient();

    function LogsPageContent() {
      const [logs, setLogs] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();

      const handleAnalyze = async () => {
        if (!logs.trim()) {
          toast({
            variant: 'destructive',
            title: 'Input Required',
            description: 'Please paste some logs to analyze.',
          });
          return;
        }
        
        toast({
            title: 'Feature Disabled',
            description: 'AI Log Analysis is currently unavailable.',
        });
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
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center py-8">
                        <History className="h-8 w-8 mb-2" />
                        <p>Analysis history is currently unavailable.</p>
                      </div>
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
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                        <Lightbulb className="h-10 w-10 mb-4" />
                        <p>AI log analysis feature has been disabled.</p>
                    </div>
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