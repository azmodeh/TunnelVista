'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { ShieldCheck, BarChart2, Mail, User } from 'lucide-react';
import { useUser } from '@/firebase';

export default function ProfilePage() {
  // const { t } = useTranslation('common');
  const t = (key: string) => key; // Placeholder for translation
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <AuroraCard>
            <div className="p-6">
                <div className="flex flex-col items-center text-center">
                    <img
                        src={user.photoURL || `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.email}`}
                        alt="User Avatar"
                        className="h-24 w-24 rounded-full border-4 border-purple-500/50 object-cover"
                    />
                    <h1 className="mt-4 text-3xl font-bold text-white">{user.displayName || 'Anonymous User'}</h1>
                    <p className="text-sm text-white/70">{user.email}</p>
                </div>

                <hr className="my-6 border-white/10" />

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="h-5 w-5 text-teal-400" />
                        <span className="text-white">{t('plan')}</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <BarChart2 className="h-5 w-5 text-purple-400" />
                        <span className="text-white">{t('usage')}</span>
                    </div>
                </div>
            </div>
        </AuroraCard>
      </motion.div>
    </div>
  );
}