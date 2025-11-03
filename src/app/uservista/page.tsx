'use client';
    import { AuroraCard } from '@/components/ui/AuroraCard';
    import { AuroraButton } from '@/components/ui/AuroraButton';
    import Flag from 'react-country-flag';
    import { motion } from 'framer-motion';

    export default function UserVista() {
      return (
        &lt;div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#16213E] p-6"&gt;
          &lt;AuroraCard className="max-w-md mx-auto"&gt;
            &lt;motion.h1
              initial={{ opacity:0, y:-20 }}
              animate={{ opacity:1, y:0 }}
              className="text-3xl font-bold text-center text-white mb-6"
            &gt;
              کانفیگ شما آماده است!
            &lt;/motion.h1&gt;

            &lt;div className="flex items-center gap-4 mb-6"&gt;
              &lt;Flag countryCode="IR" svg className="w-16 h-12 rounded-lg shadow-lg" /&gt;
              &lt;div className="text-right"&gt;
                &lt;p className="text-lg text-white font-bold"&gt;تهران ۱&lt;/p&gt;
                &lt;p className="text-sm text-teal-400"&gt;پینگ: ۲۸ میلی‌ثانیه&lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;pre className="bg-black/40 p-4 rounded-xl text-xs text-cyan-300 overflow-x-auto font-mono text-left"&gt;
              [Interface]{"\n"}PrivateKey = xxxxxxxxxxxxxxxxxxxxxxxx
            &lt;/pre&gt;

            &lt;div className="flex gap-3 mt-6"&gt;
              &lt;AuroraButton className="flex-1"&gt;
                کپی کانفیگ
              &lt;/AuroraButton&gt;
              &lt;AuroraButton variant="secondary" className="flex-1"&gt;
                QR کد
              &lt;/AuroraButton&gt;
            &lt;/div&gt;
          &lt;/AuroraCard&gt;
        &lt;/div&gt;
      );
    }