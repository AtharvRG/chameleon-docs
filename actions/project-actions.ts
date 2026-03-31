"use server";

import { connectToDB } from "@/lib/db";
import Project from "@/models/Project";
import Page from "@/models/Page";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. Create a New Project
export async function createProject(formData: FormData) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    // Simple slugify logic
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    const ownerEmail = session.user.email;

    try {
        await connectToDB();

        // Check if slug exists
        const existing = await Project.findOne({ slug });
        if (existing) {
            // In production, you might append a random string here
            return { success: false, error: "Project name already exists" };
        }

        const newProject = await Project.create({
            name,
            slug,
            ownerEmail,
        });

        // Create a default "Introduction" page
        await Page.create({
            projectId: newProject._id,
            title: "Introduction",
            slug: "introduction",
            content: "# Welcome to " + name + "\n\nStart writing your documentation here.",
            isPublished: true,
            order: 0,
        });

        revalidatePath("/dashboard");
        return { success: true, slug: newProject.slug };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create project" };
    }
}

// 2. Fetch Projects for Dashboard
export async function getUserProjects() {
    const session = await auth();
    if (!session || !session.user?.email) return [];

    try {
        await connectToDB();
        const projects = await Project.find({ ownerEmail: session.user.email })
            .sort({ updatedAt: -1 })
            .lean();

        return projects.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
            createdAt: p.createdAt.toISOString(),
        }));
    } catch (error) {
        return [];
    }
}

// 3. Fetch Single Project Details
export async function getProjectDetails(slug: string) {
    try {
        await connectToDB();
        const project = await Project.findOne({ slug }).lean();
        if (!project) return null;

        return {
            ...project,
            _id: project._id.toString(),
        };
    } catch (error) {
        return null;
    }
}

// 4. Update Project Settings (Theme & Visibility)
export async function updateProjectSettings(
    projectSlug: string,
    settings: { color: string; font: string; isPublic: boolean; emoji?: string; showInShowcase?: boolean }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: "Unauthorized" };

        await connectToDB();

        const project = await Project.findOne({ slug: projectSlug, ownerEmail: session.user.email });

        if (!project) return { error: "Project not found" };

        project.theme.color = settings.color;
        project.theme.font = settings.font;
        project.isPublic = settings.isPublic;
        
        if (settings.emoji !== undefined) {
            project.emoji = settings.emoji;
        }

        // Update showcase visibility
        if (settings.showInShowcase !== undefined) {
            project.showInShowcase = settings.showInShowcase;
        }

        await project.save();

        revalidatePath(`/dashboard/${projectSlug}`);
        revalidatePath(`/dashboard`);
        revalidatePath(`/dashboard/projects`);
        revalidatePath(`/p/${projectSlug}`);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update settings" };
    }
}

// 4.5 Update Section Order
export async function updateSectionOrder(projectSlug: string, sectionOrder: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { error: "Unauthorized" };

        await connectToDB();

        const project = await Project.findOne({ slug: projectSlug, ownerEmail: session.user.email });
        if (!project) return { error: "Project not found" };

        project.sectionOrder = sectionOrder;
        await project.save();

        revalidatePath(`/dashboard/${projectSlug}`);
        revalidatePath(`/dashboard/${projectSlug}/editor`);
        revalidatePath(`/p/${projectSlug}`);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update section order" };
    }
}

// 5. Delete a Project
export async function deleteProject(slug: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDB();

        const project = await Project.findOne({ slug, ownerEmail: session.user.email });
        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Delete all pages associated with the project
        await Page.deleteMany({ projectId: project._id });

        // Delete the project
        await Project.deleteOne({ _id: project._id });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/projects");

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to delete project" };
    }
}

