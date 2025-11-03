'use client';
    import { AuroraCard } from '@/components/ui/AuroraCard';
    import { Shield, BarChart } from 'lucide-react';
    import Image from 'next/image';
    import { motion } from 'framer-motion';

    export default function ProfilePage() {
      // const isPersian = false;
      const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      };

      return (
        <div className="p-8 flex justify-center items-start text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <AuroraCard>
              <div className="flex flex-col items-center text-center">
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-cyan-400"
                />
                <h2 className="text-3xl font-bold mt-4">{user.name}</h2>
                <p className="text-white/70">{user.email}</p>
                <div className="w-full h-px bg-white/20 my-6" />
                <div className="w-full text-start space-y-4">
                  <div className="flex items-center gap-4">
                    <Shield className="text-teal-400" />
                    <span>Plan: Premium</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <BarChart className="text-purple-400" />
                    <span>Usage: 8.2 GB</span>
                  </div>
                </div>
              </div>
            </AuroraCard>
          </motion.div>
        </div>
      );
    }