import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Space_Grotesk, Manrope, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AccentProvider } from "@/components/accent-provider";
import { CommandMenu } from "@/components/command-menu";
import SmoothScroll from "@/components/smooth-scroll";
import CopyCodeHandler from "./components/CopyCodeHandler"; // Added this line
import { cn } from "@/lib/utils";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chameleon Docs",
  description: "A visually blissful documentation platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-accent/30 selection:text-accent-foreground",
          cormorant.variable,
          jakarta.variable,
          spaceGrotesk.variable,
          manrope.variable,
          inter.variable
        )}
      >
        {/* PuterJS for AI functionality */}
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
        <SmoothScroll />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccentProvider>
            <CopyCodeHandler /> {/* Added this line to enable copy buttons globally */}
            <CommandMenu />
            {children}
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}