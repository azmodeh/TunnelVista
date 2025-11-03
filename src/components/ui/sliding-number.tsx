'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SlidingNumberProps {
  number: number | string;
  className?: string;
}

export function SlidingNumber({ number, className }: SlidingNumberProps) {
  const numericValue = typeof number === 'string' ? parseFloat(number.replace(/,/g, '')) : number;
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  const displayValue = useTransform(springValue, (current) => {
    // Check if the original number has decimals to decide formatting
    const hasDecimal = String(number).includes('.');
    if (hasDecimal) {
      return current.toFixed(2);
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    motionValue.set(numericValue);
  }, [numericValue, motionValue]);

  return (
    <motion.span className={cn(className)}>
      {displayValue}
    </motion.span>
  );
}