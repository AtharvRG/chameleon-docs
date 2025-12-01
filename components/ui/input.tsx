import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <div className="relative group">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full border-b border-input bg-transparent px-0 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-foreground transition-all duration-300 group-focus-within:w-full" />
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };