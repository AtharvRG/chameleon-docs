import { auth } from "@/auth";
import { getPublicProjects } from "@/actions/showcase-actions";
import LandingPageClient from "@/components/landing-page-client";

export default async function LandingPage() {
  const session = await auth();
  const publicProjects = await getPublicProjects(6);

  return <LandingPageClient session={session} publicProjects={publicProjects} />;
}