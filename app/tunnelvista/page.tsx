'use client';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { AuroraButton } from '@/components/ui/AuroraButton';
import Flag from 'react-country-flag';
import { motion } from 'framer-motion';

export default function TunnelVista() {
  return (
    <div dir="ltr" className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#16213E] p-6 font-inter">
      <AuroraCard className="max-w-md mx-auto">
        <motion.h1
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          className="text-3xl font-bold text-center text-white mb-6"
        >
          Your Config is Ready!
        </motion.h1>

        <div className="flex items-center gap-4 mb-6">
          <Flag countryCode="DE" svg className="w-16 h-12 rounded-lg shadow-lg" />
          <div>
            <p className="text-lg text-white">Frankfurt 1</p>
            <p className="text-sm text-teal-400">Ping: 42ms</p>
          </div>
        </div>

        <pre className="bg-black/40 p-4 rounded-xl text-xs text-cyan-300 overflow-x-auto font-mono text-left">
          [Interface]{"\n"}PrivateKey = xxxxxxxxxxxxxxxxxxxxxxxx
        </pre>

        <div className="flex gap-3 mt-6">
          <AuroraButton className="flex-1">
            Copy Config
          </AuroraButton>
          <AuroraButton variant="secondary" className="flex-1">
            QR Code
          </AuroraButton>
        </div>
      </AuroraCard>
    </div>
  );
}