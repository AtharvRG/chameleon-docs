"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number; // 0 to 100
    className?: string;
}

export function Progress({ value, className }: ProgressProps) {
    return (
        <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary/50", className)}>
            <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
        </div>
    );
}