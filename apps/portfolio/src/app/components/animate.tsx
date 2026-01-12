"use client";

import { cn } from "@/app/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface AnimateProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Animate = ({
  children,
  className,
  delay = 0,
}: AnimateProps) => {
  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, ease: "easeOut" }}
        className={cn("inline-block", className)}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
};
