'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface AuroraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const AuroraButton = ({ children, className, ...props }: AuroraButtonProps) => {
  return (
    <Button
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-px text-white transition-all duration-300 hover:shadow-[0_0_2rem_-0.5rem_#6366f1] disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(40%_128px_at_50%_0%,theme(backgroundColor.white/10%),transparent)]"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: '40%' }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      />
    </Button>
  );
};