"use client";

import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { ChameleonLogo } from "@/components/ChameleonLogo";

export function SiteFooter() {
    return (
        <footer className="border-t border-border bg-secondary/30 py-8 backdrop-blur-sm">
            <div className="container flex flex-col gap-8 md:flex-row md:justify-between">
                {/* Brand */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <ChmeleonLogo size={24} />
                        <span className="font-heading font-bold text-lg">Chameleon Docs</span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Beautiful, adaptive documentation for modern engineering teams.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                        © {new Date().getFullYear()} Chameleon Docs. All rights reserved.
                    </p>
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-sm">Product</h3>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Documentation
                        </Link>
                        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                        <Link href="https://github.com/AtharvRG/chameleon-docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            GitHub
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-sm">Community</h3>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Twitter
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Discord
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Contributing
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-sm">Legal</h3>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
