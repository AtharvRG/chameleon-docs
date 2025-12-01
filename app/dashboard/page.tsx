import { redirect } from "next/navigation";
import { getUserProjects } from "@/actions/project-actions";
import { hasCompletedOnboarding } from "@/actions/preference-actions";
import { DashboardClient } from "./dashboard-client";

// Disable caching for this page to always check onboarding status fresh
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    // ARTIFICIAL DELAY: Wait 3 seconds to demonstrate the loading animation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check if user has completed onboarding
    const onboardingComplete = await hasCompletedOnboarding();
    if (!onboardingComplete) {
        redirect("/onboarding");
    }

    const projects = await getUserProjects();
    return <DashboardClient initialProjects={projects} />;
}