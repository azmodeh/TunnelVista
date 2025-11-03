'use client';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Languages, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [autoConnect, setAutoConnect] = useState(true);
  const [language, setLanguage] = useState('fa');
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="p-4 sm:p-6 md:p-10 text-white min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-10"
      >
        تنظیمات
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 space-y-8"
      >
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-connect" className="text-lg flex items-center gap-3">
            <span className="w-8 h-8 bg-cyan-500/20 text-cyan-400 flex items-center justify-center rounded-lg">🚀</span>
            اتصال خودکار
          </Label>
          <Switch
            id="auto-connect"
            checked={autoConnect}
            onCheckedChange={setAutoConnect}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="language" className="text-lg flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-500/20 text-purple-400 flex items-center justify-center rounded-lg"><Languages size={20} /></span>
            زبان
          </Label>
          {/* Using a div for styling since native select is hard to style */}
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg py-2 pl-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.414l2.904-2.866c.436-.446 1.144-.446 1.58 0 .436.446.436 1.16 0 1.606l-3.694 3.652a1.1 1.1 0 01-1.58 0L5.516 9.154c-.436-.446-.436-1.16 0-1.606z"/></svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="text-lg flex items-center gap-3">
            <span className="w-8 h-8 bg-yellow-500/20 text-yellow-400 flex items-center justify-center rounded-lg"><Moon size={20} /></span>
            حالت تاریک
          </Label>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
      </motion.div>
    </div>
  );
}