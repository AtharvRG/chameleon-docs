"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Settings, LogOut, Layers, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth-actions";
import { ChameleonLogo } from "@/components/ChameleonLogo";
import { useState, useEffect } from "react";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Layers, label: "Projects", href: "/dashboard/projects" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 rounded-lg border border-border bg-background text-foreground p-2 shadow"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-4 top-4 bottom-4 w-64 flex flex-col rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-4 shadow-sm z-50",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[110%]",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="mb-8 flex items-center px-2">
          <Link href="/" className="flex items-center gap-2">
            <ChameleonLogo size={32} />
            <span className="font-heading font-bold text-xl">Chameleon</span>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="mt-auto border-t border-white/5 pt-4">
          <button
            onClick={() => signOutAction()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [mobileMenuOpen]);


    const SidebarContent = () => (
        <>
            <div className="mb-8 px-4 py-2 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <ChameleonLogo size={32} />
                    <span className="font-heading font-bold text-xl ">Chameleon</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="lg:hidden text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>


            <nav className="flex-1 space-y-2">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            <div className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-inner"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar-indicator"
                                        className="absolute left-0 top-1/4 h-1/2 w-1 bg-accent rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
                                <span className="transition-colors">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-white/5 pt-4">
                <button
                    onClick={() => {
                        signOutAction();
                        setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </>
    );


    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 lg:hidden bg-background/80 backdrop-blur-sm border-b z-30 flex items-center px-4">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex-1 text-center">
                    <Link href="/dashboard" className="flex items-center gap-2 justify-center" onClick={() => setMobileMenuOpen(false)}>
                        <ChameleonLogo size={24} />
                        <span className="font-heading font-bold text-lg">Chameleon</span>
                    </Link>
                </div>
                <div className="w-5"></div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}


            {/* Sidebar for mobile (sliding) and desktop (fixed) */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 flex flex-col bg-card/80 backdrop-blur-xl border-r p-4 shadow-lg z-50 transition-transform duration-300 ease-in-out",
                    "lg:left-4 lg:top-4 lg:bottom-4 lg:rounded-2xl lg:w-64 lg:translate-x-0",
                    "w-72", // Set a fixed width for the mobile sidebar
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>


            {/* Main Content Area */}
            <main className="flex-1 lg:pl-72 p-4 pt-20 lg:pt-8 lg:p-8 overflow-y-auto">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:pl-72 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
