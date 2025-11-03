'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { SlidingNumber } from '../ui/sliding-number';
import { motion } from 'framer-motion';
import { fadeInUpVariants } from '@/lib/animations';
import { SoftRoundedCard } from '../ui/SoftRoundedCard';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {

  return (
    <motion.div variants={fadeInUpVariants}>
      <SoftRoundedCard className="flex flex-col justify-between h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between gap-2">
            <SlidingNumber number={value} className="text-4xl font-bold font-headline" />
          </div>
        </CardContent>
      </SoftRoundedCard>
    </motion.div>
  );
}