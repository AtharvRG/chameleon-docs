"use server";

import { connectToDB } from "@/lib/db";
import Page from "@/models/Page";
import Project from "@/models/Project";
import { revalidatePath } from "next/cache";

// 1. Get all pages for a specific project
export async function getProjectPages(projectSlug: string) {
    try {
        await connectToDB();
        const project = await Project.findOne({ slug: projectSlug });
        if (!project) throw new Error("Project not found");

        const pages = await Page.find({ projectId: project._id })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        return pages.map((p: any) => ({
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            status: p.isPublished ? "Published" : "Draft",
            section: p.section || "",
            updatedAt: p.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
    }
}

// 2. Get single page content
export async function getPageContent(projectSlug: string, pageSlug: string) {
    try {
        await connectToDB();
        const project = await Project.findOne({ slug: projectSlug });
        if (!project) return null;

        const page = await Page.findOne({
            projectId: project._id,
            slug: pageSlug
        }).lean();

        if (!page) return null;

        return {
            _id: page._id.toString(),
            title: page.title,
            slug: page.slug,
            content: page.content,
            section: page.section || "",
            isPublished: page.isPublished,
        };
    } catch (error) {
        return null;
    }
}

// 3. Save Page Content
export async function updatePageContent(pageId: string, content: string) {
    try {
        await connectToDB();
        await Page.findByIdAndUpdate(pageId, {
            content,
            updatedAt: new Date()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to save" };
    }
}

// 4. Create New Page
export async function createPage(projectSlug: string, title: string, section: string = "") {
    try {
        await connectToDB();
        const project = await Project.findOne({ slug: projectSlug });
        if (!project) throw new Error("Project not found");

        const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        await Page.create({
            projectId: project._id,
            title,
            slug,
            content: "",
            section,
            isPublished: false // Default to draft
        });

        revalidatePath(`/dashboard/${projectSlug}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create page" };
    }
}

// 5. Publish Page
export async function publishPage(pageId: string, isPublished: boolean) {
    try {
        await connectToDB();
        await Page.findByIdAndUpdate(pageId, { isPublished });

        // Revalidate paths might be tricky without project slug, but usually we refresh client side
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

// 6. Update Page Section
export async function updatePageSection(pageId: string, section: string) {
    try {
        await connectToDB();
        await Page.findByIdAndUpdate(pageId, { section });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update section" };
    }
}