'use client';
import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export const AuroraButton = ({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', className?: string }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`
      px-6 py-3 rounded-xl font-bold text-sm transition-all
      ${variant === 'primary'
        ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
        : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
      }
      flex items-center justify-center gap-2
      rtl:flex-row-reverse
      ${className}
    `}
    {...props}
  >
    {children}
  </motion.button>
);