"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion, stagger, useAnimate, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation state types
export type AnimationPhase = "idle" | "loading" | "vibrating" | "flipping" | "stabilizing" | "complete";

interface WordFlipAnimationProps {
    originalContent: string;
    newContent: string;
    phase: AnimationPhase;
    onAnimationComplete?: () => void;
    className?: string;
}

interface WordData {
    word: string;
    index: number;
    key: string;
}

// Helper to split text into words while preserving structure
function splitIntoWords(text: string): WordData[] {
    const words: WordData[] = [];
    // Split by whitespace but preserve the structure
    const parts = text.split(/(\s+)/);
    let wordIndex = 0;
    
    parts.forEach((part, i) => {
        if (part.trim()) {
            words.push({
                word: part,
                index: wordIndex++,
                key: `word-${i}-${part.slice(0, 10)}`,
            });
        } else if (part) {
            // Preserve whitespace as-is
            words.push({
                word: part,
                index: -1, // Mark as whitespace
                key: `space-${i}`,
            });
        }
    });
    
    return words;
}

// Animation variants for the word flip
const wordVariants = {
    initial: {
        rotateY: 0,
        opacity: 1,
        scale: 1,
    },
    vibrate: {
        x: [0, -2, 2, -2, 2, 0],
        transition: {
            duration: 0.2,
            ease: "easeInOut",
        },
    },
    flipOut: {
        rotateY: 90,
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.15,
            ease: "easeIn",
        },
    },
    flipIn: {
        rotateY: 0,
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.15,
            ease: "easeOut",
        },
    },
};

// Container variants for stagger effect
const containerVariants = {
    vibrate: {
        transition: {
            staggerChildren: 0.002,
        },
    },
    flipOut: {
        transition: {
            staggerChildren: 0.008,
            staggerDirection: 1,
        },
    },
    flipIn: {
        transition: {
            staggerChildren: 0.008,
            staggerDirection: 1,
        },
    },
};

// Single Word Component
function AnimatedWord({ 
    word, 
    index, 
    phase,
    isWhitespace,
    style,
}: { 
    word: string; 
    index: number; 
    phase: AnimationPhase;
    isWhitespace: boolean;
    style?: React.CSSProperties;
}) {
    const prefersReducedMotion = useReducedMotion();
    
    if (isWhitespace) {
        return <span>{word}</span>;
    }

    // For reduced motion, just show the word without animation
    if (prefersReducedMotion) {
        return <span className="inline-block">{word}</span>;
    }

    const getAnimateState = () => {
        switch (phase) {
            case "vibrating":
                return "vibrate";
            case "flipping":
                return "flipOut";
            case "stabilizing":
            case "complete":
                return "flipIn";
            default:
                return "initial";
        }
    };

    return (
        <motion.span
            className="inline-block origin-center"
            style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d",
                ...style,
            }}
            variants={wordVariants}
            initial="initial"
            animate={getAnimateState()}
            custom={index}
        >
            {word}
        </motion.span>
    );
}

// Main WordFlipAnimation Component
export function WordFlipAnimation({
    originalContent,
    newContent,
    phase,
    onAnimationComplete,
    className,
}: WordFlipAnimationProps) {
    const prefersReducedMotion = useReducedMotion();
    const [displayContent, setDisplayContent] = useState(originalContent);
    const [internalPhase, setInternalPhase] = useState<"showing-old" | "showing-new">("showing-old");

    // Parse content into words
    const words = useMemo(() => splitIntoWords(displayContent), [displayContent]);

    // Handle phase transitions
    useEffect(() => {
        if (phase === "flipping" && internalPhase === "showing-old") {
            // Midway through flip, swap content
            const timer = setTimeout(() => {
                setDisplayContent(newContent);
                setInternalPhase("showing-new");
            }, 150 + (words.filter(w => w.index >= 0).length * 8)); // Wait for flip-out to complete
            
            return () => clearTimeout(timer);
        }
        
        if (phase === "idle") {
            setInternalPhase("showing-old");
            setDisplayContent(originalContent);
        }
    }, [phase, internalPhase, newContent, originalContent, words]);

    // Trigger completion callback
    useEffect(() => {
        if (phase === "complete" && onAnimationComplete) {
            const timer = setTimeout(onAnimationComplete, 100);
            return () => clearTimeout(timer);
        }
    }, [phase, onAnimationComplete]);

    // For reduced motion, just show content with a simple fade
    if (prefersReducedMotion) {
        return (
            <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase === "complete" || phase === "stabilizing" ? "new" : "old"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {phase === "complete" || phase === "stabilizing" ? newContent : originalContent}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={cn("relative", className)}
            variants={containerVariants}
            animate={phase === "vibrating" ? "vibrate" : phase === "flipping" ? "flipOut" : "flipIn"}
        >
            {words.map((wordData) => (
                <AnimatedWord
                    key={wordData.key}
                    word={wordData.word}
                    index={wordData.index}
                    phase={phase}
                    isWhitespace={wordData.index === -1}
                />
            ))}
        </motion.div>
    );
}

// Stabilization wrapper for the final "rebirth" effect
interface StabilizationWrapperProps {
    children: React.ReactNode;
    isStabilizing: boolean;
    isComplete: boolean;
    className?: string;
}

export function StabilizationWrapper({
    children,
    isStabilizing,
    isComplete,
    className,
}: StabilizationWrapperProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className={cn("relative", className)}
            initial={{ scale: 1 }}
            animate={{
                scale: isStabilizing ? 1.02 : 1,
            }}
            transition={{
                duration: 0.3,
                ease: "easeOut",
            }}
        >
            {children}
            
            {/* Glow highlight effect */}
            <AnimatePresence>
                {isComplete && !prefersReducedMotion && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        initial={{ 
                            boxShadow: "0 0 40px 10px rgba(139, 92, 246, 0.3)",
                            backgroundColor: "rgba(139, 92, 246, 0.05)",
                        }}
                        animate={{ 
                            boxShadow: "0 0 0px 0px rgba(139, 92, 246, 0)",
                            backgroundColor: "rgba(139, 92, 246, 0)",
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: 1.5,
                            ease: "easeOut",
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
