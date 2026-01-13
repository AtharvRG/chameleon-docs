"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github, Star } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPageClient({ session }: { session: any }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const featureRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: featureScroll } = useScroll({
    target: featureRef,
    offset: ["start end", "end start"],
  });

  const featureY = useTransform(featureScroll, [0, 1], ["0%", "-10%"]);
  const featureYReverse = useTransform(featureScroll, [0, 1], ["0%", "10%"]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[200vh] bg-background text-foreground overflow-x-hidden"
    >
      {/* NAV */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md shadow-lg sm:w-auto">
          <Link href="/" className="font-heading font-bold text-sm sm:text-lg">
            Chameleon Docs
          </Link>

          <div className="mx-2 hidden h-4 w-px bg-border/50 sm:block" />

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            {session ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex h-screen flex-col items-center justify-center px-4">
        <div className="container relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16 flex items-center rounded-full bg-secondary/50 px-4 py-1.5 text-sm"
          >
            <Star className="h-4 w-4 text-accent" />
            <span className="ml-2">v1 Beta</span>
          </motion.div>

          <div className="mt-6 text-center">
            <h1 className="font-heading text-[12vw] leading-[0.9] sm:text-[13vw]">
              <span className="block">Documentation</span>
              <span className="block italic text-accent">Reimagined</span>
            </h1>
          </div>

          <motion.div
            style={{ y }}
            className="pointer-events-none absolute inset-0 hidden sm:block"
          >
            <div className="absolute top-[20%] left-[5%] w-[25vw] rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
                alt="Abstract"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-[10%] right-[5%] w-[30vw] rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe"
                alt="Minimal"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-lg">
              Craft living knowledge bases that adapt to your team.
              <span className="font-bold text-accent"> Beautiful by default.</span>
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={session ? "/dashboard" : "/signup"}>
                <MagneticButton>
                  Start Building <ArrowUpRight className="ml-2 h-4 w-4" />
                </MagneticButton>
              </Link>
              <Link href="https://github.com/AtharvRG/chameleon-docs">
                <MagneticButton variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </MagneticButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={featureRef}
        className="container space-y-32 px-4 py-32"
      >
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <motion.div style={{ y: featureY }} className="relative aspect-video">
              <Image
                src="https://images.pexels.com/photos/17709307/pexels-photo-17709307.jpeg"
                alt="Office"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
          <div className="md:col-span-5">
            <h2 className="font-heading text-4xl">
              Instant <span className="italic text-accent">Gratification</span>
            </h2>
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
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <h2 className="font-heading text-4xl">
              Designed to <span className="italic text-accent">Inspire</span>
            </h2>
          </div>
          <div className="md:col-span-7">
            <motion.div style={{ y: featureYReverse }} className="relative aspect-video">
              <Image
                src="https://images.pexels.com/photos/4930236/pexels-photo-4930236.jpeg"
                alt="Design"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
