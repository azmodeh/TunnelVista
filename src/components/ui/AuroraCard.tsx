import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const AuroraCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(`
        relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden`,
        className
    )}>
        <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.2),_transparent_40%)] animate-[spin_10s_linear_infinite]" />
        </motion.div>
        {children}
    </div>
);