import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-[4px] text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variantStyles = {
      default:
        "bg-[#0167D6] text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20 active:scale-[0.99]",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20 active:scale-[0.99]",
      outline:
        "border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#131417] text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 active:scale-[0.99]",
      secondary:
        "bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700",
      ghost:
        "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white",
      link: "text-[#0167D6] underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-sm",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

