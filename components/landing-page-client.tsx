"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowUpRight, Github, Star, FileText, ChevronRight } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ShowcaseProject } from "@/actions/showcase-actions";

interface LandingPageClientProps {
    session: any;
    publicProjects: ShowcaseProject[];
}

function ShowcaseCard({ project, index }: { project: ShowcaseProject; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    // Format relative time
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        return `${months}mo ago`;
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            <Link href={`/p/${project.slug}`}>
                <div className="group relative overflow-hidden rounded-sm border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-accent/30 hover:bg-card/80 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1">
                    {/* Top accent bar */}
                    <div
                        className="h-1 w-full transition-all duration-500 group-hover:h-1.5"
                        style={{ backgroundColor: project.themeColor }}
                    />

                    <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl border border-border/50 transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        background: `linear-gradient(135deg, ${project.themeColor}15, ${project.themeColor}05)`,
                                    }}
                                >
                                    {project.emoji}
                                </div>
                                <div>
                                    <h3 className="font-heading text-xl font-semibold tracking-tight group-hover:text-accent transition-colors duration-300">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        /{project.slug}
                                    </p>
                                </div>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-y-1 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {project.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="h-3 w-3" />
                                    {project.pageCount} {project.pageCount === 1 ? "page" : "pages"}
                                </span>
                                <span>Updated {timeAgo(project.updatedAt)}</span>
                            </div>
                            <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                                Read
                                <ChevronRight className="h-3 w-3" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function LandingPageClient({ session, publicProjects }: LandingPageClientProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // Parallax for feature images
    const featureRef = useRef(null);
    const { scrollYProgress: featureScroll } = useScroll({
        target: featureRef,
        offset: ["start end", "end start"]
    });

    const featureY = useTransform(featureScroll, [0, 1], ["0%", "-10%"]);
    const featureYReverse = useTransform(featureScroll, [0, 1], ["0%", "10%"]);

    // Showcase section ref
    const showcaseRef = useRef(null);
    const showcaseInView = useInView(showcaseRef, { once: true, margin: "-100px" });

    return (
        <div ref={containerRef} className="relative min-h-[200vh] bg-background text-foreground selection:bg-accent/30 selection:text-accent-foreground">

            {/* Floating Navbar */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/5 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]">
                    <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg tracking-tight">
                        <span>Chameleon Docs</span>
                    </Link>
                    <div className="mx-2 h-4 w-[1px] bg-border/50" />
                    <div className="flex items-center gap-1">
                        {session ? (
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="h-8 rounded-full hover:bg-white/10">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="h-8 rounded-full hover:bg-white/10">
                                    Log In
                                </Button>
                            </Link>
                        )}
                        {!session && (
                            <Link href="/signup">
                                <Button variant="default" size="sm" className="h-8 rounded-full px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105">
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="container relative z-10 flex flex-col items-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-12 flex items-center rounded-full border border-black/5 bg-secondary/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                    >
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span>⠀v1 Beta</span>
                    </motion.div>

                    {/* Massive Typography */}
                    <div className="relative -mt-4 z-20 flex flex-col items-center text-center">
                        <h1 className="font-heading text-[13vw] leading-[0.85] tracking-tighter text-foreground">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                className="block overflow-hidden"
                            >
                                <span className="block ">Documentation</span>
                            </motion.span>
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                className="block overflow-hidden italic text-accent pb-9"
                            >
                                <span className="block">Reimagined</span>
                            </motion.span>
                        </h1>
                    </div>

                    {/* Floating Images (Parallax) */}
                    <motion.div style={{ y }} className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[20%] left-[5%] w-[25vw] aspect-[3/4] overflow-hidden rounded-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
                            <Image src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Abstract" fill className="object-cover" />
                        </div>
                        <div className="absolute bottom-[10%] right-[5%] w-[30vw] aspect-[4/3] overflow-hidden rounded-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
                            <Image src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop" alt="Minimal" fill className="object-cover" />
                        </div>
                    </motion.div>

                    {/* Description & CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="mt-5 max-w-xl text-center z-30"
                    >
                        <p className="text-lg text-foreground md:text-xl font-medium leading-relaxed drop-shadow-sm">
                            Craft living knowledge bases that adapt to your team.
                            <span className="text-accent font-bold"> Beautiful by default.</span>
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <Link href={session ? "/dashboard" : "/signup"}>
                                <MagneticButton size="lg" className="group">
                                    Start Building
                                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                </MagneticButton>
                            </Link>
                            <Link href="https://github.com/AtharvRG/chameleon-docs">
                                <MagneticButton variant="outline" size="lg">
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </MagneticButton>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Marquee Section */}
            <div className="relative z-20 border-y border-border bg-background py-5 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className="mx-8 font-heading text-4xl font-light italic text-muted-foreground/50">
                            Beautiful • Adaptive • Intelligent •
                        </span>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SHOWCASE SECTION — Public Docs from the Community              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {publicProjects.length > 0 && (
                <section ref={showcaseRef} className="relative z-20 py-24 md:py-32 overflow-hidden">
                    {/* Subtle background decoration */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container relative">
                        {/* Section Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={showcaseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center mb-16 space-y-4"
                        >
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                                Explore
                            </span>
                            <h2 className="font-heading text-5xl md:text-6xl font-medium tracking-tight">
                                Community <span className="italic text-accent">Docs</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                                Discover live documentation projects built by the Chameleon community.
                            </p>
                        </motion.div>

                        {/* Project Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicProjects.map((project, index) => (
                                <ShowcaseCard
                                    key={project.slug}
                                    project={project}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={showcaseInView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="mt-16 text-center"
                        >
                            <Link href={session ? "/dashboard" : "/signup"}>
                                <Button variant="outline" size="lg" className="group rounded-full px-8 border-accent/20 hover:border-accent/50 hover:bg-accent/5 transition-all">
                                    Create Your Own Documentation
                                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Feature Grid (Magazine Layout) */}
            <section ref={featureRef} className="container py-32 space-y-32">

                {/* Feature 1: Image Left, Text Right */}
                <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-12 items-center">
                    <div className="md:col-span-7">
                        <motion.div style={{ y: featureY }} className="relative aspect-[16/9] overflow-hidden rounded-sm bg-secondary">
                            <Image src="https://images.pexels.com/photos/17709307/pexels-photo-17709307/free-photo-of-spiral-modern-structure.jpeg" alt="Office" fill className="object-cover transition-transform duration-700" />
                        </motion.div>
                    </div>
                    <div className="md:col-span-5 flex flex-col justify-center space-y-6">
                        <span className="font-mono text-xs uppercase tracking-widest text-accent underline">01 — Zero Latency</span>
                        <h2 className="font-heading text-5xl font-medium leading-tight">
                            Instant <br /> <span className="italic text-accent">Gratification</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powered by Next.js 14 and React Server Components. Pages load instantly, keeping your flow uninterrupted.
                        </p>
                    </div>
                </div>

                {/* Feature 2: Text Left, Image Right */}
                <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-12 items-center">
                    <div className="md:col-span-5 flex flex-col justify-center space-y-6 order-last md:order-first">
                        <span className="font-mono text-xs uppercase tracking-widest text-accent underline">02 — Visual Bliss</span>
                        <h2 className="font-heading text-5xl font-medium leading-tight">
                            Designed to <br /> <span className="italic text-accent">Inspire</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            A strict atomic design system ensures consistency. Every component is crafted with obsessive attention to detail.
                        </p>
                    </div>
                    <div className="md:col-span-7">
                        <motion.div style={{ y: featureYReverse }} className="relative aspect-[16/9] overflow-hidden rounded-sm bg-secondary">
                            <Image src="https://images.pexels.com/photos/4930236/pexels-photo-4930236.jpeg" alt="Design" fill className="object-cover transition-transform duration-700" />
                        </motion.div>
                    </div>
                </div>

            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-secondary/30 py-5">
                <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground mt-2">© 2025 Anchor. Made with ❤️</p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
