"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 1. Headings
                    h1: ({ children }) => (
                        <h1 className="mt-8 scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-10 scroll-m-20 border-b border-white/10 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight text-foreground">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight text-foreground">{children}</h4>
                    ),

                    // 2. Paragraphs & Text
                    p: ({ children }) => (
                        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground text-lg">{children}</p>
                    ),
                    a: ({ href, children }) => (
                        <a href={href} className="font-medium text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">{children}</a>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),

                    // 3. Blockquotes (Glass Style)
                    blockquote: ({ children }) => (
                        <blockquote className="mt-6 border-l-2 border-accent pl-6 italic text-muted-foreground bg-white/5 py-2 pr-4 rounded-r-lg">{children}</blockquote>
                    ),

                    // 4. Lists
                    ul: ({ children }) => (
                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                    ),

                    // 5. Code - both inline and blocks
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        
                        // Check if it's a code block (has language class or is multiline)
                        if (match) {
                            return (
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: 0,
                                        background: "#282a36",
                                        padding: "1.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                                        }
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            );
                        }
                        
                        // Inline code
                        return (
                            <code className="relative rounded-md bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm font-medium text-accent" {...props}>
                                {children}
                            </code>
                        );
                    },

                    // 6. Pre - wrapper for code blocks
                    pre: ({ children }) => {
                        // Extract language from the code child if present
                        const codeChild = React.Children.toArray(children).find(
                            (child): child is React.ReactElement => 
                                React.isValidElement(child) && child.type === 'code'
                        );
                        
                        const className = codeChild?.props?.className || "";
                        const match = /language-(\w+)/.exec(className);
                        const language = match ? match[1] : "text";
                        
                        return (
                            <div className="relative my-6 rounded-xl border border-white/10 overflow-hidden shadow-2xl code-block-wrapper">
                                {/* Mac-style window dots */}
                                <div className="flex items-center gap-2 bg-[#282a36] px-4 py-3 border-b border-white/5">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                    <span className="ml-2 text-xs text-white/40 font-mono">{language}</span>
                                </div>
                                <div className="overflow-x-auto">
                                    {children}
                                </div>
                            </div>
                        );
                    },

                    // 7. Horizontal rule
                    hr: () => (
                        <hr className="my-8 border-white/10" />
                    ),

                    // 8. Tables
                    table: ({ children }) => (
                        <div className="my-6 w-full overflow-x-auto">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-white/10 px-4 py-2 text-left font-semibold text-foreground bg-white/5">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-white/10 px-4 py-2 text-muted-foreground">{children}</td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}