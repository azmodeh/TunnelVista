
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Device, type DeviceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { CountryFlag } from '../ui/CountryFlag';

const statusStyles: Record<DeviceStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
};

export function DeviceList({ devices }: { devices: Device[] }) {
  return (
    <ScrollArea className="h-[300px] w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead className='text-right'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {device.country_code && (
                     <CountryFlag code={device.country_code} size="md" />
                  )}
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {device.location}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {device.ip}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      statusStyles[device.status]
                    )}
                  />
                  <span className="capitalize text-sm">{device.status}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
