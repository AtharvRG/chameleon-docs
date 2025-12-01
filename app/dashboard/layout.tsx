"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Settings, LogOut, Layers, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth-actions";

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Layers, label: "Projects", href: "/dashboard/projects" },
    { icon: FileText, label: "Templates", href: "/dashboard/templates" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Floating Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-64 hidden lg:flex flex-col rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl p-4 shadow-2xl z-50">
                <div className="mb-8 px-4 py-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-accent" />
                        <span className="font-heading font-bold text-xl ">Chameleon</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-2">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}>
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4">
                    <button
                        onClick={() => signOutAction()}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:pl-72 p-4 lg:p-8 overflow-y-auto">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
