"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Moon,
    Sun,
    Laptop
} from "lucide-react";
import { useTheme } from "next-themes";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { getUserProjects } from "@/actions/project-actions";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [projects, setProjects] = React.useState<any[]>([]);
    const router = useRouter();
    const { setTheme } = useTheme();
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Toggle Shortcut
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Fetch Data & Focus
    React.useEffect(() => {
        if (open) {
            getUserProjects().then((data) => setProjects(data));
            // Force focus after animation starts
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    }, [open]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <Command className="border-none bg-transparent">
                    <CommandInput ref={inputRef} placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup heading="Suggestions">
                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/new"))}>
                                <FileText className="mr-2 h-4 w-4" />
                                Create New Project
                            </CommandItem>
                        </CommandGroup>

                        <CommandGroup heading="Your Projects">
                            {projects.map((project) => (
                                <CommandItem
                                    key={project._id}
                                    onSelect={() => runCommand(() => router.push(`/dashboard/${project.slug}`))}
                                >
                                    <div className="mr-2 h-2 w-2 rounded-full bg-indigo-500" />
                                    {project.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandGroup heading="Theme">
                            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                                <Sun className="mr-2 h-4 w-4" /> Light Mode
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                                <Moon className="mr-2 h-4 w-4" /> Dark Mode
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                                <Laptop className="mr-2 h-4 w-4" /> System
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        </div>
    );
}   