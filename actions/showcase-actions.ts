"use server";

import { connectToDB } from "@/lib/db";
import Project from "@/models/Project";
import Page from "@/models/Page";

export interface ShowcaseProject {
    name: string;
    slug: string;
    emoji: string;
    description: string;
    themeColor: string;
    pageCount: number;
    updatedAt: string;
}

/**
 * Fetch public projects that have showcase enabled for the landing page
 */
export async function getPublicProjects(limit: number = 6): Promise<ShowcaseProject[]> {
    try {
        await connectToDB();

        const projects = await Project.find({
            isPublic: true,
            showInShowcase: { $ne: false }, // Include projects where showInShowcase is true or undefined (backwards compat)
        })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        // Get page counts for each project
        const projectsWithCounts = await Promise.all(
            projects.map(async (project: any) => {
                const pageCount = await Page.countDocuments({
                    projectId: project._id,
                    isPublished: true,
                });

                return {
                    name: project.name,
                    slug: project.slug,
                    emoji: project.emoji || "📚",
                    description: project.description || "Documentation project",
                    themeColor: project.theme?.color || "#6366f1",
                    pageCount,
                    updatedAt: project.updatedAt
                        ? project.updatedAt.toISOString()
                        : new Date().toISOString(),
                };
            })
        );

        return projectsWithCounts;
    } catch (error) {
        console.error("Error fetching public projects:", error);
        return [];
    }
}
