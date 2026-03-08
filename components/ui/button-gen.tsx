import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RefreshCw, Loader2, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusButtonProps {
    onClick: () => void;
    isTransforming: boolean;
    isLoading?: boolean;
    mode: "original" | "reimagined";
    disabled?: boolean;
    className?: string;
}

interface ReimagineButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
    className?: string;
}

interface ToggleButtonProps {
    onClick: () => void;
    mode: "original" | "reimagined";
    isAnimating: boolean;
    disabled?: boolean;
    className?: string;
}

// Elegant spinner component
function ElegantSpinner({ className }: { className?: string }) {
    return (
        <motion.div
            className={cn("relative", className)}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </motion.div>
    );
}

export default function StatusButton({
    onClick,
    isTransforming,
    isLoading = false,
    mode,
    disabled,
    className
}: StatusButtonProps) {
    // Determine the current state for display
    const getCurrentState = () => {
        if (isLoading) return "loading";
        if (isTransforming) return "transforming";
        return mode;
    };

    const currentState = getCurrentState();

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || isLoading || isTransforming}
            className={cn(
                "group relative h-10 min-w-[160px] overflow-hidden rounded-md px-6 text-sm font-semibold text-white transition-all duration-200",
                // Gradient background for "Reimagine" mode
                mode === "original" && !isLoading && !isTransforming
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md hover:shadow-indigo-500/20"
                    : isLoading || isTransforming
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                    : "bg-zinc-800 hover:bg-zinc-700",
                (disabled || isLoading || isTransforming) && "cursor-not-allowed opacity-90",
                className
            )}
            animate={
                mode === "original" && !disabled && !isLoading && !isTransforming
                    ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                    : {}
            }
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
            }}
            style={{
                backgroundSize: "200% 200%",
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={currentState}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <ElegantSpinner />
                            <span>Personalizing...</span>
                        </>
                    ) : isTransforming ? (
                        <>
                            <motion.div
                                animate={{ 
                                    rotate: [0, 180, 360],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ 
                                    duration: 0.6, 
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Sparkles className="h-4 w-4" />
                            </motion.div>
                            <span>Transforming...</span>
                        </>
                    ) : mode === "reimagined" ? (
                        <>
                            <RefreshCw className="h-4 w-4" />
                            <span>Show Original</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            <span>Reimagine</span>
                        </>
                    )}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}

// ============================================================================
// REIMAGINE BUTTON - Always reimagines from original content
// ============================================================================
export function ReimagineButton({
    onClick,
    isLoading,
    disabled,
    className
}: ReimagineButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                "group relative h-10 min-w-[140px] overflow-hidden rounded-md px-5 text-sm font-semibold text-white transition-all duration-200",
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                !disabled && !isLoading && "hover:shadow-md hover:shadow-indigo-500/20",
                (disabled || isLoading) && "cursor-not-allowed opacity-70",
                className
            )}
            animate={
                !disabled && !isLoading
                    ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                    : {}
            }
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
            }}
            style={{
                backgroundSize: "200% 200%",
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isLoading ? "loading" : "idle"}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <ElegantSpinner />
                            <span>Reimagining...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            <span>Reimagine</span>
                        </>
                    )}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}

// ============================================================================
// TOGGLE BUTTON - Switches between original and reimagined content
// ============================================================================
export function ToggleButton({
    onClick,
    mode,
    isAnimating,
    disabled,
    className
}: ToggleButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || isAnimating}
            className={cn(
                "group relative h-10 min-w-[140px] overflow-hidden rounded-md px-5 text-sm font-semibold transition-all duration-200",
                mode === "reimagined" 
                    ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                    : "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30",
                (disabled || isAnimating) && "cursor-not-allowed opacity-70",
                className
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isAnimating ? "animating" : mode}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                >
                    {isAnimating ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                            >
                                <ArrowLeftRight className="h-4 w-4" />
                            </motion.div>
                            <span>Switching...</span>
                        </>
                    ) : mode === "reimagined" ? (
                        <>
                            <RefreshCw className="h-4 w-4" />
                            <span>Show Original</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            <span>Show Reimagined</span>
                        </>
                    )}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}