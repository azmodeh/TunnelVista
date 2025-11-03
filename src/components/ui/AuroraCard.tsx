import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AuroraCard = React.forwardRef<HTMLDivElement, AuroraCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 0 25px rgba(14, 165, 233, 0.5)",
          borderColor: "rgba(14, 165, 233, 0.7)",
        }}
        className={cn(
          "bg-glass backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-all",
          "shadow-lg shadow-black/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AuroraCard.displayName = "AuroraCard";

export { AuroraCard };