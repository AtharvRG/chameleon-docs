"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth-actions";
import { ArrowRight, Layers } from "lucide-react";
import MagneticButton from "@/components/ui/magnetic-button";
import Image from "next/image";

export default function SignupPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const res = await registerUser(formData);

        if (res.error) {
            setError(res.error);
            setIsLoading(false);
        } else {
            router.push("/login");
        }
    }

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
                            Create account
                        </h1>
                        <p className="text-muted-foreground">
                            Start building beautiful documentation today.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</label>
                                <Input name="name" placeholder="Jane Doe" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                                <Input name="email" type="email" placeholder="jane@example.com" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                                <Input name="password" type="password" placeholder="••••••••" required />
                            </div>
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <MagneticButton type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Sign Up"} <ArrowRight className="ml-2 h-4 w-4" />
                        </MagneticButton>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-foreground hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Editorial Art */}
            <div className="hidden w-1/2 bg-secondary lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                    alt="Abstract Art"
                    fill
                    className="object-cover grayscale contrast-125"
                    priority
                />
                <div className="absolute bottom-12 left-12 right-12 text-white z-20">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="h-5 w-5 text-accent" />
                        <span className="text-sm font-medium tracking-wider uppercase opacity-80">Chameleon Docs (v1 Beta)</span>
                    </div>
                    <blockquote className="font-heading text-3xl font-medium leading-tight">
                        &ldquo;Good design is obvious. Great design is transparent.&rdquo;
                    </blockquote>
                    <cite className="mt-4 block text-sm opacity-60 not-italic">— Joe Sparano</cite>
                </div>
            </div>
        </div>
    );
}