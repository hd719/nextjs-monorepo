"use client";

import { cn } from "@/app/lib/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";

interface AnimateProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
}

export const Animate = ({
  children,
  className,
  variant,
  delay = 0,
  yOffset = 8,
}: AnimateProps) => {
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: "blur(8px)" },
    visible: { y: -yOffset, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }} // initial state of the component
        animate={{ opacity: 1, scale: 1 }} // state of the component when it is visible (or when it is transitioning to visible)
        transition={{ delay, ease: "easeOut" }} // transition settings for the component (in this case, the component will take 1 second to transition from the initial state to the animate state)
        // variants={combinedVariants}
        className={cn("inline-block", className)}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
};
