import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth-actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return <SettingsClient user={user} />;
}
