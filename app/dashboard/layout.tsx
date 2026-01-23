"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Layers, FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth-actions";
import { ChameleonLogo } from "@/components/ChameleonLogo";

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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:pl-72 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
