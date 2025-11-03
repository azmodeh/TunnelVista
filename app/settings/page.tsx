'use client';
    import { useState } from 'react';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Language, Moon } from 'lucide-react';
    // import Lottie from 'lottie-react';
    // import switchAnim from '@/public/lottie/switch.json';

    export default function SettingsPage() {
      const [locale, setLocale] = useState('en');
      // const isPersian = locale === 'fa';

      return (
        <div className="p-8 text-white max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                {/* <Lottie animationData={switchAnim} loop className="w-12 h-12" /> */}
                <Label htmlFor="auto-connect" className="text-lg">Auto Connect</Label>
              </div>
              <Switch id="auto-connect" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <Language />
                <Label className="text-lg">Language</Label>
              </div>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-white/20">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fa">فارسی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <Moon />
                <Label className="text-lg">Dark Mode</Label>
              </div>
              <Switch checked disabled />
            </div>
          </div>
        </div>
      );
    }