'use client';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { AuroraButton } from '@/components/ui/AuroraButton';
import Flag from 'react-country-flag';
import { motion } from 'framer-motion';

export default function UserVista() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#16213E] p-6">
      <AuroraCard className="max-w-md mx-auto">
        <motion.h1
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          className="text-3xl font-bold text-center text-white mb-6"
        >
          کانفیگ شما آماده است!
        </motion.h1>

        <div className="flex items-center gap-4 mb-6">
          <Flag countryCode="IR" svg className="w-16 h-12 rounded-lg shadow-lg" />
          <div className="text-right">
            <p className="text-lg text-white font-bold">تهران ۱</p>
            <p className="text-sm text-teal-400">پینگ: ۲۸ میلی‌ثانیه</p>
          </div>
        </div>

        <pre className="bg-black/40 p-4 rounded-xl text-xs text-cyan-300 overflow-x-auto font-mono text-left">
          [Interface]{"\n"}PrivateKey = xxxxxxxxxxxxxxxxxxxxxxxx
        </pre>

        <div className="flex gap-3 mt-6">
          <AuroraButton className="flex-1">
            کپی کانفیگ
          </AuroraButton>
          <AuroraButton variant="secondary" className="flex-1">
            QR کد
          </AuroraButton>
        </div>
      </AuroraCard>
    </div>
  );
}