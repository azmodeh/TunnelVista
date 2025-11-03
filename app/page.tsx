'use client';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import Tilt from 'react-parallax-tilt';
import { Button } from '@/components/ui/button';
import { Play, ChevronDown, Zap, Shield, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AuroraCard } from '@/components/ui/AuroraCard';
// Assuming you have lottie files in public/lottie
// import rocket from '@/public/lottie/rocket.json';
// import particles from '@/public/lottie/particles.json';

const features = [
    { icon: Zap, title: 'Lightning Fast', titleFA: 'برق‌آسا', desc: 'Up to 2 Gbps encrypted tunnels', descFA: 'تونل رمزنگاری‌شده تا ۲ گیگابیت' },
    { icon: Shield, title: 'Military Grade', titleFA: 'درجه نظامی', desc: 'AES-256 + WireGuard + V2Ray', descFA: 'AES-256 + وایرگارد + وی‌توری' },
    { icon: Globe, title: '200+ Locations', titleFA: '۲۰۰+ موقعیت', desc: 'Iran, Germany, USA, Singapore', descFA: 'ایران، آلمان، آمریکا، سنگاپور' },
];

export default function Landing() {
    const pathname = usePathname();
    const isFA = pathname.startsWith('/fa');

    return (
        <>
            {/* <div className="fixed inset-0 -z-10">
                <Lottie animationData={particles} loop className="opacity-30" />
            </div> */}

            <section className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center z-10"
                >
                    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
                        <AuroraCard>
                            {/* <Lottie animationData={rocket} loop className="w-48 mx-auto mb-8" /> */}
                            
                            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                                {isFA ? 'تونل ویستا' : 'TunnelVista'}
                            </h1>
                            
                            <p className="text-xl text-white/80 mt-4 max-w-2xl mx-auto">
                                {isFA 
                                ? 'تونل امن، سریع و نامرئی — فقط با یک کلیک'
                                : 'Secure, blazing-fast, invisible tunnel — one tap away'}
                            </p>

                            <div className="flex gap-4 justify-center mt-8">
                                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                                {isFA ? 'شروع رایگان' : 'Start Free'}
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/30 text-white">
                                <Play className="me-2" /> {isFA ? 'دمو' : 'Demo'}
                                </Button>
                            </div>
                        </AuroraCard>
                    </Tilt>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute bottom-8"
                >
                    <ChevronDown className="w-10 h-10 text-white/60" />
                </motion.div>
            </section>

            <section className="py-24 px-8">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
                    >
                        <f.icon className="w-12 h-12 text-cyan-400 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">
                            {isFA ? f.titleFA : f.title}
                        </h3>
                        <p className="text-white/70">
                            {isFA ? f.descFA : f.desc}
                        </p>
                    </motion.div>
                ))}
                </div>
            </section>
        </>
    );
}