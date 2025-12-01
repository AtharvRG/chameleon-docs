"use client";

import { useFormState } from "react-dom";
import { authenticate } from "@/actions/login-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";

export default function LoginPage() {
    // @ts-ignore - Types for useFormState in Next.js 14 can be strict regarding initial state
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 xl:px-24">
                <div className="mx-auto w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <Link href="/" className="font-heading text-xl font-bold tracking-tight">
                            Chameleon
                        </Link>
                        <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Email
                                </label>
                                <Input name="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Password
                                    </label>
                                    <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                                        Forgot?
                                    </Link>
                                </div>
                                <Input name="password" type="password" placeholder="••••••••" required />
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="text-sm text-destructive text-center">{errorMessage}</p>
                        )}

                        <MagneticButton type="submit" className="w-full" size="lg">
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </MagneticButton>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-bold underline underline-offset-4 text-foreground hover:text-primary transition-colors">
                            Create one
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Editorial Art */}
            <div className="hidden w-1/2 bg-secondary lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <img
                    src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop"
                    alt="Abstract Art"
                    className="h-full w-full object-cover grayscale contrast-125"
                />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <span className="text-sm font-medium tracking-wider uppercase opacity-80">Chameleon Docs (v1 Beta)</span>
                    </div>
                    <blockquote className="font-heading text-3xl font-medium leading-tight">
                        &ldquo;The details are not the details. They make the design.&rdquo;
                    </blockquote>
                    <cite className="mt-4 block text-sm opacity-60 not-italic">— Charles Eames</cite>
                </div>
            </div>
        </div>
    );
}