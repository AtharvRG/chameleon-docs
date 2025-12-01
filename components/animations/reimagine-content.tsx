"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { ReimaginePhase } from "@/hooks/use-reimagine-animation";

interface ReimagineContentProps {
    originalContent: string;
    reimaginedContent: string;
    phase: ReimaginePhase;
    mode: "original" | "reimagined";
    onWordCountCalculated?: (count: number) => void;
    className?: string;
}

// Split text content into individual words for animation
function splitTextIntoWords(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
}

// Animated word span component
function AnimatedWord({ 
    word, 
    index, 
    totalWords,
    phase,
}: { 
    word: string; 
    index: number;
    totalWords: number;
    phase: ReimaginePhase;
}) {
    const prefersReducedMotion = useReducedMotion();
    const [scope, animate] = useAnimate();
    const [currentWord, setCurrentWord] = useState(word);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const runAnimation = async () => {
            // Calculate stagger delay based on position
            const staggerDelay = index * 0.008;
            
            if (phase === "vibrating" && !hasAnimated.current) {
                // Vibration effect
                await animate(scope.current, 
                    { x: [0, -2, 2, -2, 2, 0] },
                    { duration: 0.2, delay: staggerDelay * 0.5 }
                );
            }
            
            if (phase === "flipping" && !hasAnimated.current) {
                hasAnimated.current = true;
                
                // Flip out
                await animate(scope.current,
                    { 
                        rotateY: 90, 
                        opacity: 0.3,
                        scale: 0.9,
                    },
                    { 
                        duration: 0.12, 
                        delay: staggerDelay,
                        ease: "easeIn" 
                    }
                );
            }

            if ((phase === "stabilizing" || phase === "complete") && hasAnimated.current) {
                // Flip in with new word
                await animate(scope.current,
                    { 
                        rotateY: 0, 
                        opacity: 1,
                        scale: 1,
                    },
                    { 
                        duration: 0.12, 
                        delay: staggerDelay,
                        ease: "easeOut" 
                    }
                );
            }
        };

        runAnimation();
    }, [phase, index, animate, scope, prefersReducedMotion]);

    // Reset when going back to idle
    useEffect(() => {
        if (phase === "idle") {
            hasAnimated.current = false;
        }
    }, [phase]);

    if (prefersReducedMotion) {
        return <span className="inline">{word} </span>;
    }

    return (
        <motion.span
            ref={scope}
            className="inline-block"
            style={{ 
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            initial={{ rotateY: 0, opacity: 1, scale: 1 }}
        >
            {word}{" "}
        </motion.span>
    );
}

// Text block that animates word by word
function AnimatedTextBlock({
    text,
    phase,
    onWordCount,
}: {
    text: string;
    phase: ReimaginePhase;
    onWordCount?: (count: number) => void;
}) {
    const words = useMemo(() => splitTextIntoWords(text), [text]);
    
    useEffect(() => {
        onWordCount?.(words.length);
    }, [words.length, onWordCount]);

    return (
        <span className="inline">
            {words.map((word, index) => (
                <AnimatedWord
                    key={`${index}-${word}`}
                    word={word}
                    index={index}
                    totalWords={words.length}
                    phase={phase}
                />
            ))}
        </span>
    );
}

// Main Reimagine Content Component with full animation
export function ReimagineContent({
    originalContent,
    reimaginedContent,
    phase,
    mode,
    onWordCountCalculated,
    className,
}: ReimagineContentProps) {
    const prefersReducedMotion = useReducedMotion();
    const [showReimaginedContent, setShowReimaginedContent] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);

    // Calculate word count from content
    useEffect(() => {
        const content = mode === "reimagined" ? reimaginedContent : originalContent;
        const count = splitTextIntoWords(content.replace(/[#*`_\[\]()]/g, " ")).length;
        setWordCount(count);
        onWordCountCalculated?.(count);
    }, [originalContent, reimaginedContent, mode, onWordCountCalculated]);

    // Handle content swap mid-animation
    useEffect(() => {
        if (phase === "flipping") {
            // Swap content midway through the flip
            const swapDelay = 150 + Math.min(wordCount * 4, 800);
            const timer = setTimeout(() => {
                setShowReimaginedContent(true);
            }, swapDelay);
            return () => clearTimeout(timer);
        }
        
        if (phase === "idle") {
            setShowReimaginedContent(false);
        }
    }, [phase, wordCount]);

    // Determine which content to show
    const displayContent = useMemo(() => {
        if (mode === "original") {
            return originalContent;
        }
        return showReimaginedContent ? reimaginedContent : originalContent;
    }, [mode, originalContent, reimaginedContent, showReimaginedContent]);

    // For reduced motion, use simple crossfade
    if (prefersReducedMotion) {
        return (
            <div className={cn("relative", className)}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MarkdownRenderer content={mode === "reimagined" ? reimaginedContent : originalContent} />
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    // Determine animation states for container
    const getContainerAnimation = () => {
        switch (phase) {
            case "vibrating":
                return {
                    x: [0, -2, 2, -2, 2, 0],
                    transition: { duration: 0.2 }
                };
            case "stabilizing":
                return {
                    scale: 1.015,
                    transition: { duration: 0.3, ease: "easeOut" }
                };
            case "complete":
                return {
                    scale: 1,
                    transition: { duration: 0.2, ease: "easeOut" }
                };
            default:
                return {
                    scale: 1,
                    x: 0,
                };
        }
    };

    return (
        <div className={cn("relative", className)} ref={contentRef}>
            {/* Main content with animation wrapper */}
            <motion.div
                animate={getContainerAnimation()}
                className="relative"
            >
                <MarkdownRenderer content={displayContent} />
            </motion.div>

            {/* Glow overlay effect */}
            <AnimatePresence>
                {phase === "complete" && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        initial={{ 
                            boxShadow: "inset 0 0 60px 20px rgba(139, 92, 246, 0.15), 0 0 40px 10px rgba(139, 92, 246, 0.2)",
                            backgroundColor: "rgba(139, 92, 246, 0.03)",
                        }}
                        animate={{ 
                            boxShadow: "inset 0 0 0px 0px rgba(139, 92, 246, 0), 0 0 0px 0px rgba(139, 92, 246, 0)",
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

            {/* Shimmer effect during flipping */}
            <AnimatePresence>
                {phase === "flipping" && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0, 0.5, 0],
                            background: [
                                "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
                                "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)",
                                "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)",
                            ],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: 0.8,
                            repeat: 2,
                            ease: "easeInOut",
                        }}
                        style={{
                            backgroundSize: "200% 100%",
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Enhanced content wrapper with word-level animations
interface WordFlipContentProps {
    content: string;
    phase: ReimaginePhase;
    className?: string;
}

export function WordFlipOverlay({
    originalContent,
    newContent,
    phase,
    className,
}: {
    originalContent: string;
    newContent: string;
    phase: ReimaginePhase;
    className?: string;
}) {
    const prefersReducedMotion = useReducedMotion();
    const [displayedWords, setDisplayedWords] = useState<string[]>([]);
    const originalWords = useMemo(() => splitTextIntoWords(originalContent), [originalContent]);
    const newWords = useMemo(() => splitTextIntoWords(newContent), [newContent]);

    useEffect(() => {
        if (phase === "idle" || phase === "loading") {
            setDisplayedWords(originalWords);
        } else if (phase === "stabilizing" || phase === "complete") {
            setDisplayedWords(newWords);
        }
    }, [phase, originalWords, newWords]);

    // Crossfade for reduced motion
    if (prefersReducedMotion) {
        return (
            <div className={cn("relative overflow-hidden", className)}>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={phase === "complete" ? "new" : "old"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="leading-7 text-muted-foreground text-lg"
                    >
                        {phase === "complete" || phase === "stabilizing" 
                            ? newContent 
                            : originalContent
                        }
                    </motion.p>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <p className="leading-7 text-muted-foreground text-lg">
                {displayedWords.map((word, index) => (
                    <AnimatedWord
                        key={`${index}-${phase}`}
                        word={word}
                        index={index}
                        totalWords={displayedWords.length}
                        phase={phase}
                    />
                ))}
            </p>
        </div>
    );
}
