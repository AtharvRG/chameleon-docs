"use client";

import { useState, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export type ReimaginePhase = 
    | "idle"           // Initial state, no animation
    | "loading"        // API call in progress
    | "vibrating"      // Initial vibration effect (0.2s)
    | "flipping"       // Word-flip cascade
    | "stabilizing"    // Scale settle effect
    | "complete";      // Final state with glow

interface UseReimagineAnimationOptions {
    onPhaseChange?: (phase: ReimaginePhase) => void;
    vibrationDuration?: number;
    flipDuration?: number;
    stabilizationDuration?: number;
    glowDuration?: number;
}

interface UseReimagineAnimationReturn {
    phase: ReimaginePhase;
    isAnimating: boolean;
    isLoading: boolean;
    startLoading: () => void;
    triggerAnimation: (wordCount: number) => Promise<void>;
    reset: () => void;
}

export function useReimagineAnimation(
    options: UseReimagineAnimationOptions = {}
): UseReimagineAnimationReturn {
    const {
        onPhaseChange,
        vibrationDuration = 200,
        flipDuration = 15, // per word, in ms
        stabilizationDuration = 300,
        glowDuration = 1500,
    } = options;

    const prefersReducedMotion = useReducedMotion();
    const [phase, setPhase] = useState<ReimaginePhase>("idle");
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updatePhase = useCallback((newPhase: ReimaginePhase) => {
        setPhase(newPhase);
        onPhaseChange?.(newPhase);
    }, [onPhaseChange]);

    const clearTimeouts = useCallback(() => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
            animationTimeoutRef.current = null;
        }
    }, []);

    const startLoading = useCallback(() => {
        clearTimeouts();
        updatePhase("loading");
    }, [clearTimeouts, updatePhase]);

    const triggerAnimation = useCallback(async (wordCount: number): Promise<void> => {
        clearTimeouts();

        // For reduced motion, skip directly to complete
        if (prefersReducedMotion) {
            updatePhase("complete");
            return new Promise((resolve) => {
                animationTimeoutRef.current = setTimeout(() => {
                    resolve();
                }, 300);
            });
        }

        return new Promise((resolve) => {
            // Phase 1: Vibration
            updatePhase("vibrating");

            animationTimeoutRef.current = setTimeout(() => {
                // Phase 2: Flipping cascade
                updatePhase("flipping");

                // Calculate flip duration based on word count
                const totalFlipTime = Math.min(wordCount * flipDuration, 2000); // Cap at 2 seconds

                animationTimeoutRef.current = setTimeout(() => {
                    // Phase 3: Stabilization
                    updatePhase("stabilizing");

                    animationTimeoutRef.current = setTimeout(() => {
                        // Phase 4: Complete with glow
                        updatePhase("complete");

                        // After glow, we stay in complete state
                        animationTimeoutRef.current = setTimeout(() => {
                            resolve();
                        }, glowDuration);
                    }, stabilizationDuration);
                }, totalFlipTime);
            }, vibrationDuration);
        });
    }, [
        clearTimeouts, 
        updatePhase, 
        prefersReducedMotion, 
        vibrationDuration, 
        flipDuration, 
        stabilizationDuration, 
        glowDuration
    ]);

    const reset = useCallback(() => {
        clearTimeouts();
        updatePhase("idle");
    }, [clearTimeouts, updatePhase]);

    return {
        phase,
        isAnimating: phase !== "idle" && phase !== "complete",
        isLoading: phase === "loading",
        startLoading,
        triggerAnimation,
        reset,
    };
}
