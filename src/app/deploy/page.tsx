'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Lottie from 'lottie-react';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { AuroraButton } from '@/components/ui/AuroraButton';
import rocketAnimation from '../../../public/lottie/rocket.json';
import deployingAnimation from '../../../public/lottie/deploying.json';

export default function DeployPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  // const { t } = useTranslation('common');
  const t = (key: string) => key; // Placeholder for translation

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
    }, 3000); // Simulate deployment
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <AuroraCard>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Lottie
              animationData={isDeploying ? deployingAnimation : rocketAnimation}
              loop={true}
              style={{ height: 180 }}
            />
            <h1 className="mt-4 text-2xl font-bold text-white">
              {isDeploying ? t('deploying') : t('oneClickSecure')}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {isDeploying ? 'Please wait...' : 'Get your secure tunnel up and running.'}
            </p>
            <div className="mt-8">
              <AuroraButton onClick={handleDeploy} disabled={isDeploying}>
                {t('deployNow')}
              </AuroraButton>
            </div>
          </div>
        </AuroraCard>
      </motion.div>
    </div>
  );
}