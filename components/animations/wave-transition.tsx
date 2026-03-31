"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

export type WavePhase = "idle" | "fade-out" | "loading" | "fade-in";

interface WaveTransitionProps {
    phase: WavePhase;
    showLoader?: boolean;
    onPhaseComplete?: (phase: WavePhase) => void;
    children: React.ReactNode;
    className?: string;
}

export function WaveTransition({ 
    phase, 
    showLoader = false, 
    onPhaseComplete, 
    children, 
    className 
}: WaveTransitionProps) {
    const [contentVisible, setContentVisible] = useState(true);
    const [loaderVisible, setLoaderVisible] = useState(false);
    const [animationMode, setAnimationMode] = useState<"out" | "in">("out");
    
    // Motion value: 0 = start, 100 = end of animation
    const waveProgress = useMotionValue(0);
    
    // Transform progress into gradient for diagonal wipe
    // 135deg means: 0% is top-left corner, 100% is bottom-right corner
    const maskImage = useTransform(waveProgress, (value) => {
        if (animationMode === "out") {
            // FADE OUT: Transparency spreads from top-left to bottom-right
            // As value increases, the transparent zone grows from top-left
            if (value <= 0) {
                return 'none'; // Fully visible
            }
            if (value >= 100) {
                return 'linear-gradient(135deg, transparent 0%, transparent 100%)'; // Fully hidden
            }
            // Wipe: transparent takes over from top-left
            // At value=0: all black (visible)
            // At value=100: all transparent (hidden)
            const transitionPoint = value;
            const softEdge = 15; // Width of the gradient transition edge
            return `linear-gradient(135deg, transparent ${transitionPoint - softEdge}%, black ${transitionPoint + softEdge}%, black 100%)`;
        } else {
            // FADE IN: Black (visible) spreads from top-left to bottom-right
            // As value increases, the visible zone grows from top-left
            if (value <= 0) {
                return 'linear-gradient(135deg, transparent 0%, transparent 100%)'; // Fully hidden
            }
            if (value >= 100) {
                return 'none'; // Fully visible
            }
            // Wipe: black takes over from top-left
            const transitionPoint = value;
            const softEdge = 15;
            return `linear-gradient(135deg, black 0%, black ${transitionPoint - softEdge}%, transparent ${transitionPoint + softEdge}%)`;
        }
    });

    useEffect(() => {
        if (phase === "idle") {
            setAnimationMode("out");
            waveProgress.set(0);
            setContentVisible(true);
            setLoaderVisible(false);
            return;
        }

        if (phase === "fade-out") {
            setAnimationMode("out");
            waveProgress.set(0);
            setContentVisible(true);
            
            // Animate from 0 to 100 (wipe out from top-left to bottom-right)
            const controls = animate(waveProgress, 100, {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                onComplete: () => {
                    setContentVisible(false);
                    onPhaseComplete?.("fade-out");
                }
            });

            return () => controls.stop();
        }

        if (phase === "loading") {
            setContentVisible(false);
            setLoaderVisible(true);
        }

        if (phase === "fade-in") {
            setLoaderVisible(false);
            setAnimationMode("in");
            // Set progress to 0 FIRST — this means the mask is fully transparent
            // so even when we make content "visible", nothing shows yet
            waveProgress.set(0);
            setContentVisible(true);
            
            // Wait two frames to ensure the mask is painted before animating
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Now animate from 0 to 100 (wipe in from top-left to bottom-right)
                    const controls = animate(waveProgress, 100, {
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                        onComplete: () => {
                            waveProgress.set(0);
                            setAnimationMode("out");
                            onPhaseComplete?.("fade-in");
                        }
                    });
                });
            });
        }
    }, [phase, onPhaseComplete, waveProgress]);

    return (
        <div className={`relative ${className || ""}`}>
            {/* Content with smooth wave animation */}
            <motion.div 
                style={{
                    maskImage,
                    WebkitMaskImage: maskImage,
                    visibility: contentVisible ? "visible" : "hidden",
                    willChange: "mask-image",
                    transform: "translateZ(0)",
                }}
            >
                {children}
            </motion.div>

            {/* Centered Loader */}
            <AnimatePresence>
                {loaderVisible && showLoader && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium animate-pulse">
                                Reimagining...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
