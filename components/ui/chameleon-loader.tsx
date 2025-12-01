"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChameleonLoaderProps {
    className?: string;
}

export function ChameleonLoader({ className }: ChameleonLoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-8", className)}>
            <div className="relative h-48 w-48">
                <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                >
                    {/* Branch */}
                    <motion.path
                        d="M20 150 C 60 145, 140 145, 180 150"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-muted-foreground/40"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />

                    {/* Chameleon Body */}
                    <motion.path
                        d="M60 145 C 60 120, 80 100, 110 100 C 140 100, 150 120, 150 145"
                        stroke="currentColor"
                        strokeWidth="0"
                        fill="currentColor"
                        className="text-primary"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    />

                    {/* Head - More Realistic Shape */}
                    <motion.path
                        d="M150 145 C 145 125, 155 110, 165 115 C 175 120, 185 135, 180 145 Z"
                        fill="currentColor"
                        className="text-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    />

                    {/* Eye */}
                    <motion.circle
                        cx="170"
                        cy="130"
                        r="3"
                        fill="white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                    />
                    <motion.circle
                        cx="170"
                        cy="130"
                        r="1.5"
                        fill="black"
                        initial={{ scale: 0 }}
                        animate={{
                            scale: 1,
                            x: [0, 1, 0, -1, 0],
                            y: [0, -1, 0, 1, 0]
                        }}
                        transition={{
                            scale: { duration: 0.3, delay: 0.9 },
                            default: { duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }
                        }}
                    />

                    {/* Legs */}
                    <motion.path
                        d="M80 145 L 80 155 M130 145 L 130 155"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-primary"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                    />

                    {/* Jalebi Tail - The Star of the Show */}
                    <motion.path
                        // Spiral path starting from body (60, 145)
                        d="M60 145 C 50 145, 40 150, 40 160 C 40 175, 55 180, 65 170 C 75 160, 70 145, 55 140 C 40 135, 20 150, 25 170 C 30 190, 60 200, 80 180"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        className="text-accent"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: [0, 1, 0] }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.5
                        }}
                    />
                </svg>
            </div>

            <div className="flex flex-col items-center gap-2">
                <motion.p
                    className="font-heading text-lg font-medium text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Loading Chameleon...
                </motion.p>
                <motion.div
                    className="h-1 w-24 overflow-hidden rounded-full bg-secondary"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 96 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <motion.div
                        className="h-full bg-accent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
