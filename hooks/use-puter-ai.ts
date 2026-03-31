"use client";

/**
 * Hook for using Cerebras AI via the /api/reimagine endpoint
 * Replaces the old PuterJS client-side AI with server-side Cerebras streaming
 */

import { useState, useCallback, useRef } from "react";

export interface UseCerebrasAIOptions {
    onStreamUpdate?: (partialContent: string) => void;
    onComplete?: (finalContent: string) => void;
    onError?: (error: Error) => void;
}

export interface UseCerebrasAIReturn {
    isLoading: boolean;
    error: Error | null;
    reimagine: (content: string, simplificationLevel: string) => Promise<string>;
    reimagineCustom: (content: string, customPrompt: string) => Promise<string>;
    abort: () => void;
}

export function useCerebrasAI(options: UseCerebrasAIOptions = {}): UseCerebrasAIReturn {
    const { onStreamUpdate, onComplete, onError } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const callAPI = useCallback(async (body: Record<string, string>): Promise<string> => {
        setIsLoading(true);
        setError(null);

        // Abort any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch("/api/reimagine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No response body");
            }

            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                onStreamUpdate?.(fullContent);
            }

            onComplete?.(fullContent);
            return fullContent;
        } catch (err) {
            if ((err as Error).name === "AbortError") {
                throw err;
            }
            const error = err instanceof Error ? err : new Error("AI request failed");
            setError(error);
            onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [onStreamUpdate, onComplete, onError]);

    const reimagine = useCallback(async (content: string, simplificationLevel: string): Promise<string> => {
        return callAPI({ content, simplificationLevel });
    }, [callAPI]);

    const reimagineCustom = useCallback(async (content: string, customPrompt: string): Promise<string> => {
        return callAPI({ content, mode: "custom", prompt: customPrompt });
    }, [callAPI]);

    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return {
        isLoading,
        error,
        reimagine,
        reimagineCustom,
        abort,
    };
}

// Backward-compatible alias
export const usePuterAI = useCerebrasAI;
export type UsePuterAIOptions = UseCerebrasAIOptions;
export type UsePuterAIReturn = UseCerebrasAIReturn;
