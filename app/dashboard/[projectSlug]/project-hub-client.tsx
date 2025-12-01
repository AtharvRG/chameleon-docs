"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, FileText, Plus, Edit3, ArrowUpRight,
    Palette, Check, Globe, Lock, MoreVertical, Folder, Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { updateProjectSettings } from "@/actions/project-actions";
import { createPage, publishPage } from "@/actions/page-actions";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "docs", label: "Documentation" },
    { id: "settings", label: "Settings" },
];

function SimpleSwitch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (c: boolean) => void; className?: string }) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                checked ? "bg-primary" : "bg-white/10",
                className
            )}
        >
            <span
                className={cn(
                    "block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}

export function ProjectHubClient({ project, pages, analytics }: any) {
    const [activeTab, setActiveTab] = useState("docs");
    const router = useRouter();

    // Settings State
    const [color, setColor] = useState(project.theme?.color || "indigo");
    const [font, setFont] = useState(project.theme?.font || "Inter");
    const [isPublic, setIsPublic] = useState(project.isPublic || false);
    const [emoji, setEmoji] = useState(project.emoji || "📚");
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Emoji options - define outside component to avoid re-creation
    const EMOJI_OPTIONS = ["📚", "📖", "📝", "✨", "🚀", "💡", "🎯", "⚡", "🔥", "💎", "🌟", "📋", "📁", "🎨", "🔧", "📊", "🌐", "💻", "📱", ""];

    const handleCreatePage = async () => {
        const title = prompt("Enter page title:");
        if (!title) return;

        const section = prompt("Enter section name (optional):") || "";

        const res = await createPage(project.slug, title, section);
        if (res.success) {
            router.refresh();
        }
    };

    const handlePublishToggle = async (pageId: string, currentStatus: boolean) => {
        await publishPage(pageId, !currentStatus);
        router.refresh();
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        await updateProjectSettings(project.slug, { color, font, isPublic, emoji });
        setIsSavingSettings(false);
        router.refresh();
    };

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

    // Analytics Helper
    const maxViews = analytics?.topPages?.[0]?.views || 1;

    const themeClass = `theme-${project.theme?.color || 'indigo'}`;

    return (
        <div className={"min-h-screen bg-background p-8"}>
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                            <span>/</span>
                            <span>Projects</span>
                        </div>
                        <h1 className="mt-2 font-heading text-3xl font-bold">{project.name}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${project.slug}`)}>
                            Copy Link
                        </Button>
                        <Link href={`/p/${project.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                                View Live <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="font-heading text-lg text-muted-foreground">Your documentation is live and ready for the world.</p>
                </div>

                <GlassTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <GlassCard className="p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="mb-6 font-heading text-lg font-semibold text-muted-foreground">Total Project Views</h3>
                                        <p className="text-5xl font-bold tracking-tight">
                                            {analytics?.totalViews.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-green-500">
                                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                        Live Tracking Active
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6 max-h-[400px] flex flex-col">
                                    <h3 className="mb-6 font-heading text-lg font-semibold text-muted-foreground">Top Performing Pages</h3>
                                    <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {analytics?.topPages.map((page: any) => (
                                            <div key={page.slug} className="group">
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="font-medium truncate max-w-[70%]">{page.title}</span>
                                                    <span className="text-muted-foreground">{page.views} views</span>
                                                </div>
                                                {/* Removed Progress Bar as requested */}
                                            </div>
                                        ))}
                                        {(!analytics?.topPages || analytics.topPages.length === 0) && (
                                            <div className="text-sm text-muted-foreground">No data available yet.</div>
                                        )}
                                    </div>
                                </GlassCard>
                            </div>
                        )}

                        {/* DOCS TAB */}
                        {activeTab === "docs" && (
                            <GlassCard className="overflow-visible p-0">
                                <div className="flex items-center justify-between border-b border-white/10 p-4">
                                    <h3 className="font-heading text-lg font-semibold">Pages ({pages.length})</h3>
                                    <Button variant="default" size="sm" onClick={handleCreatePage}>
                                        <Plus className="mr-2 h-4 w-4" /> New Page
                                    </Button>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {pages.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground">No pages yet.</div>
                                    )}

                                    {sections.map(section => (
                                        <div key={section}>
                                            {section !== "Uncategorized" && (
                                                <div className="bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Folder className="h-3 w-3" />
                                                    {section}
                                                </div>
                                            )}
                                            {groupedPages[section].map((page: any) => (
                                                <div key={page._id} className="group flex items-center justify-between p-4 transition-colors hover:bg-white/5 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{page.title}</p>
                                                            <p className="text-xs text-muted-foreground">/{page.slug}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={page.status === "Published" ? "success" : "secondary"}>
                                                            {page.status}
                                                        </Badge>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <Link href={`/dashboard/${project.slug}/editor?page=${page.slug}`}>
                                                                    <DropdownMenuItem>
                                                                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                                <DropdownMenuItem onClick={() => handlePublishToggle(page._id, page.status === "Published")}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    {page.status === "Published" ? "Unpublish" : "Publish"}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === "settings" && (
                            <div className="space-y-8">
                                <GlassCard className="p-6">
                                    <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                        <Palette className="h-5 w-5 text-primary" />
                                        <h3 className="font-heading text-lg font-semibold">Appearance</h3>
                                    </div>

                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium">Brand Color</label>
                                                <div className="flex gap-3">
                                                    {[
                                                        { name: "indigo", hex: "bg-indigo-500" },
                                                        { name: "purple", hex: "bg-purple-500" },
                                                        { name: "pink", hex: "bg-pink-500" },
                                                        { name: "blue", hex: "bg-blue-500" },
                                                        { name: "green", hex: "bg-emerald-500" },
                                                        { name: "orange", hex: "bg-orange-500" },
                                                    ].map((c) => (
                                                        <button
                                                            key={c.name}
                                                            onClick={() => setColor(c.name)}
                                                            className={cn(
                                                                "h-8 w-8 rounded-full ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                                c.hex,
                                                                color === c.name && "ring-2 ring-white"
                                                            )}
                                                        >
                                                            {color === c.name && <Check className="mx-auto h-4 w-4 text-white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-medium">Project Icon</label>
                                                <p className="text-xs text-muted-foreground">Choose an emoji or leave empty for no icon</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {EMOJI_OPTIONS.map((e, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setEmoji(e)}
                                                            className={cn(
                                                                "h-10 w-10 rounded-lg border transition-all hover:scale-110 flex items-center justify-center text-xl",
                                                                emoji === e 
                                                                    ? "border-primary bg-primary/20 ring-2 ring-primary" 
                                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {e || <span className="text-xs text-muted-foreground">None</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-medium">Font Family</label>
                                                <div className="relative">
                                                    <select
                                                        value={font}
                                                        onChange={(e) => setFont(e.target.value)}
                                                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    >
                                                        <option value="Inter">Inter (Clean)</option>
                                                        <option value="Space Grotesk">Space Grotesk (Tech)</option>
                                                        <option value="Manrope">Manrope (Modern)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-sm font-medium flex items-center gap-2">
                                                            {isPublic ? <Globe className="h-4 w-4 text-orange-400" /> : <Lock className="h-4 w-4 text-orange-400" />}
                                                            Project Visibility
                                                        </label>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {isPublic ? "Anyone with the link can view." : "Only you can view."}
                                                        </p>
                                                    </div>
                                                    <div className={"flex items-center gap-2"}>
                                                        <SimpleSwitch checked={isPublic} className={isPublic ? `bg-accent` : undefined} onCheckedChange={setIsPublic} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/20 p-6 relative overflow-hidden">
                                            <div className={`absolute inset-0 opacity-10 bg-${color}-500 blur-3xl`} />
                                            <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-muted-foreground relative z-10">Live Preview</span>

                                            <div className="space-y-4 rounded-lg bg-background/80 p-6 shadow-2xl border border-white/5 relative z-10 backdrop-blur-md">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-8 w-8 rounded-md bg-${color}-500 flex items-center justify-center text-lg`}>
                                                        {emoji || ""}
                                                    </div>
                                                    <span className={`font-bold text-lg ${font === 'Space Grotesk' ? 'font-tech' : font === 'Manrope' ? 'font-modern' : 'font-clean'}`}>
                                                        {project.name}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-3/4 rounded bg-foreground/10" />
                                                    <div className="h-4 w-1/2 rounded bg-foreground/10" />
                                                </div>
                                                <Button size="sm" className={`bg-${color}-600 hover:bg-${color}-700 text-white w-full border-0`}>
                                                    Get Started
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end bg-">
                                        <Button variant="glass" onClick={handleSaveSettings} className={`bg-accent`} disabled={isSavingSettings}>
                                            {isSavingSettings ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </GlassCard>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}