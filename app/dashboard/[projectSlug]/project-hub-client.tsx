"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, FileText, Plus, Edit3, ArrowUpRight,
    Palette, Check, Globe, Lock, MoreVertical, Folder, Eye,
    Pencil, Trash2, Link2, X, AlertTriangle, Download, Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateProjectSettings, deleteProject, renameProjectSlug, exportProject, importProject } from "@/actions/project-actions";
import { createPage, publishPage, deletePage, updatePageTitle, updatePageSlug } from "@/actions/page-actions";
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

// Modal Components
function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!isOpen) return null;
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
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

    // Page Modal states
    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; page: any }>({ isOpen: false, page: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; page: any }>({ isOpen: false, page: null });
    const [slugModal, setSlugModal] = useState<{ isOpen: boolean; page: any }>({ isOpen: false, page: null });
    
    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [modalError, setModalError] = useState("");
    const [isModalLoading, setIsModalLoading] = useState(false);

    // Project management states
    const [projectSlugModal, setProjectSlugModal] = useState(false);
    const [projectDeleteModal, setProjectDeleteModal] = useState(false);
    const [newProjectSlug, setNewProjectSlug] = useState(project.slug);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Rename handlers
    const openRenameModal = (page: any) => {
        setNewTitle(page.title);
        setModalError("");
        setRenameModal({ isOpen: true, page });
    };

    const handleRename = async () => {
        if (!newTitle.trim()) {
            setModalError("Title cannot be empty");
            return;
        }
        setIsModalLoading(true);
        setModalError("");
        
        const res = await updatePageTitle(renameModal.page._id, newTitle, project.slug);
        
        if (res.success) {
            setRenameModal({ isOpen: false, page: null });
            router.refresh();
        } else {
            setModalError(res.error || "Failed to rename page");
        }
        setIsModalLoading(false);
    };

    // Delete handlers
    const openDeleteModal = (page: any) => {
        setModalError("");
        setDeleteModal({ isOpen: true, page });
    };

    const handleDelete = async () => {
        setIsModalLoading(true);
        setModalError("");
        
        const res = await deletePage(deleteModal.page._id, project.slug);
        
        if (res.success) {
            setDeleteModal({ isOpen: false, page: null });
            router.refresh();
        } else {
            setModalError(res.error || "Failed to delete page");
        }
        setIsModalLoading(false);
    };

    // Slug handlers
    const openSlugModal = (page: any) => {
        setNewSlug(page.slug);
        setModalError("");
        setSlugModal({ isOpen: true, page });
    };

    const handleSlugUpdate = async () => {
        if (!newSlug.trim()) {
            setModalError("Slug cannot be empty");
            return;
        }
        setIsModalLoading(true);
        setModalError("");
        
        const res = await updatePageSlug(slugModal.page._id, newSlug, project.slug);
        
        if (res.success) {
            setSlugModal({ isOpen: false, page: null });
            router.refresh();
        } else {
            setModalError(res.error || "Failed to update slug");
        }
        setIsModalLoading(false);
    };

    // Project Slug Rename Handler
    const handleProjectSlugRename = async () => {
        if (!newProjectSlug.trim()) {
            setModalError("Slug cannot be empty");
            return;
        }
        setIsModalLoading(true);
        setModalError("");
        
        const res = await renameProjectSlug(project.slug, newProjectSlug);
        
        if (res.success) {
            setProjectSlugModal(false);
            router.push(`/dashboard/${res.newSlug}`);
        } else {
            setModalError(res.error || "Failed to rename project slug");
        }
        setIsModalLoading(false);
    };

    // Project Delete Handler
    const handleProjectDelete = async () => {
        if (deleteConfirmName !== project.name) {
            setModalError("Please type the project name to confirm");
            return;
        }
        setIsModalLoading(true);
        setModalError("");
        
        const res = await deleteProject(project.slug);
        
        if (res.success) {
            setProjectDeleteModal(false);
            router.push("/dashboard");
        } else {
            setModalError(res.error || "Failed to delete project");
        }
        setIsModalLoading(false);
    };

    // Export Handler
    const handleExport = async () => {
        setIsExporting(true);
        
        const res = await exportProject(project.slug);
        
        if (res.success && res.data) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${project.slug}-backup.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        setIsExporting(false);
    };

    // Import Handler
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const res = await importProject(data);
            
            if (res.success) {
                router.push(`/dashboard/${res.slug}`);
            } else {
                alert(res.error || "Failed to import project");
            }
        } catch (error) {
            alert("Invalid JSON file");
        }
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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

                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="bg-background text-foreground shadow-md border border-border rounded-md"
                                                        >
                                                            <Link href={`/dashboard/${project.slug}/editor?page=${page.slug}`}>
                                                            <DropdownMenuItem className="
                                                            cursor-pointer
                                                            text-foreground
                                                            focus:bg-muted
                                                            focus:text-foreground
                                                            hover:bg-muted
                                                            hover:text-foreground
                                                        ">
                                                                <Edit3 className="mr-2 h-4 w-4" /> Edit Content
                                                            </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem   className="
                                                            cursor-pointer
                                                            text-foreground
                                                            focus:bg-muted
                                                            focus:text-foreground
                                                            hover:bg-muted
                                                            hover:text-foreground
                                                        " onClick={() => openRenameModal(page)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem   className="
                                                            cursor-pointer
                                                            text-foreground
                                                            focus:bg-muted
                                                            focus:text-foreground
                                                            hover:bg-muted
                                                            hover:text-foreground
                                                        " onClick={() => openSlugModal(page)}>
                                                            <Link2 className="mr-2 h-4 w-4" /> Edit Slug
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem   className="
                                                            cursor-pointer
                                                            text-foreground
                                                            focus:bg-muted
                                                            focus:text-foreground
                                                            hover:bg-muted
                                                            hover:text-foreground
                                                        " onClick={() => handlePublishToggle(page._id, page.status === "Published")}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            {page.status === "Published" ? "Unpublish" : "Publish"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                            onClick={() => openDeleteModal(page)}
                                                                className="
                                                            cursor-pointer
                                                            text-red-500
                                                            hover:bg-red-500/10
                                                            hover:text-red-600
                                                            focus:bg-red-500/10
                                                            focus:text-red-600
                                                        "
                                                            >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

                                {/* Project Management Section */}
                                <GlassCard className="p-6">
                                    <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <h3 className="font-heading text-lg font-semibold">Project Management</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Project Slug */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div>
                                                <h4 className="font-medium">Project Slug</h4>
                                                <p className="text-sm text-muted-foreground">Current: /{project.slug}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => { setNewProjectSlug(project.slug); setModalError(""); setProjectSlugModal(true); }}>
                                                <Link2 className="mr-2 h-4 w-4" /> Rename Slug
                                            </Button>
                                        </div>

                                        {/* Export/Import */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                            <div>
                                                <h4 className="font-medium">Backup & Restore</h4>
                                                <p className="text-sm text-muted-foreground">Export or import your documentation</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                                                    <Download className="mr-2 h-4 w-4" /> {isExporting ? "Exporting..." : "Export"}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                    <Upload className="mr-2 h-4 w-4" /> Import
                                                </Button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".json"
                                                    className="hidden"
                                                    onChange={handleImport}
                                                />
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-red-500">Danger Zone</h4>
                                                    <p className="text-sm text-muted-foreground">Permanently delete this project and all its pages</p>
                                                </div>
                                                <Button variant="destructive" size="sm" onClick={() => { setDeleteConfirmName(""); setModalError(""); setProjectDeleteModal(true); }}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Page Rename Modal */}
            <Modal isOpen={renameModal.isOpen} onClose={() => setRenameModal({ isOpen: false, page: null })}>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-lg font-semibold">Rename Page</h3>
                        <Button variant="ghost" size="icon" onClick={() => setRenameModal({ isOpen: false, page: null })}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Page Title</label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter new title"
                                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            />
                        </div>
                        {modalError && <p className="text-sm text-red-500">{modalError}</p>}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setRenameModal({ isOpen: false, page: null })}>
                                Cancel
                            </Button>
                            <Button onClick={handleRename} disabled={isModalLoading}>
                                {isModalLoading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </Modal>

            {/* Page Delete Modal */}
            <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, page: null })}>
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Delete Page</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Are you sure you want to delete <strong>&ldquo;{deleteModal.page?.title}&rdquo;</strong>? This action cannot be undone.
                    </p>
                    {modalError && <p className="text-sm text-red-500 mb-4">{modalError}</p>}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, page: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isModalLoading}>
                            {isModalLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </GlassCard>
            </Modal>

            {/* Page Slug Edit Modal */}
            <Modal isOpen={slugModal.isOpen} onClose={() => setSlugModal({ isOpen: false, page: null })}>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-lg font-semibold">Edit Page Slug</h3>
                        <Button variant="ghost" size="icon" onClick={() => setSlugModal({ isOpen: false, page: null })}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Changing the slug will break any existing links to this page.</span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Page Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">/</span>
                                <Input
                                    value={newSlug}
                                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/ /g, "-"))}
                                    placeholder="page-slug"
                                    onKeyDown={(e) => e.key === "Enter" && handleSlugUpdate()}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Only lowercase letters, numbers, and hyphens allowed.
                            </p>
                        </div>
                        {modalError && <p className="text-sm text-red-500">{modalError}</p>}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSlugModal({ isOpen: false, page: null })}>
                                Cancel
                            </Button>
                            <Button onClick={handleSlugUpdate} disabled={isModalLoading}>
                                {isModalLoading ? "Saving..." : "Update Slug"}
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </Modal>

            {/* Project Slug Rename Modal */}
            <Modal isOpen={projectSlugModal} onClose={() => setProjectSlugModal(false)}>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-lg font-semibold">Rename Project Slug</h3>
                        <Button variant="ghost" size="icon" onClick={() => setProjectSlugModal(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Changing the project slug will break any existing links to this documentation.</span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">/p/</span>
                                <Input
                                    value={newProjectSlug}
                                    onChange={(e) => setNewProjectSlug(e.target.value.toLowerCase().replace(/ /g, "-"))}
                                    placeholder="project-slug"
                                    onKeyDown={(e) => e.key === "Enter" && handleProjectSlugRename()}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Only lowercase letters, numbers, and hyphens allowed.
                            </p>
                        </div>
                        {modalError && <p className="text-sm text-red-500">{modalError}</p>}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setProjectSlugModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleProjectSlugRename} disabled={isModalLoading}>
                                {isModalLoading ? "Renaming..." : "Rename Slug"}
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </Modal>

            {/* Project Delete Modal */}
            <Modal isOpen={projectDeleteModal} onClose={() => setProjectDeleteModal(false)}>
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Delete Project</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        This will permanently delete <strong>&ldquo;{project.name}&rdquo;</strong> and all its pages. This action cannot be undone.
                    </p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type <strong>{project.name}</strong> to confirm</label>
                            <Input
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                                placeholder="Enter project name"
                            />
                        </div>
                        {modalError && <p className="text-sm text-red-500">{modalError}</p>}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setProjectDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleProjectDelete} 
                                disabled={isModalLoading || deleteConfirmName !== project.name}
                            >
                                {isModalLoading ? "Deleting..." : "Delete Project"}
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </Modal>
        </div>
    );
}