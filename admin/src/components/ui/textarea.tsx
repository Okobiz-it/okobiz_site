import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[70px] w-full rounded-[4px] border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#0E0F12] p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0167D6] disabled:cursor-not-allowed disabled:opacity-50 transition-colors leading-relaxed",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

