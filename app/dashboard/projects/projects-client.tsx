"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Grid3X3,
    List,
    Filter,
    ArrowRight,
    FileText,
    Globe,
    Lock,
    MoreVertical,
    Trash2,
    Edit3,
    ExternalLink,
    Copy,
    Calendar,
    FolderOpen,
    Eye,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import MagneticButton from "@/components/ui/magnetic-button";
import { deleteProject } from "@/actions/project-actions";

interface ProjectData {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    isPublic: boolean;
    createdAt: string;
    emoji?: string;
    theme?: {
        color: string;
        font: string;
    };
}

interface ProjectsClientProps {
    initialProjects: ProjectData[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
    const router = useRouter();
    const [projects, setProjects] = useState(initialProjects);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.slug.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query)
            );
        }

        // Visibility filter
        if (filterVisibility === "public") {
            result = result.filter((p) => p.isPublic);
        } else if (filterVisibility === "private") {
            result = result.filter((p) => !p.isPublic);
        }

        // Sort
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return result;
    }, [projects, searchQuery, filterVisibility, sortBy]);

    // Stats
    const stats = useMemo(() => ({
        total: projects.length,
        public: projects.filter((p) => p.isPublic).length,
        private: projects.filter((p) => !p.isPublic).length,
    }), [projects]);

    const handleDelete = async (slug: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteProject(slug);
            if (result.success) {
                setProjects((prev) => prev.filter((p) => p.slug !== slug));
                setShowDeleteModal(null);
            } else {
                alert(result.error || "Failed to delete project");
            }
        } catch (error) {
            alert("An error occurred while deleting the project");
        }
        setIsDeleting(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="font-heading text-4xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage all your documentation projects in one place.
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <MagneticButton size="md" className="gap-2">
                        <Plus className="h-4 w-4" /> New Project
                    </MagneticButton>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Projects</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <FolderOpen className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Public Projects</p>
                            <p className="text-3xl font-bold">{stats.public}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                            <Globe className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Private Projects</p>
                            <p className="text-3xl font-bold">{stats.private}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                            <Lock className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Filters & Search Bar */}
            <GlassCard className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-white/5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={filterVisibility}
                                onChange={(e) => setFilterVisibility(e.target.value as any)}
                                className="w-32"
                            >
                                <option value="all">All</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </Select>
                        </div>

                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-36"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">By Name</option>
                        </Select>

                        {/* View Toggle */}
                        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`rounded-md p-2 transition-colors ${viewMode === "grid"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`rounded-md p-2 transition-colors ${viewMode === "list"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-white/10 bg-white/5">
                    {searchQuery || filterVisibility !== "all" ? (
                        <>
                            <h3 className="text-xl font-bold mb-2">No projects found</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">
                                Try adjusting your search or filter criteria.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterVisibility("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                            <p className="text-muted-foreground mb-8 max-w-sm">
                                Create your first documentation project to get started.
                            </p>
                            <Link href="/dashboard/new">
                                <MagneticButton size="lg">Create Project</MagneticButton>
                            </Link>
                        </>
                    )}
                </GlassCard>
            ) : viewMode === "grid" ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredProjects.map((project) => (
                        <motion.div key={project._id} variants={itemVariants}>
                            <GlassCard className="group relative h-full transition-all hover:border-accent/50 hover:bg-white/10 p-6">
                                {/* Dropdown Menu */}
                                <div className="absolute right-4 top-4 z-10">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenDropdown(openDropdown === project._id ? null : project._id);
                                            }}
                                            className="rounded-md p-2 text-muted-foreground opacity-0 transition-all hover:bg-white/10 hover:text-foreground group-hover:opacity-100"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>

                                        <AnimatePresence>
                                            {openDropdown === project._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
                                                >
                                                    <Link
                                                        href={`/dashboard/${project.slug}`}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                        Edit Project
                                                    </Link>
                                                    <Link
                                                        href={`/p/${project.slug}`}
                                                        target="_blank"
                                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        View Live
                                                    </Link>
                                                    <button
                                                        onClick={() => copyToClipboard(`${window.location.origin}/p/${project.slug}`)}
                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copy Link
                                                    </button>
                                                    <div className="border-t border-white/10" />
                                                    <button
                                                        onClick={() => {
                                                            setOpenDropdown(null);
                                                            setShowDeleteModal(project.slug);
                                                        }}
                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Project
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <Link href={`/dashboard/${project.slug}`} className="block">
                                    <div className="mb-6 flex items-start justify-between">
                                        <div
                                            className="h-12 w-12 rounded-xl border border-white/10 shadow-inner flex items-center justify-center text-xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${project.theme?.color || "#6366f1"}, ${project.theme?.color || "#6366f1"}88)`,
                                            }}
                                        >
                                            {project.emoji || "📚"}
                                        </div>
                                        <Badge
                                            variant={project.isPublic ? "success" : "secondary"}
                                            className="rounded-sm"
                                        >
                                            {project.isPublic ? (
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" /> Public
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Lock className="h-3 w-3" /> Private
                                                </span>
                                            )}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-heading text-xl font-bold group-hover:text-accent transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            /{project.slug}
                                        </p>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-accent" />
                                    </div>
                                </Link>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {filteredProjects.map((project) => (
                        <motion.div key={project._id} variants={itemVariants}>
                            <GlassCard className="group relative transition-all hover:border-accent/50 hover:bg-white/10 p-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-10 w-10 rounded-lg border border-white/10 shadow-inner flex-shrink-0 flex items-center justify-center text-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${project.theme?.color || "#6366f1"}, ${project.theme?.color || "#6366f1"}88)`,
                                        }}
                                    >
                                        {project.emoji || "📚"}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/dashboard/${project.slug}`}
                                            className="font-heading font-bold hover:text-accent transition-colors"
                                        >
                                            {project.name}
                                        </Link>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            /{project.slug}
                                        </p>
                                    </div>

                                    <Badge
                                        variant={project.isPublic ? "success" : "secondary"}
                                        className="hidden sm:flex rounded-sm"
                                    >
                                        {project.isPublic ? "Public" : "Private"}
                                    </Badge>

                                    <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <Link href={`/dashboard/${project.slug}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/p/${project.slug}`} target="_blank">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => setShowDeleteModal(project.slug)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Results Count */}
            {filteredProjects.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    Showing {filteredProjects.length} of {projects.length} projects
                </p>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isDeleting && setShowDeleteModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl border border-white/10 bg-background p-6 shadow-2xl"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Delete Project</h3>
                            <p className="text-muted-foreground mb-6">
                                Are you sure you want to delete this project? This action cannot be undone
                                and all associated pages will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteModal(null)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleDelete(showDeleteModal)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Project"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close dropdown */}
            {openDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
}
