
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUpVariants } from '@/lib/animations';

interface SoftRoundedCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SoftRoundedCard({ children, className }: SoftRoundedCardProps) {
  return (
    <motion.div 
      variants={fadeInUpVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn("glass-card rounded-xl", className)}
    >
      {children}
    </motion.div>
  );
}
