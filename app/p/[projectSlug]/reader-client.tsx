"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X, ChevronRight, LayoutDashboard, RefreshCw, RotateCcw, Sparkles, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
        }
        setViewMode("original");
        setWavePhase("idle");
    }, [project.slug, activePage.slug]);

    const handleReimagine = async () => {
        if (isLoading) return;

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
            setWavePhase("fade-in");
        } catch {
            setWavePhase("idle");
            setShowLoader(false);
        }
    };

    const toggleView = () => {
        if (isLoading || !storedReimaginedContent) return;
        setWavePhase("fade-out");
        setViewMode(viewMode === "original" ? "reimagined" : "original");
        setWavePhase("fade-in");
    };

    const displayContent =
        viewMode === "reimagined" && storedReimaginedContent
            ? storedReimaginedContent
            : activePage.content;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {isSidebarOpen && (
                <div
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
                        <MarkdownRenderer content={displayContent} />
                    </WaveTransition>
                </div>
            </main>
        </div>
    );
}
