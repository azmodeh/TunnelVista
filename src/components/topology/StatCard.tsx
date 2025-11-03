import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Stat } from '@/lib/types';

const colorClasses: Record<string, string> = {
  green: 'text-green-400',
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
};

export function StatCard({ title, value, color = 'green' }: Stat) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn('text-4xl font-bold font-headline', colorClasses[color])}>{value}</p>
      </CardContent>
    </Card>
  );
}