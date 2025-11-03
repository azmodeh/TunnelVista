'use client';
    import { motion } from 'framer-motion';
    import { AuroraCard } from '@/components/ui/AuroraCard';
    import CountryFlag from 'react-country-flag';
    // import Lottie from 'lottie-react';
    // import pulse from '@/public/lottie/pulse.json';

    const mockNodes = [
      { id: '1', name: 'Tehran', country: 'IR', x: '20%', y: '30%' },
      { id: '2', name: 'Frankfurt', country: 'DE', x: '50%', y: '10%' },
      { id: '3', name: 'New York', country: 'US', x: '80%', y: '40%' },
      { id: '4', name: 'Singapore', country: 'SG', x: '40%', y: '70%' },
    ];

    export default function TopologyPage() {
      // const isPersian = false; // Add i18n logic later

      return (
        <div className="p-8 text-white">
          <h1 className="text-4xl font-bold mb-8">Topology</h1>
          <div className="relative w-full h-[70vh] bg-black/20 rounded-xl border border-white/10">
            {mockNodes.map((node) => (
              <motion.div
                key={node.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.random() * 0.5 }}
                style={{ left: node.x, top: node.y }}
              >
                <AuroraCard className="p-4">
                  <div className="flex flex-col items-center gap-2">
                    <CountryFlag countryCode={node.country} svg style={{ width: '48px', height: 'auto', borderRadius: '4px' }} />
                    <span className="text-xs font-semibold">{node.name}</span>
                    {/* <Lottie animationData={pulse} loop className="w-8 h-8" /> */}
                  </div>
                </AuroraCard>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }