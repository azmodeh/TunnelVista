import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const AuroraCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(`
        bg-white/10 backdrop-blur-xl border border-white/20
        rounded-2xl p-6 shadow-2xl
        transition-all duration-300 hover:shadow-cyan-500/25
        `, className)}
    >
        {children}
    </div>
);