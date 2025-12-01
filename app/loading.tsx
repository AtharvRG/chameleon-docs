import { ChameleonLoader } from "@/components/ui/chameleon-loader";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <ChameleonLoader />
        </div>
    );
} 