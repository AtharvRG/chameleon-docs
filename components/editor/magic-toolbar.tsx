"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EDITOR_TOOLS } from "@/config/editor.config";
import { cn } from "@/lib/utils";
import { Loader2, Send, X, Sparkles } from "lucide-react";

interface MagicToolbarProps {
    isVisible: boolean;
    position: { top: number; left: number };
    onAction: (actionId: string, aiPrompt?: string) => void;
    selectedText?: string;
}

// Keyboard shortcut hints for tools
const SHORTCUT_MAP: Record<string, string> = {
    bold: "Ctrl+B",
    italic: "Ctrl+I",
    code: "Ctrl+E",
    link: "Ctrl+K",
};

// AI Quick actions
const AI_QUICK_ACTIONS = [
    { id: "simplify", label: "Simplify", prompt: "Simplify this text to be easier to understand" },
    { id: "expand", label: "Expand", prompt: "Expand this text with more details and examples" },
    { id: "fix", label: "Fix Grammar", prompt: "Fix any grammar and spelling errors in this text" },
    { id: "formal", label: "Make Formal", prompt: "Rewrite this text in a more formal and professional tone" },
];

export const MagicToolbar: React.FC<MagicToolbarProps> = ({
    isVisible,
    position,
    onAction,
    selectedText = ""
}) => {
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset AI panel when toolbar hides
    useEffect(() => {
        if (!isVisible) {
            setShowAIPanel(false);
            setAiPrompt("");
            setIsLoading(false);
        }
    }, [isVisible]);

    // Focus input when AI panel opens
    useEffect(() => {
        if (showAIPanel && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showAIPanel]);

    const handleAction = useCallback((e: React.MouseEvent, actionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (actionId === "simplify") {
            // Show AI panel instead of alert
            setShowAIPanel(true);
            return;
        }
        
        onAction(actionId);
    }, [onAction]);

    const handleAISubmit = useCallback(async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;
        
        setIsLoading(true);
        onAction("ai-edit", prompt);
        
        // The parent will handle the actual API call
        // We just trigger the action and let parent close the toolbar
    }, [onAction, isLoading]);

    const handleQuickAction = useCallback((prompt: string) => {
        handleAISubmit(prompt);
    }, [handleAISubmit]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAISubmit(aiPrompt);
        }
        if (e.key === "Escape") {
            setShowAIPanel(false);
            setAiPrompt("");
        }
    }, [aiPrompt, handleAISubmit]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                    style={{ 
                        position: 'fixed',
                        top: position.top, 
                        left: position.left,
                        zIndex: 9999,
                        willChange: 'transform, opacity'
                    }}
                    className="flex flex-col rounded-lg border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl overflow-hidden"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {/* Main Toolbar */}
                    <div className="flex items-center gap-0.5 p-1">
                        {EDITOR_TOOLS.map((group, groupIndex) => (
                            <div 
                                key={group.id} 
                                className={cn(
                                    "flex items-center gap-0.5 px-1",
                                    groupIndex < EDITOR_TOOLS.length - 1 && "border-r border-white/10"
                                )}
                            >
                                {group.items.map((tool) => {
                                    const shortcut = SHORTCUT_MAP[tool.id];
                                    const tooltipText = shortcut ? `${tool.label} (${shortcut})` : tool.label;
                                    const isAITool = tool.id === "simplify";
                                    
                                    return (
                                        <Button
                                            key={tool.id}
                                            variant="ghost"
                                            size="icon"
                                            onMouseDown={(e) => handleAction(e, tool.id)}
                                            className={cn(
                                                "h-7 w-7 text-white/70 hover:bg-white/20 hover:text-white transition-colors",
                                                (tool as any).color,
                                                isAITool && showAIPanel && "bg-purple-500/20 text-purple-400"
                                            )}
                                            title={tooltipText}
                                        >
                                            <tool.icon className="h-3.5 w-3.5" />
                                        </Button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* AI Panel */}
                    <AnimatePresence>
                        {showAIPanel && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="border-t border-white/10 overflow-hidden"
                            >
                                <div className="p-2 space-y-2">
                                    {/* Selected text preview */}
                                    {selectedText && (
                                        <div className="text-xs text-white/40 truncate max-w-[280px]">
                                            Selected: &ldquo;{selectedText.slice(0, 50)}{selectedText.length > 50 ? "..." : ""}&rdquo;
                                        </div>
                                    )}
                                    
                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap gap-1">
                                        {AI_QUICK_ACTIONS.map((action) => (
                                            <button
                                                key={action.id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleQuickAction(action.prompt);
                                                }}
                                                disabled={isLoading}
                                                className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Prompt Input */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex-1 relative">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Ask AI to edit..."
                                                disabled={isLoading}
                                                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleAISubmit(aiPrompt);
                                            }}
                                            disabled={!aiPrompt.trim() || isLoading}
                                            className="h-7 w-7 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Send className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setShowAIPanel(false);
                                                setAiPrompt("");
                                            }}
                                            className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
