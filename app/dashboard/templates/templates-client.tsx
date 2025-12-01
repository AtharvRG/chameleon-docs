"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    FileText,
    Book,
    Code,
    Rocket,
    Sparkles,
    Star,
    Clock,
    ArrowRight,
    Copy,
    Check,
    Filter,
    Grid3X3,
    List,
    BookOpen,
    Zap,
    Terminal,
    Database,
    Cloud,
    Shield,
    Package,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import MagneticButton from "@/components/ui/magnetic-button";
import { createProjectFromTemplate } from "@/actions/project-actions";

// Template categories
const CATEGORIES = [
    { id: "all", label: "All Templates", icon: Grid3X3 },
    { id: "documentation", label: "Documentation", icon: Book },
    { id: "api", label: "API Reference", icon: Code },
    { id: "product", label: "Product Docs", icon: Package },
    { id: "developer", label: "Developer Guide", icon: Terminal },
    { id: "knowledge-base", label: "Knowledge Base", icon: Database },
];

// Predefined templates
const TEMPLATES = [
    {
        id: "minimal-docs",
        name: "Minimal Docs",
        description: "A clean, minimalist documentation template with essential features. Perfect for small projects or getting started quickly.",
        category: "documentation",
        icon: FileText,
        color: "#6366f1",
        featured: true,
        popularity: "TDB",
        uses: "NA",
        pages: ["Introduction", "Getting Started", "Features", "FAQ"],
        preview: "/templates/minimal-docs.png",
    },
    {
        id: "api-reference",
        name: "API Reference",
        description: "Comprehensive API documentation template with code examples, request/response samples, and authentication guides.",
        category: "api",
        icon: Code,
        color: "#10b981",
        featured: true,
        popularity: "TDB",
        uses: "NA",
        pages: ["Overview", "Authentication", "Endpoints", "Error Codes", "Rate Limits", "SDKs"],
        preview: "/templates/api-reference.png",
    },
    {
        id: "product-guide",
        name: "Product Guide",
        description: "End-to-end product documentation with onboarding flows, feature walkthroughs, and user guides.",
        category: "product",
        icon: Rocket,
        color: "#f59e0b",
        featured: true,
        popularity: "TDB",
        uses: "NA",
        pages: ["Welcome", "Quick Start", "Dashboard", "Settings", "Integrations", "Billing"],
        preview: "/templates/product-guide.png",
    },
    {
        id: "developer-portal",
        name: "Developer Portal",
        description: "Complete developer documentation with tutorials, API references, and code samples for multiple languages.",
        category: "developer",
        icon: Terminal,
        color: "#8b5cf6",
        featured: false,
        popularity: "TDB",
        uses: "NA",
        pages: ["Introduction", "Installation", "Configuration", "Tutorials", "API", "Contributing"],
        preview: "/templates/developer-portal.png",
    },
    {
        id: "saas-docs",
        name: "SaaS Documentation",
        description: "Modern SaaS product documentation with user guides, admin documentation, and integration tutorials.",
        category: "product",
        icon: Cloud,
        color: "#06b6d4",
        featured: false,
        popularity: "TDB",
        uses: "NA",
        pages: ["Getting Started", "User Guide", "Admin Guide", "Integrations", "Security", "Support"],
        preview: "/templates/saas-docs.png",
    },
    {
        id: "open-source",
        name: "Open Source Project",
        description: "Documentation template for open source projects with contribution guidelines and community resources.",
        category: "developer",
        icon: Package,
        color: "#ec4899",
        featured: false,
        popularity: "TDB",
        uses: "NA",
        pages: ["Introduction", "Installation", "Usage", "API", "Contributing", "License"],
        preview: "/templates/open-source.png",
    },
    {
        id: "help-center",
        name: "Help Center",
        description: "Customer support knowledge base with searchable articles, FAQs, and troubleshooting guides.",
        category: "knowledge-base",
        icon: BookOpen,
        color: "#f97316",
        featured: true,
        popularity: "TDB",
        uses: "NA",
        pages: ["Welcome", "Getting Started", "Account", "Billing", "Troubleshooting", "Contact"],
        preview: "/templates/help-center.png",
    },
    {
        id: "security-docs",
        name: "Security Documentation",
        description: "Security-focused documentation with compliance information, security policies, and best practices.",
        category: "api",
        icon: Shield,
        color: "#ef4444",
        featured: false,
        popularity: "TDB",
        uses: "NA",
        pages: ["Overview", "Authentication", "Authorization", "Encryption", "Compliance", "Audit Logs"],
        preview: "/templates/security-docs.png",
    },
];

