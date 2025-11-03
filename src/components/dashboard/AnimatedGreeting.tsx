'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hand, X } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';

export function AnimatedGreeting() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  const userName = user?.displayName || 'Guest';

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('greetingShown');
    if (!hasBeenShown && user) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('greetingShown', 'true');
      }, 1000); // Delay showing the greeting a bit
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  useEffect(() => {
    if(isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000); // Auto-hide after 7 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
        >
          <Card className="glass-card overflow-hidden border-teal-gradient">
            <div className="p-1">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                         <Hand className="h-6 w-6 text-purple-300" />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold font-headline text-gradient bg-gradient-to-r from-purple-400 to-teal-400">
                            Welcome, {userName}!
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ready to manage your network empire?
                          </p>
                       </div>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-7 w-7">
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
                </CardContent>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}