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
