import { auth } from "@/auth";
import LandingPageClient from "@/components/landing-page-client";

export default async function LandingPage() {
  const session = await auth();

  return <LandingPageClient session={session} />;
}