"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signIn } from "next-auth/react";

interface GoogleSignInButtonProps {
    callbackUrl?: string;
    onLoadingChange?: (loading: boolean) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export function GoogleSignInButton({
    callbackUrl = "/dashboard",
    onLoadingChange,
}: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCredentialResponse = useCallback(
        async (response: any) => {
            setIsProcessing(true);
            onLoadingChange?.(true);

            try {
                // Use NextAuth's signIn with the credential from Google Identity Services
                // We pass the Google ID token to our custom API endpoint first
                const res = await fetch("/api/auth/google-one-tap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credential: response.credential }),
                });

                const data = await res.json();

                if (data.success) {
                    // Sign in via NextAuth using the verified user info
                    await signIn("credentials", {
                        email: data.email,
                        password: data.oauthToken,
                        callbackUrl,
                    });
                } else {
                    console.error("Google sign-in verification failed:", data.error);
                    setIsProcessing(false);
                    onLoadingChange?.(false);
                }
            } catch (error) {
                console.error("Google sign-in error:", error);
                setIsProcessing(false);
                onLoadingChange?.(false);
            }
        },
        [callbackUrl, onLoadingChange]
    );

    useEffect(() => {
        // Load the Google Identity Services script
        if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);

        return () => {
            // Don't remove script on cleanup as other components may use it
        };
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !buttonRef.current || !window.google) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
            return;
        }

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: buttonRef.current.offsetWidth,
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
        });
    }, [scriptLoaded, handleCredentialResponse]);

    if (isProcessing) {
        return (
            <div className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-input bg-background text-base font-medium">
                <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                Signing in with Google...
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                ref={buttonRef}
                className="w-full [&>div]:!w-full [&>div>div]:!w-full"
                style={{ minHeight: 48 }}
            />
            {!scriptLoaded && (
                <div className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-input bg-background text-sm text-muted-foreground">
                    Loading Google Sign-In...
                </div>
            )}
        </div>
    );
}
