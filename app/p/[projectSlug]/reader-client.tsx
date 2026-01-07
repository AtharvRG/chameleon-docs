"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Home, LayoutDashboard, Wand2, RefreshCw, RotateCcw, Sparkles, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePuterAI } from "@/hooks/use-puter-ai";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChameleonLogo } from "@/components/ChameleonLogo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WaveTransition, WavePhase } from "@/components/animations/wave-transition";

// Custom smooth scroll hook for sidebar
function useSmoothScroll(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let targetScroll = element.scrollTop;
        let currentScroll = element.scrollTop;
        let animationId: number | null = null;
        const ease = 0.12;

        const animate = () => {
            const diff = targetScroll - currentScroll;
            
            if (Math.abs(diff) > 0.5) {
                currentScroll += diff * ease;
                element.scrollTop = currentScroll;
                animationId = requestAnimationFrame(animate);
            } else {
                currentScroll = targetScroll;
                element.scrollTop = targetScroll;
                animationId = null;
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const maxScroll = element.scrollHeight - element.clientHeight;
            targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY));
            if (!animationId) {
                animationId = requestAnimationFrame(animate);
            }
        };

        const handleScroll = () => {
            if (!animationId) {
                targetScroll = element.scrollTop;
                currentScroll = element.scrollTop;
            }
        };

        element.addEventListener('wheel', handleWheel, { passive: false });
        element.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            element.removeEventListener('wheel', handleWheel);
            element.removeEventListener('scroll', handleScroll);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [ref]);
}

// Hook for managing reimagine mode preference
function useReimagineMode() {
    const STORAGE_KEY = "chameleon:user:reimagineMode";
    const DEFAULT_MODE = "standard";

    const [mode, setModeState] = useState(DEFAULT_MODE);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setModeState(saved);
        }
    }, []);

    const setMode = useCallback((newMode: string) => {
        setModeState(newMode);
        localStorage.setItem(STORAGE_KEY, newMode);
    }, []);

    return [mode, setMode] as const;
}


interface ReaderClientProps {
    project: any;
    pages: any[];
    activePage: any;
}

const REIMAGINE_MODES = [
    { id: "technical", label: "Technical" },
    { id: "standard", label: "Standard" },
    { id: "simplified", label: "Simplified" },
    { id: "beginner", label: "Beginner" },
    { id: "noob", label: "Like I'm 5" },
];

