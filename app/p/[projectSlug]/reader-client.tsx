"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sparkles, X, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ViewTracker } from "@/components/view-tracker";
import StatusButton, { ReimagineButton, ToggleButton } from "@/components/ui/button-gen";

// ============================================================================
// ANIMATION PHASE TYPE
// ============================================================================

type AnimationPhase = "idle" | "flipping-out" | "waiting-for-content" | "showing-loader" | "flipping-in" | "complete";

// ============================================================================
// WORD FLIP ANIMATION COMPONENT - LETTER BY LETTER
// Stage 1: Flip out each letter (wave from top-left)
// Stage 2: Show loading spinner
// Stage 3: Flip in each letter (wave from top-left)
// ============================================================================

interface WordFlipDisplayProps {
    originalContent: string;
    reimaginedContent: string;
    pendingContent?: string; // Fallback content from ref when state hasn't propagated yet
    phase: AnimationPhase;
    direction: "forward" | "reverse";
    onPhaseComplete?: (phase: AnimationPhase) => void;
}

function WordFlipDisplay({
    originalContent,
    reimaginedContent,
    pendingContent,
    phase,
    direction,
    onPhaseComplete,
}: WordFlipDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const animationsRef = useRef<Animation[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentDirectionRef = useRef(direction);
    const wrappedSpansRef = useRef<HTMLSpanElement[]>([]);
    
    // Refs to track latest content values for polling
    const reimaginedContentRef = useRef(reimaginedContent);
    const pendingContentRef = useRef(pendingContent);
    const originalContentRef = useRef(originalContent);
    
    // Keep refs updated
    useEffect(() => {
        reimaginedContentRef.current = reimaginedContent;
        pendingContentRef.current = pendingContent;
        originalContentRef.current = originalContent;
    }, [reimaginedContent, pendingContent, originalContent]);

    // Determine from/to content based on direction
    // For forward direction, use pendingContent as fallback if reimaginedContent isn't ready
    const effectiveReimaginedContent = reimaginedContent || pendingContent || "";
    const fromContent = direction === "forward" ? originalContent : effectiveReimaginedContent;

    const [displayContent, setDisplayContent] = useState(fromContent);
    const [showLoader, setShowLoader] = useState(false);
    const [contentVisible, setContentVisible] = useState(true);

    // Track direction changes and reset content accordingly
    useEffect(() => {
        if (currentDirectionRef.current !== direction) {
            currentDirectionRef.current = direction;
            setDisplayContent(fromContent);
        }
    }, [direction, fromContent]);

    // Cleanup function
    const cleanup = useCallback(() => {
        animationsRef.current.forEach(a => a.cancel());
        animationsRef.current = [];
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => cleanup, [cleanup]);

    // Reset when phase goes to idle
    useEffect(() => {
        if (phase === "idle") {
            cleanup();
            setShowLoader(false);
            setContentVisible(true);
            setDisplayContent(fromContent);
            // Force re-render to reset DOM
            if (contentRef.current) {
                wrappedSpansRef.current = [];
            }
        }
    }, [phase, fromContent, cleanup]);

    // Wrap text nodes in spans for letter animation (only text, not code blocks)
    const wrapTextNodes = useCallback((element: HTMLElement): HTMLSpanElement[] => {
        const spans: HTMLSpanElement[] = [];
        
        const processNode = (node: Node) => {
            // Skip code blocks and pre elements - don't animate their content
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const tagName = el.tagName.toLowerCase();
                
                // Skip these elements entirely
                if (tagName === 'pre' || tagName === 'code' || tagName === 'svg' || 
                    el.classList.contains('syntax-highlighter') ||
                    el.closest('pre') || el.closest('code')) {
                    return;
                }
                
                // Process child nodes
                Array.from(node.childNodes).forEach(processNode);
                return;
            }
            
            // Process text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || '';
                if (text.trim().length === 0) return;
                
                // Check if this text node is inside code/pre
                const parent = node.parentNode as HTMLElement;
                if (parent?.closest('pre') || parent?.closest('code')) return;
                
                const fragment = document.createDocumentFragment();
                
                for (const char of text) {
                    if (char === ' ' || char === '\n' || char === '\t') {
                        fragment.appendChild(document.createTextNode(char));
                    } else {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        span.style.transformStyle = 'preserve-3d';
                        fragment.appendChild(span);
                        spans.push(span);
                    }
                }
                
                node.parentNode?.replaceChild(fragment, node);
            }
        };
        
        Array.from(element.childNodes).forEach(processNode);
        return spans;
    }, []);

    // Calculate wave delays from top-left
    const calculateWaveDelays = useCallback((spans: HTMLSpanElement[], container: HTMLElement, maxDuration: number): number[] => {
        if (spans.length === 0) return [];
        
        const containerRect = container.getBoundingClientRect();
        const distances = spans.map(span => {
            const rect = span.getBoundingClientRect();
            const x = rect.left - containerRect.left;
            const y = rect.top - containerRect.top;
            return x * 0.3 + y * 0.8; // Diagonal wave, more vertical bias
        });

        const minDist = Math.min(...distances);
        const maxDist = Math.max(...distances);
        const range = maxDist - minDist || 1;

        return distances.map(dist => ((dist - minDist) / range) * maxDuration);
    }, []);

    // STAGE 1: Flip OUT animation - Letter by letter
    useEffect(() => {
        if (phase !== "flipping-out" || !contentRef.current) return;

        cleanup();
        setShowLoader(false);
        setContentVisible(true);
        setDisplayContent(fromContent);

        const startFlipOut = () => {
            if (!contentRef.current) {
                onPhaseComplete?.("flipping-out");
                return;
            }
            
            const spans = wrapTextNodes(contentRef.current);
            wrappedSpansRef.current = spans;
            
            if (spans.length === 0) {
                // No text to animate, just fade out
                contentRef.current.style.transition = 'opacity 0.3s ease';
                contentRef.current.style.opacity = '0';
                setTimeout(() => {
                    setContentVisible(false);
                    onPhaseComplete?.("flipping-out");
                }, 300);
                return;
            }

            const delays = calculateWaveDelays(spans, contentRef.current!, 500);
            const flipDuration = 120;

            const animations = spans.map((span, i) => {
                span.style.willChange = 'transform, opacity';
                return span.animate(
                    [
                        { transform: 'rotateY(0deg)', opacity: 1 },
                        { transform: 'rotateY(90deg)', opacity: 0 }
                    ],
                    {
                        duration: flipDuration,
                        delay: delays[i],
                        easing: 'cubic-bezier(0.8, 0.2, 1, 0.8)',
                        fill: 'forwards'
                    }
                );
            });

            animationsRef.current = animations;

            const maxDelay = Math.max(...delays, 0);
            timeoutRef.current = setTimeout(() => {
                setContentVisible(false);
                onPhaseComplete?.("flipping-out");
            }, maxDelay + flipDuration + 50);
        };

        // Wait for markdown to render
        requestAnimationFrame(() => {
            requestAnimationFrame(startFlipOut);
        });
    }, [phase, fromContent, wrapTextNodes, calculateWaveDelays, onPhaseComplete, cleanup]);

    // WAITING FOR CONTENT: Show loader while API is fetching
    useEffect(() => {
        if (phase !== "waiting-for-content") return;

        cleanup();
        setContentVisible(false);
        setShowLoader(true);
        // Just wait - parent will trigger next phase when content is ready
    }, [phase, cleanup]);

    // STAGE 2: Show loader (brief transition before flip-in)
    useEffect(() => {
        if (phase !== "showing-loader") return;

        cleanup();
        setContentVisible(false);
        setShowLoader(true);

        // Show loader for 500ms - give React time to propagate content state
        timeoutRef.current = setTimeout(() => {
            setShowLoader(false);
            onPhaseComplete?.("showing-loader");
        }, 500);

    }, [phase, onPhaseComplete, cleanup]);

    // Flip-in animation logic - wrapped in useCallback for stable reference
    const runFlipInAnimation = useCallback((contentToShow: string) => {
        cleanup();
        setShowLoader(false);
        setDisplayContent(contentToShow);
        
        // Keep content hidden initially via CSS opacity on container
        if (contentRef.current) {
            contentRef.current.style.opacity = '0';
        }
        setContentVisible(true); // Make container "visible" but opacity 0
        
        const startFlipIn = () => {
            if (!contentRef.current) {
                setContentVisible(true);
                onPhaseComplete?.("flipping-in");
                return;
            }

            const spans = wrapTextNodes(contentRef.current);
            wrappedSpansRef.current = spans;
            
            if (spans.length === 0) {
                // No text spans, just fade in the whole thing
                contentRef.current.style.transition = 'opacity 0.3s ease';
                contentRef.current.style.opacity = '1';
                setTimeout(() => {
                    onPhaseComplete?.("flipping-in");
                }, 300);
                return;
            }

            // Start all spans in flipped/hidden state BEFORE showing container
            spans.forEach(span => {
                span.style.opacity = '0';
                span.style.transform = 'rotateY(-90deg)';
                span.style.willChange = 'transform, opacity';
            });

            // Force reflow to apply hidden styles
            void contentRef.current.offsetHeight;
            
            // NOW show the container (spans are already hidden)
            contentRef.current.style.opacity = '1';

            const delays = calculateWaveDelays(spans, contentRef.current!, 500);
            const flipDuration = 120;

            // Small delay to ensure styles are applied
            requestAnimationFrame(() => {
                const animations = spans.map((span, i) => {
                    return span.animate(
                        [
                            { transform: 'rotateY(-90deg)', opacity: 0 },
                            { transform: 'rotateY(0deg)', opacity: 1 }
                        ],
                        {
                            duration: flipDuration,
                            delay: delays[i],
                            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                            fill: 'forwards'
                        }
                    );
                });

                animationsRef.current = animations;

                const maxDelay = Math.max(...delays, 0);
                timeoutRef.current = setTimeout(() => {
                    spans.forEach(span => {
                        span.style.willChange = 'auto';
                        span.style.opacity = '1';
                        span.style.transform = 'rotateY(0deg)';
                    });
                    onPhaseComplete?.("flipping-in");
                }, maxDelay + flipDuration + 50);
            });
        };

        // Wait for markdown to render properly (3 frames)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(startFlipIn);
            });
        });
    }, [cleanup, onPhaseComplete, wrapTextNodes, calculateWaveDelays]);

    // STAGE 3: Flip IN animation - Letter by letter
    const flipInStartedRef = useRef(false);
    
    useEffect(() => {
        if (phase !== "flipping-in") {
            // Reset flag when not in flipping-in phase
            flipInStartedRef.current = false;
            return;
        }
        
        // Guard against multiple invocations
        if (flipInStartedRef.current) {
            console.log("Flip-in: already started, skipping");
            return;
        }

        const contentToShow =
          direction === "forward" ? effectiveReimaginedContent : originalContent;

        // If content is not ready yet, wait for it via polling using refs
        if (!contentToShow || contentToShow.trim().length === 0) {
            console.log("Flip-in: content not ready, polling...", { 
                direction, 
                reimaginedContent: reimaginedContent?.length || 0, 
                pendingContent: pendingContent?.length || 0,
                effectiveReimaginedContent: effectiveReimaginedContent?.length || 0
            });
            
            // Poll for content every 50ms for up to 2 seconds using REFS
            let attempts = 0;
            const maxAttempts = 40;
            const pollInterval = setInterval(() => {
                attempts++;
                // Use refs to get latest values
                const currentContent = direction === "forward" 
                    ? (reimaginedContentRef.current || pendingContentRef.current || "")
                    : originalContentRef.current;
                
                console.log(`Flip-in poll attempt ${attempts}:`, {
                    direction,
                    refReimaginedLen: reimaginedContentRef.current?.length || 0,
                    refPendingLen: pendingContentRef.current?.length || 0,
                    currentContentLen: currentContent?.length || 0
                });
                    
                if (currentContent && currentContent.trim().length > 0) {
                    clearInterval(pollInterval);
                    console.log("Flip-in: content arrived after polling, length:", currentContent.length);
                    flipInStartedRef.current = true;  // Mark as started
                    runFlipInAnimation(currentContent);
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    console.error("Flip-in: content never arrived after 2 seconds");
                    onPhaseComplete?.("flipping-in"); // Give up and complete
                }
            }, 50);
            
            timeoutRef.current = pollInterval as unknown as NodeJS.Timeout;
            return;
        }

        console.log("Flip-in: starting immediately with content length:", contentToShow.length);
        flipInStartedRef.current = true;  // Mark as started
        runFlipInAnimation(contentToShow);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, direction, effectiveReimaginedContent, originalContent, runFlipInAnimation, onPhaseComplete]);
    // Note: We intentionally exclude reimaginedContent and pendingContent from deps
    // because we use refs to get their latest values in the polling closure

    // Complete phase - just signal completion
    useEffect(() => {
        if (phase !== "complete") return;
        // Nothing to do, just let parent know we're done
    }, [phase]);

    return (
        <div 
            ref={containerRef} 
            className="relative min-h-[200px]"
            style={{ perspective: "1200px" }}
        >
            {/* Content */}
            <div
                ref={contentRef}
                className="wordflip-content"
                data-phase={phase}
                style={{
                    transformStyle: "preserve-3d",
                    visibility: contentVisible ? "visible" : "hidden",
                }}
            >
                <MarkdownRenderer content={displayContent || "# No content yet."} />
            </div>

            {/* Centered Loading Spinner */}
            <AnimatePresence>
                {showLoader && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                                {direction === "reverse" 
                                    ? "Reverting..." 
                                    : phase === "waiting-for-content" 
                                        ? "AI is reimagining..." 
                                        : "Transforming..."
                                }
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// SIMPLIFICATION LEVELS
// ============================================================================

type SimplificationLevel = "technical" | "standard" | "simplified" | "beginner" | "noob";

const SIMPLIFICATION_LEVELS = [
    { id: "standard" as SimplificationLevel, label: "Standard", description: "Original with minimal changes" },
    { id: "simplified" as SimplificationLevel, label: "Simplified", description: "Clearer language" },
    { id: "beginner" as SimplificationLevel, label: "Beginner", description: "Basic explanations" },
    { id: "noob" as SimplificationLevel, label: "Noob", description: "Maximum simplification" },
];

// ============================================================================
// MAIN READER CLIENT COMPONENT
// ============================================================================

export function ReaderClient({ project, pages, activePage }: { project: any, pages: any[], activePage: any }) {
    // State for AI Content - now persistent across pages
    const [mode, setMode] = useState<"original" | "reimagined">("original");
    // Persistent storage: Map of pageId -> reimagined content
    const [reimaginedContentMap, setReimaginedContentMap] = useState<Record<string, string>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    
    // Simplification level state
    const [simplificationLevel, setSimplificationLevel] = useState<SimplificationLevel>("standard");
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);

    // Current page's reimagined content (derived from map)
    const currentReimaginedContent = reimaginedContentMap[activePage._id] || "";
    const hasReimaginedContent = !!currentReimaginedContent;

    // Animation state management
    const [phase, setPhase] = useState<AnimationPhase>("idle");
    const [animationDirection, setAnimationDirection] = useState<"forward" | "reverse">("forward");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Sidebar State
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    
    // Ref for dropdown click-outside detection
    const levelDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target as Node)) {
                setShowLevelDropdown(false);
            }
        };
        
        if (showLevelDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showLevelDropdown]);

    // Group pages by section
    const groupedPages = pages.reduce((acc: any, page: any) => {
        const section = page.section || "Uncategorized";
        if (!acc[section]) acc[section] = [];
        acc[section].push(page);
        return acc;
    }, {});

    const sections = Object.keys(groupedPages).sort((a, b) =>
        a === "Uncategorized" ? -1 : b === "Uncategorized" ? 1 : a.localeCompare(b)
    );

    // Initialize expanded sections
    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        sections.forEach(s => initialExpanded[s] = true);
        setExpandedSections(initialExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sections.length]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Reset animation state (but keep reimagined content)
    const reset = useCallback(() => {
        setPhase("idle");
        setAnimationDirection("forward");
        setIsAnimating(false);
        setIsLoading(false);
    }, []);

    // Reset mode when changing pages (but keep reimagined content in map)
    useEffect(() => {
        // Check if this page has reimagined content already
        const hasExistingContent = !!reimaginedContentMap[activePage._id];
        setMode(hasExistingContent ? "reimagined" : "original");
        reset();
    }, [activePage._id, reset, reimaginedContentMap]);

    // Ref to track if content is ready (for coordinating with flip-out completion)
    const contentReadyRef = useRef(false);
    const pendingContentRef = useRef<string>("");
    
    // State for pending content - this WILL trigger re-renders unlike the ref
    const [pendingContentState, setPendingContentState] = useState<string>("");

    // Helper to update reimagined content for current page
    const setCurrentReimaginedContent = useCallback((content: string) => {
        setReimaginedContentMap(prev => ({
            ...prev,
            [activePage._id]: content
        }));
    }, [activePage._id]);

    // Phase completion handler - advances through animation phases
    const handlePhaseComplete = useCallback((completedPhase: AnimationPhase) => {
        console.log("Phase complete:", completedPhase, "direction:", animationDirection, "contentReady:", contentReadyRef.current);
        
        switch (completedPhase) {
            case "flipping-out":
                // After flip out, check if content is ready
                if (animationDirection === "reverse") {
                    // For reverse (toggle), content is always ready (it's the original or existing reimagined)
                    setPhase("showing-loader");
                } else if (contentReadyRef.current) {
                    // Content is ready (already set via setPendingContentState and setCurrentReimaginedContent)
                    // Just move to showing-loader
                    setPhase("showing-loader");
                } else {
                    // Content not ready yet, wait for it
                    setPhase("waiting-for-content");
                }
                break;
            case "waiting-for-content":
                // This is triggered when content becomes available
                setPhase("showing-loader");
                break;
            case "showing-loader":
                // After loader, flip in the new content
                setPhase("flipping-in");
                break;
            case "flipping-in":
                // After flip in, mark as complete
                setIsAnimating(false);
                setIsLoading(false);
                contentReadyRef.current = false;
                pendingContentRef.current = "";
                if (animationDirection === "reverse") {
                    // Reverting (toggle to original): go back to original mode
                    setMode("original");
                    setAnimationDirection("forward");
                    setPhase("idle");
                } else {
                    // Forward: stay in reimagined mode, mark complete
                    setMode("reimagined");
                    setPhase("complete");
                }
                break;
            case "complete":
                // Already handled in flipping-in, but keep for safety
                setIsAnimating(false);
                break;
        }
    }, [animationDirection]);

    const handleReimagine = async () => {
        // ALWAYS reimagine the ORIGINAL content (not the current reimagined)
        // Start with flip-out from current view
        const startingMode = mode;
        
        // IMMEDIATELY start the flip-out animation
        setAnimationDirection("forward");
        setIsAnimating(true);
        setIsLoading(true);
        contentReadyRef.current = false;
        pendingContentRef.current = "";
        
        // If we're in reimagined mode, first flip to original then to new reimagined
        if (startingMode === "reimagined") {
            setMode("original");
        }
        setPhase("flipping-out");

        // Fetch API in parallel with flip-out animation
        try {
            const response = await fetch("/api/reimagine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: activePage.content, // Always use ORIGINAL content
                    simplificationLevel: simplificationLevel, // Pass the selected level
                }),
            });

            if (!response.ok) throw new Error("Gemini request failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            if (reader) {
                setIsStreaming(true);
                
                // Collect all the streamed content
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    fullContent += chunk;
                }

                setIsStreaming(false);
                
                // Content is ready - store it in BOTH ref and state
                pendingContentRef.current = fullContent;
                setPendingContentState(fullContent); // This will trigger re-render!
                contentReadyRef.current = true;
                
                // Also set the reimagined content immediately
                setCurrentReimaginedContent(fullContent);
                
                // If we're still waiting for content, trigger the next phase
                setPhase(currentPhase => {
                    if (currentPhase === "waiting-for-content") {
                        return "showing-loader";
                    }
                    // Otherwise, flip-out is still running, it will pick up the content when done
                    return currentPhase;
                });
            }
        } catch (err) {
            console.error(err);
            reset();
            setIsStreaming(false);
            setPendingContentState("");
            alert("Failed to reimagine content. Check your API Key.");
        }
    };

    // Toggle between original and reimagined content (no API call)
    const handleToggle = () => {
        if (!hasReimaginedContent || isAnimating) return;
        
        if (mode === "original") {
            // Switch to reimagined
            setAnimationDirection("forward");
            setIsAnimating(true);
            contentReadyRef.current = true;
            pendingContentRef.current = currentReimaginedContent;
            setPendingContentState(currentReimaginedContent);
            setPhase("flipping-out");
        } else {
            // Switch to original
            setAnimationDirection("reverse");
            setIsAnimating(true);
            setPhase("flipping-out");
        }
    };

    // Theme Application
    const themeClass = `theme-${project.theme?.color || 'indigo'}`;
    const fontClass = project.theme?.font === 'Space Grotesk' ? 'font-tech' :
        project.theme?.font === 'Manrope' ? 'font-modern' :
            project.theme?.font === 'Inter' ? 'font-clean' : 'font-sans';

    return (
        <div className={cn("min-h-screen bg-background text-foreground", themeClass, fontClass)}>
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </Button>
                        {/* Title Icon with Brand Color */}
                        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            {project.name}
                        </span>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">Dashboard</Button>
                    </Link>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden p-8 pt-24 overflow-y-auto"
                    >
                        <h3 className="font-heading text-sm font-semibold text-muted-foreground mb-4">PAGES</h3>
                        <div className="space-y-6">
                            {sections.map(section => (
                                <div key={section}>
                                    {section !== "Uncategorized" && (
                                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{section}</h4>
                                    )}
                                    <ul className="space-y-4">
                                        {groupedPages[section].map((page: any) => (
                                            <Link key={page._id} href={`/p/${project.slug}?page=${page.slug}`} onClick={() => setIsMobileMenuOpen(false)}>
                                                <li className={cn(
                                                    "text-lg transition-colors cursor-pointer",
                                                    page.slug === activePage.slug ? "font-bold text-primary" : "text-muted-foreground"
                                                )}>
                                                    {page.title}
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container relative flex gap-10 py-10">
                {/* Sidebar (Desktop) */}
                <aside className="hidden w-64 shrink-0 lg:block">
                    <div className="sticky top-28 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground">CONTENTS</h3>

                            <div className="space-y-4">
                                {sections.map(section => (
                                    <div key={section} className="space-y-1">
                                        {section !== "Uncategorized" && (
                                            <button
                                                onClick={() => toggleSection(section)}
                                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                                            >
                                                {expandedSections[section] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                {section}
                                            </button>
                                        )}

                                        {(section === "Uncategorized" || expandedSections[section]) && (
                                            <ul className={cn("space-y-1 border-l border-white/10 pl-4", section !== "Uncategorized" && "mt-2")}>
                                                {groupedPages[section].map((page: any) => (
                                                    <Link key={page._id} href={`/p/${project.slug}?page=${page.slug}`}>
                                                        <li className={cn(
                                                            "text-sm transition-colors cursor-pointer py-1 block",
                                                            page.slug === activePage.slug ? "font-medium text-primary border-l-2 border-primary -ml-[17px] pl-[15px]" : "text-muted-foreground hover:text-primary"
                                                        )}>
                                                            {page.title}
                                                        </li>
                                                    </Link>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                            {activePage.title}
                        </h1>

                        {/* Simplification Controls */}
                        <div className="flex items-center gap-3">
                            {/* Simplification Level Dropdown */}
                            <div className="relative" ref={levelDropdownRef}>
                                <button
                                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition-all"
                                    disabled={isAnimating || isLoading || isStreaming}
                                >
                                    <span className="text-muted-foreground">Level:</span>
                                    <span className="font-medium">
                                        {SIMPLIFICATION_LEVELS.find(l => l.id === simplificationLevel)?.label}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {showLevelDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl shadow-xl z-50"
                                        >
                                            <div className="p-2">
                                                {SIMPLIFICATION_LEVELS.map((level) => (
                                                    <button
                                                        key={level.id}
                                                        onClick={() => {
                                                            setSimplificationLevel(level.id);
                                                            setShowLevelDropdown(false);
                                                        }}
                                                        className={`w-full flex flex-col items-start px-3 py-2 rounded-md text-left transition-all ${
                                                            simplificationLevel === level.id
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <span className="font-medium text-sm">{level.label}</span>
                                                        <span className="text-xs text-muted-foreground">{level.description}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Toggle Button - only visible when there's reimagined content */}
                            {hasReimaginedContent && (
                                <ToggleButton
                                    onClick={handleToggle}
                                    mode={mode}
                                    isAnimating={isAnimating}
                                    disabled={isAnimating || isLoading || isStreaming}
                                />
                            )}
                            
                            {/* Reimagine Button - always reimagines from original */}
                            <ReimagineButton
                                onClick={handleReimagine}
                                isLoading={isLoading || isStreaming}
                                disabled={isAnimating || isLoading || isStreaming || !activePage.content}
                            />
                        </div>
                    </div>

                    <GlassCard className="min-h-[400px] p-8 md:p-12 relative overflow-hidden">
                        {/* Show simple content when in original mode with no animation */}
                        {mode === "original" && phase === "idle" && !isAnimating ? (
                            <MarkdownRenderer content={activePage.content || "# No content yet."} />
                        ) : mode === "reimagined" && phase === "idle" && !isAnimating && currentReimaginedContent ? (
                            /* Show reimagined content directly when in reimagined mode with no animation */
                            <div className="relative">
                                {/* Reimagined badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 w-fit"
                                >
                                    <Sparkles className="h-3 w-3 text-purple-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                        Reimagined
                                    </span>
                                </motion.div>
                                <MarkdownRenderer content={currentReimaginedContent} />
                            </div>
                        ) : (
                            /* Show animated content during transitions */
                            <div className="relative">
                                {/* Reimagined badge */}
                                <AnimatePresence>
                                    {(mode === "reimagined" || (isAnimating && animationDirection === "forward")) && phase !== "loading" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="mb-6 flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 w-fit"
                                        >
                                            <motion.div
                                                animate={isAnimating ? {
                                                    rotate: [0, 15, -15, 0],
                                                    scale: [1, 1.2, 1],
                                                } : {}}
                                                transition={{ duration: 0.4, repeat: isAnimating ? Infinity : 0 }}
                                            >
                                                <Sparkles className="h-3 w-3 text-purple-400" />
                                            </motion.div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                                {isAnimating 
                                                    ? (animationDirection === "reverse" ? "Reverting..." : "Transforming...")
                                                    : "Reimagined"
                                                }
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Content Display with Animation */}
                                <WordFlipDisplay
                                    originalContent={activePage.content || "# No content yet."}
                                    reimaginedContent={currentReimaginedContent}
                                    pendingContent={pendingContentState}
                                    phase={phase}
                                    direction={animationDirection}
                                    onPhaseComplete={handlePhaseComplete}
                                />
                            </div>
                        )}
                    </GlassCard>

                    <ViewTracker pageId={activePage._id} />
                </main>
            </div>
        </div>
    );
}