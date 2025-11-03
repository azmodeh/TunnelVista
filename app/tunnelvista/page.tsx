'use client';
import { motion } from 'framer-motion';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { AuroraButton } from '@/components/ui/AuroraButton';
import Flag from 'react-country-flag';
import { Copy, QrCode, Zap, Shield, Globe } from 'lucide-react';
import Lottie from 'lottie-react';
import pulse from '../../public/lottie/pulse.json';

const stats = [
  { icon: Zap, value: 1247, label: 'Active Tunnels', color: 'from-cyan-400 to-blue-600' },
  { icon: Shield, value: 99.9, label: 'Uptime', color: 'from-green-400 to-emerald-600', suffix: '%' },
  { icon: Globe, value: 24, label: 'Servers', color: 'from-purple-400 to-pink-600' },
];

export default function TunnelVista() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#0A0F1E] via-[#0F172A] to-[#1E293B] overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <motion.div
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)]"
        />
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="text-center pt-12"
        >
          <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TunnelVista
          </h1>
          <p className="text-xl text-gray-300 mt-4">Secure VPN Management Dashboard</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8, type: "spring" }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 10,
                boxShadow: "0 25px 50px -12px rgba(14,165,233,0.4)"
              }}
              className="relative group"
            >
              <AuroraCard className="h-full p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <stat.icon className={`w-16 h-16 mb-4 text-cyan-400`} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.3, type: "spring", stiffness: 200 }}
                    className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                  >
                    {stat.value}{stat.suffix}
                  </motion.div>
                  
                  <p className="text-gray-300 mt-3">{stat.label}</p>
                </div>

                <Lottie 
                  animationData={pulse} 
                  loop 
                  className="absolute -bottom-10 -right-10 w-32 opacity-20"
                />
              </AuroraCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <AuroraCard className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <motion.div
                animate={{ 
                  boxShadow: ["0 0 20px rgba(14,165,233,0)", "0 0 40px rgba(14,165,233,0.8)", "0 0 20px rgba(14,165,233,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Flag countryCode="DE" svg className="w-20 h-14 rounded-xl shadow-2xl" />
                <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-xl animate-pulse" />
              </motion.div>
              
              <div>
                <h3 className="text-2xl font-bold">Frankfurt Node 01</h3>
                <p className="text-teal-400 flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-400"
                  >●</motion.span>
                  Live • 42ms
                </p>
              </div>
            </div>

            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-black/40 p-6 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto backdrop-blur"
            >
              [Interface]{"\n"}
              PrivateKey = yAnIx...{"\n"}
              Address = 10.8.0.2/32{"\n"}
              {"\n"}
              [Peer]{"\n"}
              PublicKey = rT1j2...{"\n"}
              Endpoint = de.tunnelvista.com:51820
            </motion.pre>

            <div className="flex gap-4 mt-8">
              <AuroraButton className="flex-1">
                <Copy className="w-5 h-5" />
                <motion.span
                  whileTap={{ scale: 0.9 }}
                >Copy Config</motion.span>
              </AuroraButton>
              
              <AuroraButton variant="secondary" className="flex-1">
                <QrCode className="w-5 h-5" />
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >Show QR</motion.span>
              </AuroraButton>
            </div>
          </AuroraCard>
        </motion.div>
      </div>
    </div>
  );
}