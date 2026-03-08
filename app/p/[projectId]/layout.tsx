"use client";

import { DocsSidebar } from "@/components/docs-sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChameleonLogo } from "@/components/ChameleonLogo";

export default function DocsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { projectId: string };
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const SidebarContent = () => (
        <div className="p-4">
            <DocsSidebar projectSlug={params.projectId} />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
             {/* Mobile Header */}
             <header className="fixed top-0 left-0 right-0 h-16 lg:hidden bg-background/80 backdrop-blur-sm border-b z-30 flex items-center px-4 justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <ChameleonLogo size={24} />
                    <span className="font-heading font-bold text-lg">Chameleon</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 -left-full w-72 h-full border-r bg-card/80 backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out lg:left-0 lg:translate-x-0",
                mobileMenuOpen && "translate-x-0"
            )}>
                 <div className="flex items-center justify-between p-4 border-b lg:hidden">
                    <h2 className="font-bold">Navigation</h2>
                    <button onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto h-full">
                    <SidebarContent />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
