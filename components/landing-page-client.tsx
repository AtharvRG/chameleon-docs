"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github, Star, Anchor } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LandingPageClient({ session }: { session: any }) {
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
                        <h1 className="font-heading text-[13vw] leading-[0.85] tracking-tighter text-white mix-blend-difference">
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
                                className="block overflow-hidden italic text-accent pb-9" // Reduced padding-bottom
                            >
                                <span className="block">Reimagined</span>
                            </motion.span>
                        </h1>
                    </div>

                    {/* Floating Images (Parallax) */}
                    <motion.div style={{ y }} className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[20%] left-[5%] w-[25vw] aspect-[3/4] overflow-hidden rounded-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Abstract" className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute bottom-[10%] right-[5%] w-[30vw] aspect-[4/3] overflow-hidden rounded-lg opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
                            <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop" alt="Minimal" className="h-full w-full object-cover" />
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

            {/* Feature Grid (Magazine Layout) */}
            <section ref={featureRef} className="container py-32 space-y-32">

                {/* Feature 1: Image Left, Text Right */}
                <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-12 items-center">
                    <div className="md:col-span-7">
                        <motion.div style={{ y: featureY }} className="relative aspect-[16/9] overflow-hidden rounded-sm bg-secondary">
                            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2670&auto=format&fit=crop" alt="Office" className="h-full w-full object-cover transition-transform duration-700" />
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
                            <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2500&auto=format&fit=crop" alt="Design" className="h-full w-full object-cover transition-transform duration-700" />
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
