"use client";

import { motion } from "framer-motion";
import { Plus, ArrowRight, FileText, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ProjectData {
    _id: string;
    name: string;
    slug: string;
    isPublic: boolean;
    createdAt: string;
    emoji?: string;
    theme?: {
        color: string;
        font: string;
    };
}

export function DashboardClient({ initialProjects }: { initialProjects: ProjectData[] }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="font-heading text-4xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">Manage your documentation projects.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search projects..." className="pl-10 bg-card/50 border-border" />
                    </div>
                    <Link href="/dashboard/new">
                        <Button size="default" className="gap-2">
                            <Plus className="h-4 w-4" /> New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-semibold">Recent Projects</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
                </div>

                {initialProjects.length === 0 ? (
                    <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-border bg-card/20">
                        <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            Create your first documentation site to get started building beautiful docs.
                        </p>
                        <Link href="/dashboard/new">
                            <Button size="lg">Create Project</Button>
                        </Link>
                    </GlassCard>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {initialProjects.map((project) => (
                            <motion.div key={project._id} variants={itemVariants}>
                                <Link href={`/dashboard/${project.slug}`}>
                                    <GlassCard className="group relative h-full cursor-pointer transition-all hover:border-accent/50 p-6">
                                        <div className="mb-6 flex items-start justify-between">
                                            <div
                                                className="h-12 w-12 rounded-xl border border-white/10 shadow-inner flex items-center justify-center text-xl"
                                                style={{
                                                    background: `linear-gradient(135deg, ${project.theme?.color || "#6366f1"}, ${project.theme?.color || "#6366f1"}88)`,
                                                }}
                                            >
                                                {project.emoji || "📚"}
                                            </div>
                                            <Badge variant={project.isPublic ? "default" : "secondary"} className="rounded-sm">
                                                {project.isPublic ? "Public" : "Private"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-heading text-xl font-bold group-hover:text-accent transition-colors">
                                                {project.name}
                                            </h3>
                                            <p className="font-mono text-xs text-muted-foreground">/{project.slug}</p>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-muted-foreground">
                                            <span>Updated {new Date(project.createdAt).toLocaleDateString()}</span>
                                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-accent" />
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
