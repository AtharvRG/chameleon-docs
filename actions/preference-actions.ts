"use server";

import { auth } from "@/auth";
import { connectToDB } from "@/lib/db";
import User, { ISimplificationPreferences, SimplificationLevel } from "@/models/User";
import { revalidatePath } from "next/cache";

// Get user's simplification preferences
export async function getUserPreferences() {
    const session = await auth();
    if (!session?.user?.email) {
        return null;
    }

    try {
        await connectToDB();
        const user = await User.findOne({ email: session.user.email }).lean();
        if (!user) return null;

        return user.simplificationPreferences || {
            techBackground: "beginner",
            primaryRole: "",
            learningStyle: "detailed",
            experienceWithDocs: "sometimes",
            preferredExplanationDepth: "moderate",
            defaultSimplificationLevel: "standard",
            hasCompletedOnboarding: false,
        };
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return null;
    }
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding() {
    const session = await auth();
    if (!session?.user?.email) {
        console.log("hasCompletedOnboarding: No session");
        return false;
    }

    try {
        await connectToDB();
        // Use findOne without lean() to get Mongoose document with defaults
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            console.log("hasCompletedOnboarding: User not found");
            return false;
        }
        
        const completed = user.simplificationPreferences?.hasCompletedOnboarding === true;
        console.log("hasCompletedOnboarding:", completed, "for user:", session.user.email);
        return completed;
    } catch (error) {
        console.error("Error checking onboarding:", error);
        return false;
    }
}

// Save onboarding preferences (complete onboarding flow)
export async function saveOnboardingPreferences(preferences: {
    techBackground: string;
    primaryRole: string;
    learningStyle: string;
    experienceWithDocs: string;
    preferredExplanationDepth: string;
}) {
    const session = await auth();
    if (!session?.user?.email) {
        console.log("saveOnboardingPreferences: No session");
        return { success: false, error: "Unauthorized" };
    }

    try {
        await connectToDB();

        // Calculate default simplification level based on tech background
        let defaultLevel: SimplificationLevel = "standard";
        switch (preferences.techBackground) {
            case "none":
                defaultLevel = "noob";
                break;
            case "beginner":
                defaultLevel = "beginner";
                break;
            case "intermediate":
                defaultLevel = "simplified";
                break;
            case "advanced":
                defaultLevel = "standard";
                break;
            case "expert":
                defaultLevel = "technical";
                break;
        }

        // Use findOneAndUpdate with $set for reliable nested field update
        // Using upsert: false since user should exist, and explicitly setting nested object
        const result = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    simplificationPreferences: {
                        techBackground: preferences.techBackground,
                        primaryRole: preferences.primaryRole,
                        learningStyle: preferences.learningStyle,
                        experienceWithDocs: preferences.experienceWithDocs,
                        preferredExplanationDepth: preferences.preferredExplanationDepth,
                        defaultSimplificationLevel: defaultLevel,
                        hasCompletedOnboarding: true,
                    }
                }
            },
            { new: true }
        );

        if (!result) {
            console.log("saveOnboardingPreferences: User not found");
            return { success: false, error: "User not found" };
        }

        console.log("saveOnboardingPreferences: Saved successfully, hasCompletedOnboarding:", result.simplificationPreferences?.hasCompletedOnboarding);

        revalidatePath("/dashboard");
        revalidatePath("/onboarding");

        return { success: true };
    } catch (error) {
        console.error("Error saving preferences:", error);
        return { success: false, error: "Failed to save preferences" };
    }
}

// Update preferences from settings
export async function updatePreferences(preferences: Partial<ISimplificationPreferences>) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await connectToDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Merge with existing preferences
        user.simplificationPreferences = {
            ...user.simplificationPreferences,
            ...preferences,
        };

        await user.save();

        revalidatePath("/dashboard/settings");

        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
}

// Update just the default simplification level
export async function updateDefaultSimplificationLevel(level: SimplificationLevel) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await connectToDB();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (!user.simplificationPreferences) {
            user.simplificationPreferences = {
                techBackground: "beginner",
                primaryRole: "",
                learningStyle: "detailed",
                experienceWithDocs: "sometimes",
                preferredExplanationDepth: "moderate",
                defaultSimplificationLevel: level,
                hasCompletedOnboarding: false,
            };
        } else {
            user.simplificationPreferences.defaultSimplificationLevel = level;
        }

        await user.save();

        return { success: true };
    } catch (error) {
        console.error("Error updating level:", error);
        return { success: false, error: "Failed to update level" };
    }
}
