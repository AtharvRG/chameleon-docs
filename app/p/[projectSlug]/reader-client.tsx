"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X, ChevronRight, LayoutDashboard, RefreshCw, Sparkles, ChevronDown, Check, Clock, Star } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useReimagineEngine } from "@/hooks/use-reimagine-engine";
import { usePreferenceEngine } from "@/hooks/use-preference-engine";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChameleonLogo } from "@/components/ChameleonLogo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WaveTransition, WavePhase } from "@/components/animations/wave-transition";

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

interface ReimaginationVersion {
    id: string;
    mode: string;
    content: string;
    createdAt: number;
    label: string;
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

    const sidebarNavRef = useRef<HTMLElement>(null);
    useSmoothScroll(sidebarNavRef);

    const { enqueue, cancelForPage } = useReimagineEngine();
    const { profile, setPreferredMode, setPreferredView, clearPreferredView } = usePreferenceEngine(project.slug);

    const [reimagineMode, setReimagineMode] = useState(profile.preferredReimagineMode);
    const [reimaginationHistory, setReimaginationHistory] = useState<ReimaginationVersion[]>([]);
    const [currentReimaginedContent, setCurrentReimaginedContent] = useState<string | null>(null);
    const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"original" | "reimagined">("original");
    const [wavePhase, setWavePhase] = useState<WavePhase>("idle");
    const [isReimagining, setIsReimagining] = useState(false);
    const [pendingContent, setPendingContent] = useState<string | null>(null);
    const [pendingViewMode, setPendingViewMode] = useState<"original" | "reimagined" | null>(null);
    const [showLoader, setShowLoader] = useState(false);

    const getHistoryKey = useCallback(() => 
        `chameleon-history-${project.slug}-${activePage.slug}`, 
        [project.slug, activePage.slug]
    );

    const loadReimaginationHistory = useCallback(() => {
        const key = getHistoryKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const history: ReimaginationVersion[] = JSON.parse(saved);
                setReimaginationHistory(history);
                if (history.length > 0) {
                    const latest = history[history.length - 1];
                    setCurrentReimaginedContent(latest.content);
                    setActiveVersionId(latest.id);
                }
            } catch (e) {
                console.error("Failed to parse reimagination history", e);
                setReimaginationHistory([]);
                setCurrentReimaginedContent(null);
                setActiveVersionId(null);
            }
        } else {
            setReimaginationHistory([]);
            setCurrentReimaginedContent(null);
            setActiveVersionId(null);
        }
    }, [getHistoryKey]);

    const applyViewPreference = useCallback(() => {
        if (profile.preferredView === "reimagined" && currentReimaginedContent) {
            setViewMode("reimagined");
        } else {
            setViewMode("original");
        }
    }, [profile.preferredView, currentReimaginedContent]);

    useEffect(() => {
        loadReimaginationHistory();
    }, [loadReimaginationHistory]);

    useEffect(() => {
        applyViewPreference();
    }, [applyViewPreference]);

    useEffect(() => {
        setReimagineMode(profile.preferredReimagineMode);
    }, [profile.preferredReimagineMode]);

    useEffect(() => {
        return () => {
            cancelForPage(project.slug, activePage.slug);
        };
    }, [project.slug, activePage.slug, cancelForPage]);

    useEffect(() => {
        setWavePhase("idle");
    }, [activePage.slug]);

    const handlePhaseComplete = (completedPhase: WavePhase) => {
        if (completedPhase === "fade-out") {
            if (showLoader) {
                setWavePhase("loading");
            } else {
                if (pendingContent !== null) {
                    setCurrentReimaginedContent(pendingContent);
                    setPendingContent(null);
                }
                if (pendingViewMode !== null) {
                    setViewMode(pendingViewMode);
                    setPendingViewMode(null);
                }
                setWavePhase("fade-in");
            }
        } else if (completedPhase === "fade-in") {
            setWavePhase("idle");
            setIsReimagining(false);
            setShowLoader(false);
        }
    };

    const handleReimagine = async (mode: string = reimagineMode) => {
        if (isReimagining) return;
        
        setIsReimagining(true);
        setShowLoader(true);
        setWavePhase("fade-out");

        try {
            // enqueue now uses cache internally - cache hits resolve immediately
            const newContent = await enqueue(
                project.slug,
                activePage.slug,
                activePage.content,
                mode
            );

            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const modeLabel = REIMAGINE_MODES.find(m => m.id === mode)?.label || mode;

            const newVersion: ReimaginationVersion = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                mode,
                content: newContent,
                createdAt: Date.now(),
                label: `Reimagined – ${modeLabel} – ${timeString}`,
            };

            const updatedHistory = [...reimaginationHistory, newVersion];
            setReimaginationHistory(updatedHistory);
            
            const historyKey = getHistoryKey();
            localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

            setCurrentReimaginedContent(newContent);
            setActiveVersionId(newVersion.id);
            setViewMode("reimagined");
            
            setWavePhase("fade-in");

        } catch (error) {
            console.error("Reimagine Engine Error:", error);
            setWavePhase("idle");
            setIsReimagining(false);
            setShowLoader(false);
        }
    };

    const handleModeChange = (mode: string) => {
        setReimagineMode(mode);
        setPreferredMode(mode);
    };

    const handleSetPreferredView = () => {
        setPreferredView(viewMode);
    };

    const handleClearPreferredView = () => {
        clearPreferredView();
    };

    const switchToVersion = (versionId: string) => {
        if (isReimagining) return;
        
        const version = reimaginationHistory.find(v => v.id === versionId);
        if (!version) return;

        setIsReimagining(true);
        setShowLoader(false);
        setPendingContent(version.content);
        setPendingViewMode("reimagined");
        setActiveVersionId(versionId);
        setWavePhase("fade-out");
    };

    const switchToOriginal = () => {
        if (isReimagining || viewMode === "original") return;
        
        setIsReimagining(true);
        setShowLoader(false);
        setPendingViewMode("original");
        setActiveVersionId(null);
        setWavePhase("fade-out");
    };

    const displayContent = viewMode === "reimagined" && currentReimaginedContent 
        ? currentReimaginedContent 
        : activePage.content;

    const hasVersions = reimaginationHistory.length > 0;
    const isViewPreferred = profile.preferredView === viewMode;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col" data-lenis-prevent>
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

                    <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain">
                        {(() => {
                            const groupedPages = pages.reduce((acc: any, page: any) => {
                                const section = page.section || "Uncategorized";
                                if (!acc[section]) acc[section] = [];
                                acc[section].push(page);
                                return acc;
                            }, {});
                            
                            const availableSections = Object.keys(groupedPages);
                            const storedOrder = project.sectionOrder || [];
                            const orderedFromStorage = storedOrder.filter((s: string) => availableSections.includes(s));
                            const newSections = availableSections.filter(s => !storedOrder.includes(s) && s !== "Uncategorized");
                            const sections = ["Uncategorized", ...orderedFromStorage, ...newSections.sort()].filter(s => availableSections.includes(s));
                            
                            return sections.map(section => (
                                <div key={section} className={section !== "Uncategorized" ? "pt-4" : ""}>
                                    {section !== "Uncategorized" && (
                                        <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 mb-2 border-l-2 border-primary/60">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                                                {section}
                                            </span>
                                        </div>
                                    )}
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

            <main className="flex-1 lg:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-md border-b border-border">
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
                        {hasVersions && !isReimagining && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2"
                                        disabled={wavePhase !== "idle"}
                                    >
                                        <Clock className="h-4 w-4" />
                                        {viewMode === "original" ? "Original" : reimaginationHistory.find(v => v.id === activeVersionId)?.label || "Version"}
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuItem 
                                        onClick={switchToOriginal}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <div className="flex-1 text-sm font-medium">Original</div>
                                        {viewMode === "original" && <Check className="h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {reimaginationHistory.slice().reverse().map((version) => (
                                        <DropdownMenuItem 
                                            key={version.id}
                                            onClick={() => {
                                                if (activeVersionId !== version.id) {
                                                    switchToVersion(version.id);
                                                }
                                            }}
                                            className="gap-2 cursor-pointer"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{version.label}</div>
                                            </div>
                                            {activeVersionId === version.id && viewMode === "reimagined" && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

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
                                            onClick={() => handleModeChange(mode.id)}
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

                <div className="container max-w-4xl py-12 lg:py-16 relative">
                    <div className="mb-8">
                        <h1 className="font-heading text-4xl font-bold tracking-tight lg:text-5xl">
                            {activePage.title}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Last updated {activePage.updatedAt ? new Date(activePage.updatedAt).toLocaleDateString() : "Recently"}
                        </p>
                    </div>

                    {viewMode === "reimagined" && currentReimaginedContent && !isViewPreferred && wavePhase === "idle" && (
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-primary" />
                                <span className="text-foreground/90">
                                    Viewing AI-reimagined content
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleSetPreferredView}
                                className="gap-2 border-primary/30 hover:bg-primary/10"
                            >
                                <Star className="h-3.5 w-3.5" />
                                Save as my preferred view
                            </Button>
                        </div>
                    )}

                    {profile.preferredView && wavePhase === "idle" && (
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="h-3.5 w-3.5" />
                                <span>
                                    Your preferred view: <strong className="text-foreground">{profile.preferredView === "reimagined" ? "Reimagined" : "Original"}</strong>
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={handleClearPreferredView}
                                className="h-7 text-xs"
                            >
                                Clear preference
                            </Button>
                        </div>
                    )}

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