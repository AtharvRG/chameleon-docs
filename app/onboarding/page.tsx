import { redirect } from "next/navigation";
import { hasCompletedOnboarding } from "@/actions/preference-actions";
import { OnboardingClient } from "./onboarding-client";

// Disable caching to always check fresh status
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    // If user has already completed onboarding, redirect to dashboard
    const completed = await hasCompletedOnboarding();
    console.log("[OnboardingPage Server] hasCompletedOnboarding:", completed);
    
    if (completed) {
        redirect("/dashboard");
    }

    return <OnboardingClient />;
}
