"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    gradient?: boolean;
    children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, gradient = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                    "relative overflow-hidden rounded-sm border border-white/5 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl",
                    "dark:bg-black/20 dark:border-white/5",
                    gradient && "bg-gradient-to-br from-white/10 to-white/5",
                    className
                )}
                {...props}
            >
                <div className="relative z-10">{children}</div>
            </motion.div>
        );
    }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };