"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X, ChevronRight, LayoutDashboard, RefreshCw, RotateCcw, Sparkles, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useState, useEffect, useRef } from "react";
import { usePuterAI } from "@/hooks/use-puter-ai";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChameleonLogo } from "@/components/ChameleonLogo";
import { SiteFooter } from "@/components/site-footer";
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

  const [reimagineMode, setReimagineMode] = useState("standard");
  const [viewMode, setViewMode] = useState<"original" | "reimagined" | "diff">("original");
  const [storedReimaginedContent, setStoredReimaginedContent] = useState<string | null>(null);
  const [isReimagining, setIsReimagining] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);

  const { reimagine } = usePuterAI();

  /* Load cached AI content */
  useEffect(() => {
    const key = `reimagined-${project.slug}-${activePage.slug}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setStoredReimaginedContent(cached);
    }
    setViewMode("original");
  }, [project.slug, activePage.slug]);

  /* AI Reimagine */
  const handleReimagine = async () => {
    if (isReimagining) return;

    try {
      setIsReimagining(true);
      const newContent = await reimagine(activePage.content, reimagineMode);
      setStoredReimaginedContent(newContent);
      localStorage.setItem(
        `reimagined-${project.slug}-${activePage.slug}`,
        newContent
      );
      setViewMode("reimagined");
    } catch (err) {
      console.error("AI Reimagination failed", err);
    } finally {
      setIsReimagining(false);
    }
  };

  /* Diff logic (simple line-based) */
  const getDiffContent = () => {
    if (!storedReimaginedContent) return activePage.content;

    const originalLines = activePage.content.split("\n");
    const aiLines = storedReimaginedContent.split("\n");

    return aiLines
      .map((line, i) =>
        line !== originalLines[i]
          ? `> **🟢 Changed:** ${line}`
          : line
      )
      .join("\n");
  };

  const displayContent =
    viewMode === "diff"
      ? getDiffContent()
      : viewMode === "reimagined" && storedReimaginedContent
      ? storedReimaginedContent
      : activePage.content;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card/80 backdrop-blur transition-transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <ChameleonLogo size={24} />
              <span className="font-bold">Chameleon</span>
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

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {pages.map((page) => {
              const active = currentPageSlug === page.slug;
              return (
                <Link
                  key={page._id}
                  href={`/p/${project.slug}?page=${page.slug}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div
                    className={cn(
                      "rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {page.title}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 bg-background/80 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            {storedReimaginedContent && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setViewMode(viewMode === "reimagined" ? "original" : "reimagined")
                  }
                  disabled={isReimagining}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {viewMode === "reimagined" ? "Original" : "Reimagined"}
                </Button>

                <Button
                  size="sm"
                  variant={viewMode === "diff" ? "default" : "outline"}
                  onClick={() =>
                    setViewMode(viewMode === "diff" ? "reimagined" : "diff")
                  }
                  disabled={isReimagining}
                >
                  Diff View
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" disabled={isReimagining}>
                  {REIMAGINE_MODES.find(m => m.id === reimagineMode)?.label}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {REIMAGINE_MODES.map(mode => (
                  <DropdownMenuItem
                    key={mode.id}
                    onClick={() => setReimagineMode(mode.id)}
                  >
                    {mode.label}
                    {reimagineMode === mode.id && (
                      <Check className="h-3 w-3 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              onClick={handleReimagine}
              disabled={isReimagining}
            >
              {isReimagining ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Reimagine
            </Button>
          </div>
        </header>

        <div className="container max-w-4xl py-12">
          <h1 className="text-4xl font-bold mb-6">{activePage.title}</h1>
          <MarkdownRenderer content={displayContent} />
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const searchParams = useSearchParams();
    const currentPageSlug = searchParams.get("page") || pages[0]?.slug;

    const [reimagineMode, setReimagineMode] = useState("standard");
    const [storedReimaginedContent, setStoredReimaginedContent] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"original" | "reimagined">("original");
    const [wavePhase, setWavePhase] = useState<WavePhase>("idle");
    const [showLoader, setShowLoader] = useState(false);

    const {
        reimagine,
        isLoading,
        error,
    } = usePuterAI();

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
        setViewMode("original");
        setWavePhase("idle");
    }, [project.slug, activePage.slug]);

    const handleReimagine = async () => {
        if (isLoading) return;

    const handleReimagine = async (mode: string = reimagineMode) => {
        if (isReimagining) return;

        setIsReimagining(true);
        setReimagineMode(mode);
        setShowLoader(true); // Show loader for Reimagine
        setWavePhase("fade-out"); // Start fade out
        setShowLoader(true);
        setWavePhase("fade-out");

        try {
            const newContent = await reimagine(activePage.content, reimagineMode);
            setStoredReimaginedContent(newContent);
            localStorage.setItem(
                `reimagined-${project.slug}-${activePage.slug}`,
                newContent
            );
            setViewMode("reimagined");

            // Now fade in the new content
            setWavePhase("fade-in");
        } catch {
            setWavePhase("idle");
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
        if (isLoading || !storedReimaginedContent) return;
        setWavePhase("fade-out");
        setViewMode(viewMode === "original" ? "reimagined" : "original");
        setWavePhase("fade-in");
    };

    const displayContent = viewMode === "reimagined" && storedReimaginedContent
        ? storedReimaginedContent
        : activePage.content;
    const displayContent =
        viewMode === "reimagined" && storedReimaginedContent
            ? storedReimaginedContent
            : activePage.content;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/50 backdrop-blur-xl transition-transform lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-between border-b px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <ChameleonLogo size={24} />
                            <span className="font-bold">Chameleon</span>
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
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {pages.map((page) => {
                            const isActive = currentPageSlug === page.slug;
                            return (
                                <Link
                                    key={page._id}
                                    href={`/p/${project.slug}?page=${page.slug}`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <div
                                        className={cn(
                                            "rounded-md px-3 py-2 text-sm transition",
                                            isActive
                                                ? "bg-primary/15 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        {page.title}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t p-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="w-full gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

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
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        {storedReimaginedContent && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleView}
                                disabled={isLoading}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {viewMode === "reimagined" ? "Original" : "Reimagined"}
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
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" disabled={isLoading}>
                                    {REIMAGINE_MODES.find(m => m.id === reimagineMode)?.label}
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {REIMAGINE_MODES.map(mode => (
                                    <DropdownMenuItem
                                        key={mode.id}
                                        onClick={() => setReimagineMode(mode.id)}
                                    >
                                        {mode.label}
                                        {reimagineMode === mode.id && (
                                            <Check className="h-3 w-3 ml-auto" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            size="sm"
                            onClick={handleReimagine}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Reimagine
                        </Button>
                    </div>
                </header>

                <div className="container max-w-4xl py-12">
                    <h1 className="text-4xl font-bold mb-6">{activePage.title}</h1>

                    {error && (
                        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            AI failed. Please try again.
                        </div>
                    )}



                    {/* Wave Transition Animation */}
                    <WaveTransition
                        phase={wavePhase}
                        showLoader={showLoader}
                        onPhaseComplete={() => {
                            if (wavePhase !== "idle") {
                                setWavePhase("idle");
                                setShowLoader(false);
                            }
                        }}
                    >
                        <MarkdownRenderer
                            content={displayContent}
                        />
                        <MarkdownRenderer content={displayContent} />
                    </WaveTransition>
                </div>
                <SiteFooter />
            </main>
        </div>
      </main>
    </div>
  );
}
