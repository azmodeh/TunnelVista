import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { type Log, type LogLevel } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const logMeta: Record<
  LogLevel,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  info: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
  },
};

export function RecentLogs({ logs }: { logs: Log[] }) {
  return (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-4 pr-4">
        {logs.map((log) => {
          const MetaIcon = logMeta[log.level].icon;
          return (
            <div key={log.id} className="flex items-start gap-4">
              <div
                className={cn(
                  'rounded-full p-2',
                  logMeta[log.level].bgColor
                )}
              >
                <MetaIcon className={cn('h-4 w-4', logMeta[log.level].color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm">{log.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}