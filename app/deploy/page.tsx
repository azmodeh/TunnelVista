'use client';
    import { useState } from 'react';
    import { motion } from 'framer-motion';
    import { AuroraCard } from '@/components/ui/AuroraCard';
    import { Button } from '@/components/ui/button';
    // import Lottie from 'lottie-react';
    // import rocket from '@/public/lottie/rocket.json';
    // import deploying from '@/public/lottie/deploying.json';

    export default function DeployPage() {
      const [isDeploying, setIsDeploying] = useState(false);
      // const isPersian = false;

      const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => setIsDeploying(false), 4000);
      };

      return (
        <div className="flex items-center justify-center min-h-full p-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <AuroraCard className="text-center">
              <div className="w-64 h-64 mx-auto flex items-center justify-center">
                {/* <Lottie 
                  animationData={isDeploying ? deploying : rocket} 
                  loop 
                  className="h-48"
                /> */}
                <p className="text-2xl">{isDeploying ? 'Deploying...' : 'Ready!'}</p>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {isDeploying ? 'Deploying...' : 'One Tap Secure Tunnel'}
              </h2>
              <Button onClick={handleDeploy} disabled={isDeploying} size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                {isDeploying ? 'In Progress...' : 'Deploy Now'}
              </Button>
            </AuroraCard>
          </motion.div>
        </div>
      );
    }