// 6. Create Project from Template
export async function createProjectFromTemplate(formData: FormData) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const templateId = formData.get("templateId") as string;
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    const ownerEmail = session.user.email;

    // Template configurations
    const templates: Record<string, { pages: { title: string; slug: string; content: string }[]; color: string }> = {
        "minimal-docs": {
            color: "#6366f1",
            pages: [
                { title: "Introduction", slug: "introduction", content: "# Introduction\n\nWelcome to your documentation. This template provides a clean starting point for your project docs." },
                { title: "Getting Started", slug: "getting-started", content: "# Getting Started\n\n## Prerequisites\n\nList what users need before they begin.\n\n## Installation\n\nStep-by-step installation guide." },
                { title: "Features", slug: "features", content: "# Features\n\nDescribe the main features of your project." },
                { title: "FAQ", slug: "faq", content: "# Frequently Asked Questions\n\n## Common Questions\n\nAnswer common questions here." },
            ],
        },
        "api-reference": {
            color: "#10b981",
            pages: [
                { title: "Overview", slug: "overview", content: "# API Overview\n\nWelcome to the API documentation. This guide will help you get started with our API." },
                { title: "Authentication", slug: "authentication", content: "# Authentication\n\n## API Keys\n\nLearn how to authenticate your API requests.\n\n```bash\ncurl -H \"Authorization: Bearer YOUR_API_KEY\" https://api.example.com\n```" },
                { title: "Endpoints", slug: "endpoints", content: "# API Endpoints\n\n## Base URL\n\n```\nhttps://api.example.com/v1\n```\n\n## Available Endpoints\n\nList your endpoints here." },
                { title: "Error Codes", slug: "error-codes", content: "# Error Codes\n\n| Code | Description |\n|------|-------------|\n| 400 | Bad Request |\n| 401 | Unauthorized |\n| 404 | Not Found |\n| 500 | Server Error |" },
                { title: "Rate Limits", slug: "rate-limits", content: "# Rate Limits\n\nOur API has rate limits to ensure fair usage.\n\n- **Standard**: 100 requests/minute\n- **Pro**: 1000 requests/minute" },
                { title: "SDKs", slug: "sdks", content: "# SDKs & Libraries\n\nOfficial SDKs available for:\n\n- JavaScript/TypeScript\n- Python\n- Go\n- Ruby" },
            ],
        },
        "product-guide": {
            color: "#f59e0b",
            pages: [
                { title: "Welcome", slug: "welcome", content: "# Welcome\n\nWelcome to our product documentation! Here you'll find everything you need to get started." },
                { title: "Quick Start", slug: "quick-start", content: "# Quick Start\n\nGet up and running in 5 minutes.\n\n## Step 1: Sign Up\n\n## Step 2: Create Your First Project\n\n## Step 3: Invite Your Team" },
                { title: "Dashboard", slug: "dashboard", content: "# Dashboard Guide\n\nLearn how to navigate and use the dashboard effectively." },
                { title: "Settings", slug: "settings", content: "# Settings\n\nConfigure your account and project settings." },
                { title: "Integrations", slug: "integrations", content: "# Integrations\n\nConnect with your favorite tools.\n\n## Available Integrations\n\n- Slack\n- GitHub\n- Jira\n- And more..." },
                { title: "Billing", slug: "billing", content: "# Billing & Plans\n\nManage your subscription and view invoices." },
            ],
        },
        "developer-portal": {
            color: "#8b5cf6",
            pages: [
                { title: "Introduction", slug: "introduction", content: "# Developer Portal\n\nWelcome to the developer documentation. Build amazing things with our platform." },
                { title: "Installation", slug: "installation", content: "# Installation\n\n```bash\nnpm install @your-package/sdk\n```\n\nOr using yarn:\n\n```bash\nyarn add @your-package/sdk\n```" },
                { title: "Configuration", slug: "configuration", content: "# Configuration\n\n## Environment Variables\n\n```env\nAPI_KEY=your_api_key\nAPI_SECRET=your_secret\n```" },
                { title: "Tutorials", slug: "tutorials", content: "# Tutorials\n\nStep-by-step guides to help you build.\n\n## Getting Started Tutorial\n\n## Advanced Integration" },
                { title: "API", slug: "api", content: "# API Reference\n\nComplete API documentation with examples." },
                { title: "Contributing", slug: "contributing", content: "# Contributing\n\nWe welcome contributions! Please read our contributing guidelines." },
            ],
        },
        "saas-docs": {
            color: "#06b6d4",
            pages: [
                { title: "Getting Started", slug: "getting-started", content: "# Getting Started\n\nStart using our platform in minutes." },
                { title: "User Guide", slug: "user-guide", content: "# User Guide\n\nEverything you need to know as a user." },
                { title: "Admin Guide", slug: "admin-guide", content: "# Admin Guide\n\nManage your organization and team settings." },
                { title: "Integrations", slug: "integrations", content: "# Integrations\n\nConnect with third-party services." },
                { title: "Security", slug: "security", content: "# Security\n\nLearn about our security practices and compliance." },
                { title: "Support", slug: "support", content: "# Support\n\nGet help when you need it.\n\n## Contact Support\n\n## Community Forum" },
            ],
        },
        "open-source": {
            color: "#ec4899",
            pages: [
                { title: "Introduction", slug: "introduction", content: "# Project Name\n\nA brief description of what this project does." },
                { title: "Installation", slug: "installation", content: "# Installation\n\n## Requirements\n\n## Quick Install\n\n```bash\nnpm install project-name\n```" },
                { title: "Usage", slug: "usage", content: "# Usage\n\nBasic usage examples.\n\n```javascript\nimport { feature } from 'project-name';\n\nfeature.doSomething();\n```" },
                { title: "API", slug: "api", content: "# API Reference\n\nDetailed API documentation." },
                { title: "Contributing", slug: "contributing", content: "# Contributing\n\nWe love contributions!\n\n## How to Contribute\n\n1. Fork the repo\n2. Create a branch\n3. Make your changes\n4. Submit a PR" },
                { title: "License", slug: "license", content: "# License\n\nMIT License\n\nCopyright (c) 2024" },
            ],
        },
        "help-center": {
            color: "#f97316",
            pages: [
                { title: "Welcome", slug: "welcome", content: "# Help Center\n\nFind answers to common questions and get support." },
                { title: "Getting Started", slug: "getting-started", content: "# Getting Started\n\nNew here? Start with these basics." },
                { title: "Account", slug: "account", content: "# Account Help\n\n## Creating an Account\n\n## Managing Your Profile\n\n## Password Reset" },
                { title: "Billing", slug: "billing", content: "# Billing Help\n\n## Payment Methods\n\n## Invoices\n\n## Refunds" },
                { title: "Troubleshooting", slug: "troubleshooting", content: "# Troubleshooting\n\nCommon issues and how to fix them." },
                { title: "Contact", slug: "contact", content: "# Contact Us\n\nCan't find what you need?\n\n- Email: support@example.com\n- Live Chat: Available 24/7" },
            ],
        },
        "security-docs": {
            color: "#ef4444",
            pages: [
                { title: "Overview", slug: "overview", content: "# Security Overview\n\nOur commitment to security and data protection." },
                { title: "Authentication", slug: "authentication", content: "# Authentication\n\n## SSO\n\n## Multi-Factor Authentication\n\n## API Authentication" },
                { title: "Authorization", slug: "authorization", content: "# Authorization\n\n## Role-Based Access Control\n\n## Permissions" },
                { title: "Encryption", slug: "encryption", content: "# Encryption\n\n## Data at Rest\n\n## Data in Transit\n\n## Key Management" },
                { title: "Compliance", slug: "compliance", content: "# Compliance\n\n## SOC 2\n\n## GDPR\n\n## HIPAA" },
                { title: "Audit Logs", slug: "audit-logs", content: "# Audit Logs\n\nTrack all security-relevant events.\n\n## What We Log\n\n## Retention Policy" },
            ],
        },
    };

    try {
        await connectToDB();

        // Check if slug exists
        const existing = await Project.findOne({ slug });
        if (existing) {
            return { success: false, error: "Project name already exists" };
        }

        const template = templates[templateId];
        const themeColor = template?.color || "#6366f1";

        const newProject = await Project.create({
            name,
            slug,
            ownerEmail,
            theme: {
                color: themeColor,
                font: "Inter",
            },
        });

        // Create pages from template
        const templatePages = template?.pages || [
            { title: "Introduction", slug: "introduction", content: `# Welcome to ${name}\n\nStart writing your documentation here.` },
        ];

        for (let i = 0; i < templatePages.length; i++) {
            await Page.create({
                projectId: newProject._id,
                title: templatePages[i].title,
                slug: templatePages[i].slug,
                content: templatePages[i].content,
                isPublished: true,
                order: i,
            });
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/templates");

        return { success: true, slug: newProject.slug };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create project from template" };
    }
}