export function ReaderClient({ project, pages, activePage }: ReaderClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const searchParams = useSearchParams();
    const currentPageSlug = searchParams.get("page") || pages[0]?.slug;

    // Sidebar scroll ref
    const sidebarNavRef = useRef<HTMLElement>(null);
    useSmoothScroll(sidebarNavRef);

    // Reimagine State
    const [reimagineMode, setReimagineMode] = useReimagineMode();
    const [storedReimaginedContent, setStoredReimaginedContent] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"original" | "reimagined">("original");
    const [wavePhase, setWavePhase] = useState<WavePhase>("idle");
    const [isReimagining, setIsReimagining] = useState(false);
    const [pendingContent, setPendingContent] = useState<string | null>(null);
    const [pendingViewMode, setPendingViewMode] = useState<"original" | "reimagined" | null>(null);
    const [showLoader, setShowLoader] = useState(false);


    // Load persisted content
    useEffect(() => {
        const key = `reimagined-${project.slug}-${activePage.slug}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            setStoredReimaginedContent(saved);
            setViewMode("original"); 
            setWavePhase("idle");
        } else {
            setStoredReimaginedContent(null);
            setViewMode("original");
            setWavePhase("idle");
        }
    }, [project.slug, activePage.slug]);

    // Handle wave phase completion
    const handlePhaseComplete = (completedPhase: WavePhase) => {
        if (completedPhase === "fade-out") {
            // Fade out is complete - now either show loader or swap content
            if (showLoader) {
                // Reimagine flow: show loader while waiting for content
                setWavePhase("loading");
            } else {
                // Toggle flow: swap content immediately and fade in
                if (pendingContent !== null) {
                    setStoredReimaginedContent(pendingContent);
                    localStorage.setItem(`reimagined-${project.slug}-${activePage.slug}`, pendingContent);
                    setPendingContent(null);
                }
                if (pendingViewMode !== null) {
                    setViewMode(pendingViewMode);
                    setPendingViewMode(null);
                }
                setWavePhase("fade-in");
            }
        } else if (completedPhase === "fade-in") {
            // Animation complete - reset state
            setWavePhase("idle");
            setIsReimagining(false);
            setShowLoader(false);
        }
    };

    // PuterJS AI hook for reimagination
    const { reimagine: puterReimagine } = usePuterAI();

    const handleReimagine = async (mode: string = reimagineMode) => {
        if (isReimagining) return;
        
        setIsReimagining(true);
        setShowLoader(true); // Show loader for Reimagine
        setWavePhase("fade-out"); // Start fade out

        try {
            // Use PuterJS for AI reimagination (client-side)
            const newContent = await puterReimagine(activePage.content, mode);

            // Store content and swap - content is hidden because we're in "loading" phase
            setStoredReimaginedContent(newContent);
            localStorage.setItem(`reimagined-${project.slug}-${activePage.slug}`, newContent);
            setViewMode("reimagined");
            
            // Now fade in the new content
            setWavePhase("fade-in");

        } catch (error) {
            console.error("PuterJS AI Error:", error);
            setWavePhase("idle");
            setIsReimagining(false);
            setShowLoader(false);
        }
    };

    const toggleView = () => {
        if (isReimagining) return;
        
        setIsReimagining(true);
        setShowLoader(false); // No loader for toggle
        
        // Set pending view mode for when fade-out completes
        setPendingViewMode(viewMode === "reimagined" ? "original" : "reimagined");
        
        // Start fade out
        setWavePhase("fade-out");
    };

    const displayContent = viewMode === "reimagined" && storedReimaginedContent 
        ? storedReimaginedContent 
        : activePage.content;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col" data-lenis-prevent>
                    {/* Sidebar Header */}
                    <div className="flex h-16 items-center justify-between border-b border-border px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <ChameleonLogo size={24} />
                            <span className="font-heading font-bold text-lg">Chameleon</span>
                        </Link>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Project Info */}
                    <div className="border-b border-border p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div 
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card shadow-sm text-xl"
                                style={{
                                    background: project.theme?.color ? `linear-gradient(135deg, ${project.theme.color}, ${project.theme.color}88)` : undefined
                                }}
                            >
                                {project.emoji || "📚"}
                            </div>
                            <div>
                                <h2 className="font-heading font-bold leading-tight">{project.name}</h2>
                                <p className="text-xs text-muted-foreground">Documentation</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain">
                        {(() => {
                            // Group pages by section
                            const groupedPages = pages.reduce((acc: any, page: any) => {
                                const section = page.section || "Uncategorized";
                                if (!acc[section]) acc[section] = [];
                                acc[section].push(page);
                                return acc;
                            }, {});
                            
                            // Sort sections - use project sectionOrder if available
                            const availableSections = Object.keys(groupedPages);
                            const storedOrder = project.sectionOrder || [];
                            const orderedFromStorage = storedOrder.filter((s: string) => availableSections.includes(s));
                            const newSections = availableSections.filter(s => !storedOrder.includes(s) && s !== "Uncategorized");
                            const sections = ["Uncategorized", ...orderedFromStorage, ...newSections.sort()].filter(s => availableSections.includes(s));
                            
                            return sections.map(section => (
                                <div key={section} className={section !== "Uncategorized" ? "pt-4" : ""}>
                                    {/* Section Header - only show for non-Uncategorized */}
                                    {section !== "Uncategorized" && (
                                        <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 mb-2 border-l-2 border-primary/60">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                                                {section}
                                            </span>
                                        </div>
                                    )}
                                    {/* Pages in this section */}
                                    <div className={cn("space-y-0.5", section !== "Uncategorized" && "ml-1")}>
                                        {groupedPages[section].map((page: any) => {
                                            const isActive = currentPageSlug === page.slug;
                                            return (
                                                <Link 
                                                    key={page._id} 
                                                    href={`/p/${project.slug}?page=${page.slug}`}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                >
                                                    <div className={cn(
                                                        "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all",
                                                        isActive 
                                                            ? "bg-primary/15 text-primary font-medium" 
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-normal"
                                                    )}>
                                                        <span>{page.title}</span>
                                                        {isActive && <ChevronRight className="h-4 w-4 text-primary/60" />}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ));
                        })()}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="border-t border-border p-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72">
                {/* Header with Reimagine Controls */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="font-heading font-bold lg:hidden">{project.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Toggle Button (Original <-> Reimagined) */}
                        {storedReimaginedContent && !isReimagining ? (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={toggleView}
                                disabled={wavePhase !== "idle"}
                                className="gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {viewMode === "reimagined" ? "Original" : "Show Reimagined"}
                            </Button>
                        ) : null}

                        {/* Reimagine Controls */}
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 gap-2 text-xs font-medium hover:bg-background/50"
                                        disabled={isReimagining}
                                    >
                                        {REIMAGINE_MODES.find(m => m.id === reimagineMode)?.label}
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    {REIMAGINE_MODES.map((mode) => (
                                        <DropdownMenuItem 
                                            key={mode.id}
                                            onClick={() => setReimagineMode(mode.id)}
                                            className="gap-2 cursor-pointer text-xs"
                                        >
                                            {mode.label}
                                            {reimagineMode === mode.id && <Check className="h-3 w-3 ml-auto" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="w-px h-4 bg-border mx-1" />

                            <Button 
                                size="sm"
                                onClick={() => handleReimagine()}
                                disabled={isReimagining}
                                className={cn(
                                    "h-8 px-3 gap-2 transition-all",
                                    isReimagining && "animate-pulse"
                                )}
                            >
                                {isReimagining ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                )}
                                Reimagine
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="container max-w-4xl py-12 lg:py-16 relative">
                    <div className="mb-8">
                        <h1 className="font-heading text-4xl font-bold tracking-tight lg:text-5xl">
                            {activePage.title}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Last updated {activePage.updatedAt ? new Date(activePage.updatedAt).toLocaleDateString() : "Recently"}
                        </p>
                    </div>

                    {/* Wave Transition Animation */}
                    <WaveTransition 
                        phase={wavePhase} 
                        showLoader={showLoader}
                        onPhaseComplete={handlePhaseComplete}
                    >
                        <MarkdownRenderer 
                            content={displayContent} 
                        />
                    </WaveTransition>
                </div>
            </main>
        </div>
    );
}