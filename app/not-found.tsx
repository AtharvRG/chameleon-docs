"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground">
            {/* Abstract Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-[800px] w-[800px] rounded-full bg-accent/5 blur-[150px] animate-pulse" />
            </div>

            {/* Grain Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            <div className="relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="font-heading text-[12rem] font-bold leading-none tracking-tighter text-foreground/5 select-none">
                        404
                    </h1>
                    <div className="-mt-20 space-y-6">
                        <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                            Lost in the void.
                        </h2>
                        <p className="mx-auto max-w-md text-lg text-muted-foreground">
                            The page you are looking for has drifted away into the digital abyss.
                        </p>

                        <div className="flex justify-center pt-8">
                            <Link href="/dashboard">
                                <MagneticButton size="lg" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Return Home
                                </MagneticButton>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}