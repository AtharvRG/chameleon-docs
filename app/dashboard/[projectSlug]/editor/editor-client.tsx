"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Save, ChevronLeft, Check, Settings, MonitorPlay, ChevronDown, ChevronRight, X, Eye, GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicToolbar } from "@/components/editor/magic-toolbar";
import { updatePageContent, publishPage, updatePageSection } from "@/actions/page-actions";
import { cn, getTextareaCaretCoordinates } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Custom smooth scroll hook for nested containers
function useSmoothScroll(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let targetScroll = element.scrollTop;
        let currentScroll = element.scrollTop;
        let animationId: number | null = null;
        let isWheeling = false;
        const ease = 0.12;

        const animate = () => {
            const diff = targetScroll - currentScroll;
            
            if (Math.abs(diff) > 0.5) {
                currentScroll += diff * ease;
                element.scrollTop = currentScroll;
                animationId = requestAnimationFrame(animate);
            } else {
                currentScroll = targetScroll;
                element.scrollTop = targetScroll;
                animationId = null;
                isWheeling = false;
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            isWheeling = true;
            const maxScroll = element.scrollHeight - element.clientHeight;
            targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY));
            if (!animationId) {
                animationId = requestAnimationFrame(animate);
            }
        };

        // Sync internal state when scroll changes externally (e.g., programmatic changes)
        const handleScroll = () => {
            if (!isWheeling && !animationId) {
                // External scroll change - sync our state
                targetScroll = element.scrollTop;
                currentScroll = element.scrollTop;
            }
        };

        element.addEventListener('wheel', handleWheel, { passive: false });
        element.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            element.removeEventListener('wheel', handleWheel);
            element.removeEventListener('scroll', handleScroll);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [ref]);
}

// Undo/Redo History Hook
interface HistoryState {
    content: string;
    cursorPos: number;
}

function useHistory(initialContent: string) {
    const [history, setHistory] = useState<HistoryState[]>([{ content: initialContent, cursorPos: 0 }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    const pushHistory = useCallback((content: string, cursorPos: number) => {
        setHistory(prev => {
            // Remove any future states if we're not at the end
            const newHistory = prev.slice(0, historyIndex + 1);
            // Don't push if content is the same as current
            if (newHistory[newHistory.length - 1]?.content === content) {
                return newHistory;
            }
            // Limit history to 100 entries
            const limited = newHistory.length >= 100 ? newHistory.slice(1) : newHistory;
            return [...limited, { content, cursorPos }];
        });
        setHistoryIndex(prev => Math.min(prev + 1, 99));
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            return history[historyIndex - 1];
        }
        return null;
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            return history[historyIndex + 1];
        }
        return null;
    }, [history, historyIndex]);

    const reset = useCallback((content: string) => {
        setHistory([{ content, cursorPos: 0 }]);
        setHistoryIndex(0);
    }, []);

    return { pushHistory, undo, redo, reset, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1 };
}

interface EditorClientProps {
    projectSlug: string;
    pages: any[];
    activePage: {
        _id: string;
        title: string;
        content: string;
        slug: string;
        section?: string;
        isPublished: boolean;
    };
}

