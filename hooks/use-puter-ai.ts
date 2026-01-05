"use client";

import { useState, useCallback } from "react";

const SIMPLIFICATION_PROMPTS: Record<string, string> = {
    technical: `
You are a senior principal engineer.
Rewrite the following documentation to be highly technical and rigorous.
Focus on precise terminology, implementation specifics, and edge cases.
Maintain professional tone.
Only return the modified text.
`,
    standard: `
You are a documentation editor.
Make minimal rephrasing for improved clarity.
Preserve original meaning.
Only return the modified text.
`,
    simplified: `
Rewrite the following documentation with clearer, more accessible language.
Reduce jargon without losing accuracy.
Only return the modified text.
`,
    beginner: `
Rewrite the following documentation for beginners.
Explain concepts clearly.
Only return the modified text.
`,
    noob: `
Rewrite the following documentation for complete beginners.
Assume no prior knowledge.
Only return the modified text.
`,
};

export interface UsePuterAIOptions {
    onStreamUpdate?: (partial: string) => void;
    onComplete?: (final: string) => void;
    onError?: (error: Error) => void;
}

export interface UsePuterAIReturn {
    isLoading: boolean;
    error: Error | null;
    reimagine: (content: string, level: string) => Promise<string>;
    reimagineCustom: (content: string, prompt: string) => Promise<string>;
}

export function usePuterAI(
    options: UsePuterAIOptions = {}
): UsePuterAIReturn {
    const { onStreamUpdate, onComplete, onError } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const buildPrompt = (content: string, instruction: string) =>
        `${instruction}\n\n---\n\nText:\n${content}`;

    const callPuterAI = useCallback(
        async (prompt: string): Promise<string> => {
            if (isLoading) {
                throw new Error("AI request already in progress");
            }

            if (typeof window === "undefined" || !window.puter) {
                throw new Error("PuterJS not available");
            }

            setIsLoading(true);
            setError(null);

            try {
                if (!window.puter.auth.isSignedIn()) {
                    await window.puter.auth.signIn({
                        attempt_temp_user_creation: true,
                    });
                }

                const response = await window.puter.ai.chat(prompt, {
                    model: "google/gemini-3-flash-preview",
                    stream: true,
                });

                let fullContent = "";

                if (Symbol.asyncIterator in (response as object)) {
                    for await (const chunk of response as AsyncIterable<string>) {
                        fullContent += chunk;
                        onStreamUpdate?.(fullContent);
                    }
                } else {
                    const r = response as { message?: { content?: string } };
                    fullContent = r.message?.content ?? "";
                }

                onComplete?.(fullContent);
                return fullContent;
            } catch (err) {
                const e = err instanceof Error ? err : new Error("AI failed");
                setError(e);
                onError?.(e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, onStreamUpdate, onComplete, onError]
    );

    const reimagine = (content: string, level: string) => {
        const instruction =
            SIMPLIFICATION_PROMPTS[level] ??
            SIMPLIFICATION_PROMPTS.standard;
        return callPuterAI(buildPrompt(content, instruction));
    };

    const reimagineCustom = (content: string, prompt: string) => {
        return callPuterAI(buildPrompt(content, prompt));
    };

    return {
        isLoading,
        error,
        reimagine,
        reimagineCustom,
    };
}