"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProjectPages } from '@/actions/page-actions';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageLink = {
    _id: string;
    title: string;
    slug: string;
    section: string;
};

type GroupedPages = {
    [section: string]: PageLink[];
};

function groupPagesBySection(pages: PageLink[]) {
    return pages.reduce((acc, page) => {
        const section = page.section || 'General';
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(page);
        return acc;
    }, {} as GroupedPages);
}

export function DocsSidebar({ projectSlug }: { projectSlug: string }) {
    const [pages, setPages] = useState<GroupedPages>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const pathname = usePathname();

    useEffect(() => {
        async function fetchPages() {
            const pageData = await getProjectPages(projectSlug);
            const activePage = pageData.find(p => pathname.endsWith(p.slug));
            const activeSection = activePage?.section || 'General';

            setPages(groupPagesBySection(pageData as PageLink[]));
            setOpenSections(prev => ({ ...prev, [activeSection]: true }));
        }
        fetchPages();
    }, [projectSlug, pathname]);
    
    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const sortedSections = Object.keys(pages).sort();

    return (
        <nav className="space-y-4">
            {sortedSections.map(section => (
                <div key={section}>
                    <button
                        onClick={() => toggleSection(section)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold rounded-lg text-muted-foreground hover:bg-muted"
                    >
                        <span>{section}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", openSections[section] ? 'rotate-180' : '')} />
                    </button>
                    {openSections[section] && (
                        <div className="mt-2 space-y-1 ml-4 border-l border-border pl-4">
                            {pages[section].map(page => {
                                const isActive = pathname.endsWith(`/${page.slug}`);
                                return (
                                    <Link
                                        key={page._id}
                                        href={`/p/${projectSlug}/${page.slug}`}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                                            isActive
                                                ? "bg-accent text-accent-foreground font-medium"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <FileText className="h-4 w-4" />
                                        {page.title}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}
