"use server";

import { signOut, auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Page from "@/models/Page";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function signOutAction() {
    await signOut({ redirectTo: "/" });
}

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    try {
        await connectToDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "User already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Failed to create account." };
    }
}

// Get current user data
export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) {
        return null;
    }

    try {
        await connectToDB();
        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) return null;

        return {
            name: user.name,
            email: user.email,
            image: user.image || "",
            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
            simplificationPreferences: user.simplificationPreferences || {
                techBackground: "beginner",
                primaryRole: "",
                learningStyle: "detailed",
                experienceWithDocs: "sometimes",
                preferredExplanationDepth: "moderate",
                defaultSimplificationLevel: "standard",
                hasCompletedOnboarding: false,
            },
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        return { success: false, error: "Name is required" };
    }

    try {
        await connectToDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        user.name = name.trim();
        await user.save();

        revalidatePath("/dashboard/settings");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

// Update user password
export async function updateUserPassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
        return { success: false, error: "All fields are required" };
    }

    if (newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    try {
        await connectToDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user || !user.password) {
            return { success: false, error: "User not found or no password set" };
        }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, error: "Current password is incorrect" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, error: "Failed to update password" };
    }
}

// Delete user account
export async function deleteUserAccount() {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await connectToDB();

        // Find all projects owned by the user
        const projects = await Project.find({ ownerEmail: session.user.email });

        // Delete all pages from all projects
        for (const project of projects) {
            await Page.deleteMany({ projectId: project._id });
        }

        // Delete all projects
        await Project.deleteMany({ ownerEmail: session.user.email });

        // Delete the user
        await User.deleteOne({ email: session.user.email });

        // Sign out the user
        await signOut({ redirectTo: "/" });

        return { success: true };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}