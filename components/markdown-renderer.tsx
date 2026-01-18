"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Helper to wrap words in spans for animation
const WordWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof children === "string") {
        return (
            <>
                {children.split(/(\s+)/).map((part, i) => {
                    if (part.trim().length === 0) return part;
                    return (
                        <span key={i} className="chameleon-word inline-block origin-center" style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
                            {part}
                        </span>
                    );
                })}
            </>
        );
    }
    
    if (Array.isArray(children)) {
        return <>{children.map((child, i) => <WordWrapper key={i}>{child}</WordWrapper>)}</>;
    }

    return <>{children}</>;
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 1. Headings
                    h1: ({ children }) => (
                        <h1 className="mt-8 scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl text-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-10 scroll-m-20 border-b border-white/10 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight text-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mt-6 scroll-m-20 text-xl font-semibold tracking-tight text-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </h4>
                    ),

                    // 2. Paragraphs & Text
                    p: ({ children }) => (
                        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground text-lg">
                            <WordWrapper>{children}</WordWrapper>
                        </p>
                    ),
                    a: ({ href, children }) => (
                        <a href={href} className="font-medium text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">
                            <WordWrapper>{children}</WordWrapper>
                        </a>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">
                            <WordWrapper>{children}</WordWrapper>
                        </em>
                    ),

                    // 3. Blockquotes & Callouts
                    blockquote: ({ children }) => {
                        if (children && Array.isArray(children) && children[0]?.props?.children) {
                            const firstChild = children[0];
                            const content = Array.isArray(firstChild.props.children) ? firstChild.props.children[0] : firstChild.props.children;
                            
                            if (typeof content === 'string') {
                                const match = content.match(/^\[!(\w+)\]\s?/);
                                if (match) {
                                    const type = match[1].toLowerCase();
                                    const validTypes = ["info", "warning", "tip", "note", "danger"];

                                    if (validTypes.includes(type)) {
                                        const newContent = content.substring(match[0].length);
                                        const newFirstChild = React.cloneElement(firstChild, {
                                            ...firstChild.props,
                                            children: [newContent, ...(Array.isArray(firstChild.props.children) ? firstChild.props.children.slice(1) : [])],
                                        });
                                        const newChildren = [newFirstChild, ...children.slice(1)];
                                        return <Callout type={type as any}>{newChildren}</Callout>;
                                    }
                                }
                            }
                        }

                        return (
                            <blockquote className="mt-6 border-l-2 border-accent pl-6 italic text-muted-foreground bg-white/5 py-2 pr-4 rounded-r-lg">
                                <WordWrapper>{children}</WordWrapper>
                            </blockquote>
                        );
                    },

                    // 4. Lists
                    ul: ({ children }) => (
                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-muted-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </li>
                    ),

                    // 5. Code - both inline and blocks
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        
                        if (match) {
                            return (
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                    showLineNumbers
                                    wrapLines={true}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: 0,
                                        background: "transparent",
                                        padding: "1.5rem 0",
                                        fontSize: "0.875rem",
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                                        }
                                    }}
                                    lineNumberContainerStyle={{
                                        paddingRight: "1.5rem",
                                        opacity: 0.5,
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            );
                        }
                        
                        return (
                            <code className="relative rounded-md bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm font-medium text-accent" {...props}>
                                <WordWrapper>{children}</WordWrapper>
                            </code>
                        );
                    },

                    // 6. Pre - wrapper for code blocks
                    pre: ({ children }) => {
                        const [isCopied, setIsCopied] = useState(false);

                        const codeChild = React.Children.toArray(children).find(
                            (child): child is React.ReactElement => 
                                React.isValidElement(child) && child.type === 'code'
                        );
                        
                        const codeString = codeChild?.props?.node?.children[0]?.value ?? '';
                        
                        const handleCopy = () => {
                            navigator.clipboard.writeText(codeString).then(() => {
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                            });
                        };

                        const className = codeChild?.props?.className || "";
                        const match = /language-(\w+)/.exec(className);
                        const language = match ? match[1] : "text";
                        
                        return (
                            <div className="relative my-6 rounded-xl border border-white/10 overflow-hidden shadow-2xl code-block-wrapper bg-[#282a36]">
                                <div className="flex items-center justify-between bg-[#282a36]/50 px-4 py-3 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                        <span className="ml-2 text-xs text-white/40 font-mono">{language}</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        {isCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                        {isCopied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="overflow-x-auto pl-4">
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
                        <div className="my-6 w-full overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-white/10 px-4 py-3 text-left font-semibold text-foreground bg-white/5">
                            <WordWrapper>{children}</WordWrapper>
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-white/10 px-4 py-3 text-muted-foreground">
                            <WordWrapper>{children}</WordWrapper>
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}