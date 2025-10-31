'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import type { VpnTunnel } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface TunnelStatusChartProps {
  tunnels: VpnTunnel[];
}

export function TunnelStatusChart({ tunnels }: TunnelStatusChartProps) {
  const statusCounts = useMemo(() => {
    const counts = tunnels.reduce(
      (acc, tunnel) => {
        acc[tunnel.status]++;
        return acc;
      },
      { active: 0, inactive: 0 }
    );
     return [
      { name: 'Active', value: counts.active, fill: 'hsl(var(--chart-1))' },
      { name: 'Inactive', value: counts.inactive, fill: 'hsl(var(--muted-foreground))' },
    ].filter(item => item.value > 0);
  }, [tunnels]);

  const totalTunnels = useMemo(() => {
    return tunnels.length;
  }, [tunnels]);
  
  if (totalTunnels === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No tunnel data available.
      </div>
    );
  }

  return (
     <ChartContainer config={{}} className="mx-auto aspect-square h-full w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={statusCounts}
          dataKey="value"
          nameKey="name"
          innerRadius="60%"
          strokeWidth={5}
        >
          {statusCounts.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} className="stroke-transparent" />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
