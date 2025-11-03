'use client';
import { motion } from 'framer-motion';
import CountryFlag from 'react-country-flag';
import { Star } from 'lucide-react';
// import Lottie from 'lottie-react';
// import connect from '@/public/lottie/connect.json';

const servers = [
  { id: 1, code: 'IR', name: 'تهران ۱', ping: 28, city: 'تهران' },
  { id: 2, code: 'DE', name: 'فرانکفورت', ping: 42, city: 'فرانکفورت' },
  { id: 3, code: 'US', name: 'نیویورک', ping: 89, city: 'نیویورک' },
  { id: 4, code: 'SG', name: 'سنگاپور', ping: 120, city: 'سنگاپور' },
];

const getPingColor = (ping: number) => {
  if (ping < 50) return 'bg-green-500/20 text-green-400';
  if (ping < 100) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
};

export default function ServersPage() {
  const fastest = servers.reduce((a, b) => (a.ping < b.ping ? a : b));

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">انتخاب سرور</h1>
      <div className="max-w-2xl mx-auto space-y-4">
        {servers.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 flex items-center gap-4 relative overflow-hidden">
              <div className="relative">
                <CountryFlag countryCode={s.code} svg className="!w-14 !h-10 rounded-lg shadow-lg" />
                {s.id === fastest.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full p-1"
                  >
                    <Star size={16} fill="currentColor" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{s.name}</h3>
                <p className="text-sm text-white/70">{s.city}</p>
              </div>

              <div className={`px-3 py-1 rounded-full text-sm font-bold ${getPingColor(s.ping)}`}>
                {s.ping}ms
              </div>
              
              {/* <Lottie
                animationData={connect}
                loop
                className="w-12 h-12"
                speed={s.id === fastest.id ? 2 : 1}
              /> */}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}