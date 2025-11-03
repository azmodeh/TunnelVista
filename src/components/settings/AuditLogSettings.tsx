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
import { Input } from '@/components/ui/input';
import { Download, Calendar, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuditLogs } from '@/hooks/use-audit-log';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export const AuditLogSettings = memo(() => {
    const [date, setDate] = useState<Date | undefined>();
    const { data: auditLogs, isLoading } = useAuditLogs();

    return (
        <Card className="glass-card">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View user and system activity logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
                    <Input placeholder="Filter by user or action..." className="max-w-xs" />
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={"w-[240px] justify-start text-left font-normal"}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4"/>Export</Button>
                </div>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : auditLogs && auditLogs.length > 0 ? (
                                auditLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.userEmail}</TableCell>
                                        <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                                        <TableCell>{log.details}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {log.timestamp ? formatDistanceToNow(new Date(log.timestamp.toDate()), { addSuffix: true }) : 'Just now'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
          </Card>
    )
});
AuditLogSettings.displayName = 'AuditLogSettings';