import { Stat } from '@/lib/types';
import { subDays, subHours } from 'date-fns';

export const trafficData = Array.from({ length: 24 }, (_, i) => {
  const date = subDays(new Date(), 0);
  date.setHours(i, 0, 0, 0);
  return {
    time: date.toISOString(),
    incoming: Math.floor(Math.random() * 2000 + 500),
    outgoing: Math.floor(Math.random() * 1500 + 300),
  };
});