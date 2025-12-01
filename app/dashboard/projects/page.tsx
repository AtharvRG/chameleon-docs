import { getUserProjects } from "@/actions/project-actions";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
    const projects = await getUserProjects();

    return <ProjectsClient initialProjects={projects} />;
}