export function EditorClient({ projectSlug, pages, activePage }: EditorClientProps) {
    const [content, setContent] = useState(activePage.content);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings State
    const [section, setSection] = useState(activePage.section || "");
    const [isPublished, setIsPublished] = useState(activePage.isPublished);

    // Toolbar State
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    // Sidebar State
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const router = useRouter();
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const sidebarContainerRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // History for undo/redo
    const { pushHistory, undo, redo, reset: resetHistory } = useHistory(activePage.content);

    // Apply smooth scroll to both containers
    useSmoothScroll(editorContainerRef as React.RefObject<HTMLElement>);
    useSmoothScroll(sidebarContainerRef as React.RefObject<HTMLElement>);
    useSmoothScroll(sidebarContainerRef as React.RefObject<HTMLElement>);

    // Reset state when switching pages
    useEffect(() => {
        setContent(activePage.content);
        setSection(activePage.section || "");
        setIsPublished(activePage.isPublished);
        setLastSaved(false);
        resetHistory(activePage.content);
    }, [activePage, resetHistory]);

    // Group pages logic - memoized for performance
    const groupedPages = useMemo(() => {
        return pages.reduce((acc: any, page: any) => {
            const sec = page.section || "Uncategorized";
            if (!acc[sec]) acc[sec] = [];
            acc[sec].push(page);
            return acc;
        }, {});
    }, [pages]);

    const sections = useMemo(() => {
        return Object.keys(groupedPages).sort((a, b) =>
            a === "Uncategorized" ? -1 : b === "Uncategorized" ? 1 : a.localeCompare(b)
        );
    }, [groupedPages]);

    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        sections.forEach(s => initialExpanded[s] = true);
        setExpandedSections(initialExpanded);
    }, [sections]);

    const toggleSection = useCallback((sec: string) => {
        setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
    }, []);

    // --- SAVE FUNCTION ---
    const handleSave = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);
        const res = await updatePageContent(activePage._id, content);
        setIsSaving(false);
        if (res.success) {
            setLastSaved(true);
            setTimeout(() => setLastSaved(false), 2000);
        }
    }, [activePage._id, content, isSaving]);

    // --- TOOLBAR POSITION CALCULATION ---
    const updateToolbarPosition = useCallback(() => {
        const textarea = editorRef.current;
        const container = editorContainerRef.current;
        if (!textarea || !container) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Hide if no selection
        if (start === end) {
            setToolbarVisible(false);
            return;
        }

        // Store selection for toolbar actions
        setSelection({ start, end });

        // Get accurate caret coordinates using the mirror div technique
        const startCoords = getTextareaCaretCoordinates(textarea, start);
        const endCoords = getTextareaCaretCoordinates(textarea, end);

        // Get textarea position on screen
        const textareaRect = textarea.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate the midpoint of the selection for horizontal centering
        const selectionMidX = (startCoords.left + endCoords.left) / 2;

        // Account for textarea scroll position
        const scrollTop = textarea.scrollTop;
        const scrollLeft = textarea.scrollLeft;

        // Calculate screen position (relative to viewport)
        const relativeTop = startCoords.top - scrollTop;
        const relativeLeft = selectionMidX - scrollLeft;

        // Toolbar dimensions
        const toolbarHeight = 44;
        const toolbarWidth = 300;
        const gap = 8;

        // Position toolbar above the selection
        let top = textareaRect.top + relativeTop - toolbarHeight - gap;
        let left = textareaRect.left + relativeLeft - (toolbarWidth / 2);

        // If toolbar would go above the visible container area, position it below the selection
        if (top < containerRect.top + 10) {
            top = textareaRect.top + relativeTop + startCoords.height + gap;
        }

        // Check if selection is visible in the container
        const selectionScreenTop = textareaRect.top + relativeTop;
        const selectionScreenBottom = selectionScreenTop + startCoords.height;
        
        // Hide toolbar if selection is scrolled out of visible area
        if (selectionScreenBottom < containerRect.top || selectionScreenTop > containerRect.bottom) {
            setToolbarVisible(false);
            return;
        }

        // Clamp horizontal position to viewport
        left = Math.max(10, Math.min(left, window.innerWidth - toolbarWidth - 10));
        
        // Clamp vertical position to viewport
        top = Math.max(10, Math.min(top, window.innerHeight - toolbarHeight - 10));

        setToolbarVisible(true);
        setToolbarPos({ top, left });
    }, []);

    // Handle text selection
    const handleSelect = useCallback(() => {
        // Small delay to ensure selection is complete
        requestAnimationFrame(updateToolbarPosition);
    }, [updateToolbarPosition]);

    // Hide toolbar on scroll
    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            if (toolbarVisible) setToolbarVisible(false);
        };
        
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [toolbarVisible]);

    // --- AI EDIT HANDLER ---
    const handleAIEdit = useCallback(async (prompt: string) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = selection.start;
        const end = selection.end;
        const selectedText = content.substring(start, end);
        
        if (!selectedText.trim()) return;

        try {
            const response = await fetch("/api/reimagine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: selectedText,
                    mode: "custom",
                    prompt: prompt
                }),
            });

            if (!response.ok) throw new Error("AI request failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let result = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    result += decoder.decode(value);
                }
            }

            // Replace selected text with AI result
            const newText = content.substring(0, start) + result + content.substring(end);
            setContent(newText);
            pushHistory(newText, start + result.length);
            setToolbarVisible(false);

            // Restore focus
            requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start + result.length);
            });
        } catch (error) {
            console.error("AI Edit Error:", error);
            alert("Failed to process AI edit. Please try again.");
        }
    }, [content, selection, pushHistory]);

    // --- APPLY MARKDOWN FORMATTING ---
    const applyFormatting = useCallback((actionId: string, customStart?: number, customEnd?: number) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = customStart ?? selection.start;
        const end = customEnd ?? selection.end;
        const selectedText = content.substring(start, end);
        let newText = content;
        let newCursorPos = end;
        let newSelectionStart = start;

        switch (actionId) {
            case "bold":
                newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
                newCursorPos = end + 4;
                newSelectionStart = start + 2;
                break;
            case "italic":
                newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
                newCursorPos = end + 2;
                newSelectionStart = start + 1;
                break;
            case "code":
                newText = content.substring(0, start) + `\`${selectedText}\`` + content.substring(end);
                newCursorPos = end + 2;
                newSelectionStart = start + 1;
                break;
            case "h1": {
                const lineStart = content.lastIndexOf("\n", start - 1) + 1;
                newText = content.substring(0, lineStart) + "# " + content.substring(lineStart);
                newCursorPos = end + 2;
                break;
            }
            case "h2": {
                const lineStart = content.lastIndexOf("\n", start - 1) + 1;
                newText = content.substring(0, lineStart) + "## " + content.substring(lineStart);
                newCursorPos = end + 3;
                break;
            }
            case "list": {
                const lineStart = content.lastIndexOf("\n", start - 1) + 1;
                newText = content.substring(0, lineStart) + "- " + content.substring(lineStart);
                newCursorPos = end + 2;
                break;
            }
            case "quote": {
                const lineStart = content.lastIndexOf("\n", start - 1) + 1;
                newText = content.substring(0, lineStart) + "> " + content.substring(lineStart);
                newCursorPos = end + 2;
                break;
            }
            case "link":
                newText = content.substring(0, start) + `[${selectedText}](url)` + content.substring(end);
                newCursorPos = end + 7;
                break;
            default:
                return;
        }

        setContent(newText);
        pushHistory(newText, newCursorPos);
        setToolbarVisible(false);

        // Restore focus and cursor
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        });
    }, [content, selection, pushHistory]);

    // Toolbar action handler
    const handleToolbarAction = useCallback((actionId: string, aiPrompt?: string) => {
        if (actionId === "ai-edit" && aiPrompt) {
            handleAIEdit(aiPrompt);
            return;
        }
        applyFormatting(actionId);
    }, [applyFormatting, handleAIEdit]);

    // Get selected text for toolbar
    const selectedText = useMemo(() => {
        return content.substring(selection.start, selection.end);
    }, [content, selection]);

    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;

            // Ctrl+S - Save
            if (isMod && e.key === 's') {
                e.preventDefault();
                handleSave();
                return;
            }

            // Ctrl+Z - Undo
            if (isMod && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                const prev = undo();
                if (prev) {
                    setContent(prev.content);
                    requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(prev.cursorPos, prev.cursorPos);
                    });
                }
                return;
            }

            // Ctrl+Y or Ctrl+Shift+Z - Redo
            if ((isMod && e.key === 'y') || (isMod && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                const next = redo();
                if (next) {
                    setContent(next.content);
                    requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(next.cursorPos, next.cursorPos);
                    });
                }
                return;
            }

            // Only apply formatting shortcuts when there's a selection
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            if (start !== end) {
                // Ctrl+B - Bold
                if (isMod && e.key === 'b') {
                    e.preventDefault();
                    applyFormatting('bold', start, end);
                    return;
                }

                // Ctrl+I - Italic
                if (isMod && e.key === 'i') {
                    e.preventDefault();
                    applyFormatting('italic', start, end);
                    return;
                }

                // Ctrl+E - Inline Code
                if (isMod && e.key === 'e') {
                    e.preventDefault();
                    applyFormatting('code', start, end);
                    return;
                }

                // Ctrl+K - Link
                if (isMod && e.key === 'k') {
                    e.preventDefault();
                    applyFormatting('link', start, end);
                    return;
                }
            }
        };

        textarea.addEventListener('keydown', handleKeyDown);
        return () => textarea.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, undo, redo, applyFormatting]);

    // --- CONTENT CHANGE HANDLER ---
    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const cursorPos = e.target.selectionStart;
        setContent(newContent);
        
        // Debounce history push to avoid too many entries
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            pushHistory(newContent, cursorPos);
        }, 500);
    }, [pushHistory]);

    const handleSaveSettings = useCallback(async () => {
        setIsSaving(true);
        await updatePageSection(activePage._id, section);
        await publishPage(activePage._id, isPublished);
        setIsSaving(false);
        setShowSettings(false);
        router.refresh();
    }, [activePage._id, section, isPublished, router]);

    // Auto-resize textarea to fit content
    useEffect(() => {
        const textarea = editorRef.current;
        const container = editorContainerRef.current;
        if (!textarea) return;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            // Save the current scroll position of the container
            const savedScrollTop = container?.scrollTop ?? 0;
            
            // Use scrollHeight directly without collapsing to 0
            // This avoids the jarring scroll jump
            const minHeight = 400;
            const currentHeight = parseInt(textarea.style.height) || minHeight;
            
            // Set to auto to get the natural scrollHeight
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const newHeight = Math.max(scrollHeight, minHeight);
            textarea.style.height = `${newHeight}px`;
            
            // Restore the scroll position immediately
            if (container && Math.abs(container.scrollTop - savedScrollTop) > 1) {
                container.scrollTop = savedScrollTop;
            }
        });
    }, [content, activePage._id]); // Also re-run when page changes

    // Reset scroll position when switching pages
    useEffect(() => {
        const container = editorContainerRef.current;
        if (container) {
            container.scrollTop = 0;
        }
    }, [activePage._id]);

    return (
        <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
            {/* Header - Fixed */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl z-40">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/${projectSlug}`}>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{projectSlug} /</span>
                        <span className="text-sm font-bold">{activePage.title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                    {lastSaved ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-400 bg-green-600/10 hover:bg-green-600/20 cursor-default"
                            disabled
                        >
                            <Check className="mr-2 h-4 w-4" /> Saved
                        </Button>
                    ) : (
                        <Button variant="glass" size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </>
                            )}
                        </Button>
                    )}
                    <Link href={`/p/${projectSlug}?page=${activePage.slug}`} target="_blank">
                        <Button variant="default" size="sm">
                            <MonitorPlay className="mr-2 h-4 w-4" /> View Live
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Resizable Panels Layout */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full w-full">
                    {/* Sidebar Panel */}
                    <Panel defaultSize={20} minSize={15} maxSize={30} className="flex flex-col border-r border-white/10 bg-black/5 h-full">
                        <div 
                            ref={sidebarContainerRef}
                            className="h-full overflow-y-auto p-4 editor-scroll-area" 
                            data-lenis-prevent
                        >
                            <nav className="space-y-4">
                                {sections.map(sec => (
                                    <div key={sec}>
                                        {sec !== "Uncategorized" && (
                                            <button onClick={() => toggleSection(sec)} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 w-full text-left hover:text-foreground transition-colors">
                                                {expandedSections[sec] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                {sec}
                                            </button>
                                        )}
                                        {(sec === "Uncategorized" || expandedSections[sec]) && (
                                            <div className="space-y-1 pl-2 border-l border-white/10 ml-1">
                                                {groupedPages[sec].map((page: any) => (
                                                    <div key={page._id} onClick={() => router.push(`?page=${page.slug}`)} className={cn("cursor-pointer rounded-r-md px-3 py-1.5 text-sm truncate transition-colors", page.slug === activePage.slug ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[1px]" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                                                        {page.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-white/5 hover:bg-primary/50 transition-colors flex items-center justify-center cursor-col-resize group">
                        <GripVertical className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50" />
                    </PanelResizeHandle>

                    {/* Main Editor Panel */}
                    <Panel className="flex flex-col bg-background h-full">
                        <div 
                            ref={editorContainerRef}
                            className="h-full overflow-y-auto editor-scroll-area"
                            data-lenis-prevent
                        >
                            <div className="mx-auto max-w-3xl py-10 px-8">
                                <h1 className="mb-8 w-full bg-transparent font-heading text-4xl font-bold text-foreground outline-none">
                                    {activePage.title}
                                </h1>

                                <GlassCard className="p-0" gradient={false}>
                                    <textarea
                                        ref={editorRef}
                                        value={content}
                                        onChange={handleContentChange}
                                        onSelect={handleSelect}
                                        onMouseUp={handleSelect}
                                        onKeyUp={handleSelect}
                                        className="w-full resize-none bg-transparent p-8 font-mono text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/30 block"
                                        spellCheck={false}
                                        placeholder="# Start writing with Markdown..."
                                        style={{ 
                                            overflow: 'hidden',
                                            minHeight: '400px'
                                        }}
                                    />
                                </GlassCard>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            {/* TOOLBAR OVERLAY */}
            <MagicToolbar
                isVisible={toolbarVisible}
                position={toolbarPos}
                onAction={handleToolbarAction}
                selectedText={selectedText}
            />

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-md p-6">
                        <div className="flex justify-between mb-6">
                            <h3 className="font-bold">Settings</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Section</label>
                                <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section Name" />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
                                <Button onClick={handleSaveSettings}>Save</Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}