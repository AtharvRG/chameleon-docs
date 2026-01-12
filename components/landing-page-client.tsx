"use client";

import Link from "next/link";
import Image from "next/image";
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
                                className="block overflow-hidden italic text-accent pb-9" // Reduced padding-bottom
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
            <footer className="relative border-t border-border bg-gradient-to-br from-secondary/50 via-secondary/30 to-background overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="container relative z-10 py-16">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
                        {/* Brand Section */}
                        <div className="md:col-span-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h3 className="font-heading text-3xl font-bold tracking-tighter mb-4">
                                    Chameleon<span className="text-accent italic">Docs</span>
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                                    Documentation that adapts to your vision. Create beautiful, interactive documentation 
                                    that your users will actually love to read.
                                </p>
                                <div className="flex items-center gap-3 mt-6">
                                    <Link 
                                        href="https://github.com" 
                                        className="group flex items-center justify-center h-10 w-10 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-300"
                                    >
                                        <Github className="h-4 w-4 text-foreground group-hover:text-accent-foreground transition-colors" />
                                    </Link>
                                    <Link 
                                        href="https://twitter.com" 
                                        className="group flex items-center justify-center h-10 w-10 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-300"
                                    >
                                        <svg className="h-4 w-4 text-foreground group-hover:text-accent-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </Link>
                                    <Link 
                                        href="https://linkedin.com" 
                                        className="group flex items-center justify-center h-10 w-10 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-300"
                                    >
                                        <svg className="h-4 w-4 text-foreground group-hover:text-accent-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Navigation Sections */}
                        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                            {/* Product */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <h4 className="font-heading font-semibold text-sm tracking-wide uppercase mb-4">Product</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Features
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard/templates" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Templates
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Pricing
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Changelog
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Resources */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <h4 className="font-heading font-semibold text-sm tracking-wide uppercase mb-4">Resources</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Documentation
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Blog
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Support
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            API Reference
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Company */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <h4 className="font-heading font-semibold text-sm tracking-wide uppercase mb-4">Company</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            About
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Careers
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Contact
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group">
                                            Partners
                                            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="pt-8 border-t border-border/50"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <p>© 2026 Chameleon Docs. Made with ❤️</p>
                                <span className="hidden md:inline">•</span>
                                <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
                                <span>•</span>
                                <Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Built for creators, by creators</span>
                                <Anchor className="h-3.5 w-3.5 text-accent" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}
