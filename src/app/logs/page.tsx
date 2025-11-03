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
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, History } from 'lucide-react';
import { useLogAnalyses } from '@/components/logs/use-log-analysis';
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
            &lt;div className="space-y-2"&gt;
                &lt;Skeleton className="h-10 w-full" /&gt;
                &lt;Skeleton className="h-10 w-full" /&gt;
            &lt;/div&gt;
        )
    }

    if (isError) {
        return &lt;p className="text-destructive"&gt;Failed to load analysis history.&lt;/p&gt;
    }
    
    if (!data || data.length === 0) {
        return &lt;p className="text-sm text-muted-foreground text-center py-4"&gt;No analysis history found.&lt;/p&gt;
    }

    return (
        &lt;ScrollArea className="h-full max-h-96"&gt;
            &lt;Accordion type="single" collapsible className="w-full"&gt;
                {data.map(item =&gt; (
                    &lt;AccordionItem value={item.id} key={item.id}&gt;
                        &lt;AccordionTrigger&gt;
                            &lt;div className="flex justify-between items-center w-full pr-4"&gt;
                               &lt;div className="flex items-center gap-2"&gt;
                                 {item.problemDetected ? &lt;AlertCircle className="h-5 w-5 text-destructive" /&gt; : &lt;CheckCircle2 className="h-5 w-5 text-green-500" /&gt;}
                                 &lt;span className="font-semibold text-sm"&gt;{item.problemDescription?.substring(0, 50) || "No problems found"}...&lt;/span&gt;
                               &lt;/div&gt;
                                &lt;span className="text-xs text-muted-foreground"&gt;{item.timestamp ? formatDistanceToNow(new Date(item.timestamp.toDate()), { addSuffix: true }) : 'Just now'}&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/AccordionTrigger&gt;
                        &lt;AccordionContent className="space-y-2 pl-2"&gt;
                           &lt;p className="text-sm text-muted-foreground whitespace-pre-wrap"&gt;{item.problemDescription}&lt;/p&gt;
                           {item.problemDetected &amp;&amp; &lt;p className="text-sm whitespace-pre-wrap"&gt;&lt;strong className="text-accent"&gt;Suggestion:&lt;/strong&gt; {item.suggestedSolutions}&lt;/p&gt;}
                           &lt;div className="pt-2"&gt;
                                &lt;h4 className="text-xs font-semibold text-muted-foreground"&gt;Original Logs:&lt;/h4&gt;
                                &lt;Textarea readOnly value={item.logMessage} className="text-xs font-mono h-24 bg-background/50" /&gt;
                           &lt;/div&gt;
                        &lt;/AccordionContent&gt;
                    &lt;/AccordionItem&gt;
                ))}
            &lt;/Accordion&gt;
        &lt;/ScrollArea&gt;
    )
}

function LogsPageContent() {
  const [logs, setLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () =&gt; {
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
      &lt;div className="space-y-4"&gt;
        &lt;h1 className="text-3xl font-headline font-bold"&gt;AI Log Analysis&lt;/h1&gt;
        &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"&gt;
          &lt;div className="space-y-6"&gt;
            &lt;Card className="glass-card"&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle&gt;Submit Logs&lt;/CardTitle&gt;
                &lt;CardDescription&gt;
                  Paste your network or server logs below. The AI will analyze them for potential issues.
                &lt;/CardDescription&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent&gt;
                &lt;Textarea
                  value={logs}
                  onChange={(e) =&gt; setLogs(e.target.value)}
                  placeholder="[2023-10-27 10:00:00] INFO: User 'admin' logged in from 192.168.1.100..."
                  className="h-64 font-mono text-xs"
                  disabled={isLoading}
                /&gt;
              &lt;/CardContent&gt;
              &lt;CardFooter&gt;
                &lt;Button onClick={handleAnalyze} disabled={isLoading} className='w-full'&gt;
                  {isLoading ? (
                    &lt;&gt;
                      &lt;Loader2 className="mr-2 h-4 w-4 animate-spin" /&gt;
                      Analyzing...
                    &lt;/&gt;
                  ) : (
                    'Analyze Logs'
                  )}
                &lt;/Button&gt;
              &lt;/CardFooter&gt;
            &lt;/Card&gt;
            &lt;Card className="glass-card"&gt;
              &lt;CardHeader&gt;
                &lt;CardTitle className="flex items-center gap-2"&gt;&lt;History /&gt; Analysis History&lt;/CardTitle&gt;
                &lt;CardDescription&gt;
                    View past log analysis reports.
                &lt;/CardDescription&gt;
              &lt;/CardHeader&gt;
               &lt;CardContent&gt;
                  &lt;LogHistory /&gt;
               &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/div&gt;
          &lt;Card className="glass-card sticky top-24"&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;AI Analysis Report&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                The analysis results will appear here.
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent className="h-full min-h-[400px]"&gt;
                &lt;div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center"&gt;
                    &lt;Lightbulb className="h-10 w-10 mb-4" /&gt;
                    &lt;p&gt;AI log analysis feature has been disabled.&lt;/p&gt;
                &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      &lt;/div&gt;
  );
}


export default function LogsPage() {
  return (
    &lt;QueryClientProvider client={queryClient}&gt;
      &lt;LogsPageContent /&gt;
    &lt;/QueryClientProvider&gt;
  );
}