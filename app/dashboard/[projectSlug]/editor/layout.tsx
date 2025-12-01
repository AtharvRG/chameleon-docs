export default function EditorLayout({ children }: { children: React.ReactNode }) {
    // This layout removes the dashboard wrapper's constraints for the editor
    // The editor has its own full-screen layout
    return (
        <div className="fixed inset-0 z-50 bg-background">
            {children}
        </div>
    );
}
