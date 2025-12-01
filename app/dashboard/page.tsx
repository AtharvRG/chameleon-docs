import { redirect } from "next/navigation";
import { getUserProjects } from "@/actions/project-actions";
import { hasCompletedOnboarding } from "@/actions/preference-actions";
import { DashboardClient } from "./dashboard-client";

// Disable caching for this page to always check onboarding status fresh
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    // Check if user has completed onboarding
    const onboardingComplete = await hasCompletedOnboarding();
    if (!onboardingComplete) {
        redirect("/onboarding");
    }

    const projects = await getUserProjects();
    return <DashboardClient initialProjects={projects} />;
}