// 7. Rename Project Slug
export async function renameProjectSlug(currentSlug: string, newSlug: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate new slug format
        const sanitizedSlug = newSlug.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        if (!sanitizedSlug || sanitizedSlug.length < 2) {
            return { success: false, error: "Slug must be at least 2 characters" };
        }
        if (sanitizedSlug !== newSlug) {
            return { success: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" };
        }

        await connectToDB();

        // Check if the project belongs to the user
        const project = await Project.findOne({ slug: currentSlug, ownerEmail: session.user.email });
        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Check if new slug already exists
        if (currentSlug !== sanitizedSlug) {
            const existing = await Project.findOne({ slug: sanitizedSlug });
            if (existing) {
                return { success: false, error: "A project with this slug already exists" };
            }
        }

        // Update the slug
        project.slug = sanitizedSlug;
        await project.save();

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/${sanitizedSlug}`);
        revalidatePath(`/p/${sanitizedSlug}`);

        return { success: true, newSlug: sanitizedSlug };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to rename project slug" };
    }
}

// 8. Export Project (returns project data + all pages as JSON)
export async function exportProject(slug: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await connectToDB();

        const project = await Project.findOne({ slug, ownerEmail: session.user.email }).lean();
        if (!project) {
            return { success: false, error: "Project not found" };
        }

        const pages = await Page.find({ projectId: project._id })
            .sort({ order: 1 })
            .lean();

        // Build export object
        const exportData = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            project: {
                name: project.name,
                slug: project.slug,
                description: project.description || "",
                emoji: project.emoji || "",
                isPublic: project.isPublic,
                theme: project.theme,
                sectionOrder: project.sectionOrder || [],
            },
            pages: pages.map((page: any) => ({
                title: page.title,
                slug: page.slug,
                content: page.content,
                section: page.section || "",
                isPublished: page.isPublished,
                order: page.order,
            })),
        };

        return { success: true, data: exportData };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to export project" };
    }
}

// 9. Import Project (creates new project from exported JSON)
export async function importProject(importData: any) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate import data structure
        if (!importData?.project?.name || !Array.isArray(importData?.pages)) {
            return { success: false, error: "Invalid import file format" };
        }

        await connectToDB();

        // Generate a unique slug
        let baseSlug = importData.project.slug || importData.project.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        let slug = baseSlug;
        let counter = 1;
        
        while (await Project.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Create the project
        const newProject = await Project.create({
            name: importData.project.name,
            slug,
            description: importData.project.description || "",
            ownerEmail: session.user.email,
            emoji: importData.project.emoji || "",
            isPublic: importData.project.isPublic || false,
            theme: importData.project.theme || { color: "#6366f1", font: "Inter" },
            sectionOrder: importData.project.sectionOrder || [],
        });

        // Create all pages
        for (let i = 0; i < importData.pages.length; i++) {
            const pageData = importData.pages[i];
            await Page.create({
                projectId: newProject._id,
                title: pageData.title,
                slug: pageData.slug,
                content: pageData.content || "",
                section: pageData.section || "",
                isPublished: pageData.isPublished ?? true,
                order: pageData.order ?? i,
            });
        }

        revalidatePath("/dashboard");

        return { success: true, slug: newProject.slug };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to import project" };
    }
}