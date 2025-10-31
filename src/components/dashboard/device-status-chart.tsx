'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Device } from '@/lib/types';

interface DeviceStatusChartProps {
  devices: Device[];
}

export function DeviceStatusChart({ devices }: DeviceStatusChartProps) {
  const statusCounts = useMemo(() => {
    const counts = devices.reduce(
      (acc, device) => {
        acc[device.status]++;
        return acc;
      },
      { online: 0, offline: 0, error: 0 }
    );
    return [
      { name: 'Online', value: counts.online, fill: 'hsl(var(--chart-2))' },
      { name: 'Offline', value: counts.offline, fill: 'hsl(var(--muted-foreground))' },
      { name: 'Error', value: counts.error, fill: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [devices]);

  const totalDevices = useMemo(() => {
    return devices.length;
  }, [devices]);
  
  if (totalDevices === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No device data available.
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
           <Cell key="devices" fill="var(--color-devices)" className="stroke-transparent" />
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
