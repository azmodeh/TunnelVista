'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CountryFlag } from './CountryFlag';
import { cn } from '@/lib/utils';

interface AnimatedFlagProps {
  countryCode: string;
  className?: string;
}

const AnimatedFlag = ({ countryCode, className }: AnimatedFlagProps) => {
  if (!countryCode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      <CountryFlag countryCode={countryCode} />
      <div className="absolute inset-0 rounded-md border border-white/20 animate-pulse-glow" />
    </motion.div>
  );
};

export { AnimatedFlag };