export function TemplatesClient() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let result = [...TEMPLATES];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name.toLowerCase().includes(query) ||
                    t.description.toLowerCase().includes(query) ||
                    t.category.toLowerCase().includes(query)
            );
        }

        if (selectedCategory !== "all") {
            result = result.filter((t) => t.category === selectedCategory);
        }

        return result;
    }, [searchQuery, selectedCategory]);

    // Featured templates
    const featuredTemplates = useMemo(
        () => TEMPLATES.filter((t) => t.featured).slice(0, 3),
        []
    );

    const handleUseTemplate = async () => {
        if (!selectedTemplate || !projectName.trim()) return;

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append("name", projectName);
            formData.append("templateId", selectedTemplate.id);

            const result = await createProjectFromTemplate(formData);
            if (result.success && result.slug) {
                router.push(`/dashboard/${result.slug}`);
            } else {
                alert(result.error || "Failed to create project from template");
            }
        } catch (error) {
            alert("An error occurred");
        }
        setIsCreating(false);
    };

    const copyTemplateId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
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
            <div className="space-y-1">
                <h1 className="font-heading text-4xl font-bold tracking-tight">Templates</h1>
                <p className="text-muted-foreground">
                    Start with a professionally designed template and customize it to your needs.
                </p>
            </div>

            {/* Featured Templates */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="font-heading text-xl font-semibold">Featured Templates</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {featuredTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <GlassCard
                                key={template.id}
                                className="group relative cursor-pointer overflow-hidden transition-all hover:border-accent/50 hover:bg-white/10"
                                onClick={() => {
                                    setSelectedTemplate(template);
                                    setProjectName(`${template.name} Project`);
                                }}
                            >
                                {/* Gradient Header */}
                                <div
                                    className="h-24 -mx-6 -mt-6 mb-4"
                                    style={{
                                        background: `linear-gradient(135deg, ${template.color}40, ${template.color}10)`,
                                    }}
                                />

                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                                        style={{ backgroundColor: template.color }}
                                    >
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading font-bold group-hover:text-accent transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500" />
                                            {template.popularity}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {template.uses.toLocaleString()} uses
                                        </span>
                                    </div>
                                    <Badge variant="glass" className="text-[10px]">
                                        Featured
                                    </Badge>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filter Bar */}
            <GlassCard className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search templates..."
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
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-44"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

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

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedCategory === cat.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Templates Grid/List */}
            {filteredTemplates.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-white/10 bg-white/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent mb-6">
                        <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No templates found</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Try adjusting your search or filter criteria.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                        }}
                    >
                        Clear Filters
                    </Button>
                </GlassCard>
            ) : viewMode === "grid" ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <motion.div key={template.id} variants={itemVariants}>
                                <GlassCard
                                    className="group relative h-full cursor-pointer transition-all hover:border-accent/50 hover:bg-white/10"
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setProjectName(`${template.name} Project`);
                                    }}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg flex-shrink-0"
                                            style={{ backgroundColor: template.color }}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-heading font-bold group-hover:text-accent transition-colors">
                                                {template.name}
                                            </h3>
                                            <Badge variant="glass" className="mt-1 text-[10px]">
                                                {CATEGORIES.find((c) => c.id === template.category)?.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {template.description}
                                    </p>

                                    {/* Pages Preview */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {template.pages.slice(0, 4).map((page) => (
                                            <span
                                                key={page}
                                                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
                                            >
                                                {page}
                                            </span>
                                        ))}
                                        {template.pages.length > 4 && (
                                            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                +{template.pages.length - 4} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500" />
                                                {template.popularity}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                {template.uses.toLocaleString()}
                                            </span>
                                        </div>
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-accent" />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                >
                    {filteredTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <motion.div key={template.id} variants={itemVariants}>
                                <GlassCard
                                    className="group cursor-pointer transition-all hover:border-accent/50 hover:bg-white/10 p-4"
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setProjectName(`${template.name} Project`);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-lg shadow-lg flex-shrink-0"
                                            style={{ backgroundColor: template.color }}
                                        >
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-heading font-bold group-hover:text-accent transition-colors">
                                                {template.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {template.description}
                                            </p>
                                        </div>

                                        <Badge variant="glass" className="hidden sm:flex text-[10px]">
                                            {CATEGORIES.find((c) => c.id === template.category)?.label}
                                        </Badge>

                                        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-500" />
                                                {template.popularity}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {template.pages.length} pages
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hidden sm:flex"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyTemplateId(template.id);
                                                }}
                                            >
                                                {copiedId === template.id ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button variant="default" size="sm">
                                                Use Template
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Results Count */}
            {filteredTemplates.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    Showing {filteredTemplates.length} of {TEMPLATES.length} templates
                </p>
            )}

            {/* Template Preview Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !isCreating && setSelectedTemplate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-2xl border border-white/10 bg-background shadow-2xl overflow-hidden"
                        >
                            {/* Header with gradient */}
                            <div
                                className="h-32 relative"
                                style={{
                                    background: `linear-gradient(135deg, ${selectedTemplate.color}60, ${selectedTemplate.color}20)`,
                                }}
                            >
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="absolute right-4 top-4 rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="absolute -bottom-8 left-6">
                                    <div
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl border-4 border-background"
                                        style={{ backgroundColor: selectedTemplate.color }}
                                    >
                                        {(() => {
                                            const Icon = selectedTemplate.icon;
                                            return <Icon className="h-8 w-8 text-white" />;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-12">
                                <div className="mb-6">
                                    <h2 className="font-heading text-2xl font-bold mb-2">
                                        {selectedTemplate.name}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {selectedTemplate.description}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="rounded-lg bg-white/5 p-3 text-center">
                                        <p className="text-2xl font-bold">{selectedTemplate.popularity}</p>
                                        <p className="text-xs text-muted-foreground">Rating</p>
                                    </div>
                                    <div className="rounded-lg bg-white/5 p-3 text-center">
                                        <p className="text-2xl font-bold">{selectedTemplate.uses.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Uses</p>
                                    </div>
                                    <div className="rounded-lg bg-white/5 p-3 text-center">
                                        <p className="text-2xl font-bold">{selectedTemplate.pages.length}</p>
                                        <p className="text-xs text-muted-foreground">Pages</p>
                                    </div>
                                </div>

                                {/* Included Pages */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3">Included Pages</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.pages.map((page) => (
                                            <span
                                                key={page}
                                                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm"
                                            >
                                                <FileText className="h-3 w-3 text-muted-foreground" />
                                                {page}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Project Name Input */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-2 block">Project Name</label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Enter project name..."
                                        className="w-full h-12 px-4 rounded-lg border border-white/10 bg-white/5 text-base outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setSelectedTemplate(null)}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onClick={handleUseTemplate}
                                        disabled={isCreating || !projectName.trim()}
                                    >
                                        {isCreating ? (
                                            "Creating..."
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Use This Template
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
