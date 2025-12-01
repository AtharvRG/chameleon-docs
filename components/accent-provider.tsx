"use client";

import { useEffect } from "react";

const THEME_CLASSES = [
    'theme-indigo',
    'theme-violet', 
    'theme-blue',
    'theme-cyan',
    'theme-teal',
    'theme-green',
    'theme-orange',
    'theme-rose'
];

export function AccentProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Get saved accent color from localStorage
        const savedAccent = localStorage.getItem("chameleon-accent") || "indigo";
        
        // Remove all theme classes first
        document.documentElement.classList.remove(...THEME_CLASSES);
        
        // Add the saved accent color theme class
        document.documentElement.classList.add(`theme-${savedAccent}`);
    }, []);

    return <>{children}</>;
}