import Link from "next/link";
export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="border-t border-border bg-secondary/30 py-8 sm:py-12">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 px-4 sm:px-0">
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} Anchor. Made with ❤️
                    </p>
                </div>
                <div className="flex gap-6 sm:gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
                </div>
            </div>
        </footer>
    );
}