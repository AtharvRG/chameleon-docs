import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, FileWarning } from "lucide-react";

import { auth } from "@/auth";
import { getProjectDetails } from "@/actions/project-actions";
import { getProjectPages, getPageContent } from "@/actions/page-actions";
import { ReaderClient } from "./reader-client";
import { Button } from "@/components/ui/button";

// 1. Dynamic Metadata (SEO)
export async function generateMetadata({
    params
}: {
    params: { projectSlug: string }
}): Promise<Metadata> {
    const project = await getProjectDetails(params.projectSlug);

    if (!project) {
        return {
            title: "Project Not Found - Chameleon Docs",
        };
    }

    return {
        title: `${project.name} - Chameleon Docs`,
        description: project.description || `Documentation for ${project.name}`,
        openGraph: {
            title: project.name,
            description: `Read the documentation for ${project.name} on Chameleon.`,
        },
    };
}

// 2. Main Page Component
export default async function ReaderPage({
    params,
    searchParams,
}: {
    params: { projectSlug: string };
    searchParams: { page?: string };
}) {
    // A. Fetch Project Metadata
    const project = await getProjectDetails(params.projectSlug);

    if (!project) {
        return notFound();
    }

    // B. Security & Visibility Gate
    if (!project.isPublic) {
        const session = await auth();
        const isOwner = session?.user?.email === project.ownerEmail;

        if (!isOwner) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
                    <div className="flex w-full max-w-md flex-col items-center gap-6 p-8 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl">
                            <Lock className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-heading text-3xl font-bold">Private Project</h1>
                            <p className="text-muted-foreground">
                                This documentation is currently private. You must be the owner to view it.
                            </p>
                        </div>
                        <div className="flex w-full gap-4">
                            <Link href="/login" className="w-full">
                                <Button variant="default" className="w-full">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/" className="w-full">
                                <Button variant="glass" className="w-full">
                                    Go Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // C. Fetch Navigation Structure
    const pages = await getProjectPages(params.projectSlug);

    // D. Handle Empty Project State
    if (!pages || pages.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                        <FileWarning className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="font-heading text-2xl font-bold">No Pages Found</h1>
                        <p className="text-muted-foreground max-w-sm">
                            This project exists, but it doesn&apos;t have any documentation pages yet.
                        </p>
                    </div>
                    <Link href={`/dashboard/${project.slug}`}>
                        <Button variant="glass">Go to Dashboard to Create Pages</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // E. Determine Active Page
    const targetPageSlug = searchParams.page || pages[0]?.slug;

    // F. Fetch Content for the Active Page
    const activePage = await getPageContent(params.projectSlug, targetPageSlug);

    if (!activePage) {
        return notFound();
    }

    // G. Render the Client Application
    return (
        <ReaderClient
            project={project}
            pages={pages}
            activePage={activePage}
        />
    );
}