import * as React from "react";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoResize = true,
      onInput,
      onChange,
      style,
      rows,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref && "current" in ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    const resize = React.useCallback(() => {
      if (!autoResize) return;
      const el = internalRef.current;
      if (!el) return;

      const computed = window.getComputedStyle(el);
      const minHeight = parseFloat(computed.minHeight) || 38;
      const maxHeight = parseFloat(computed.maxHeight);

      el.style.height = "auto";
      const targetH = Math.max(el.scrollHeight, minHeight);

      if (!isNaN(maxHeight) && maxHeight > 0 && targetH > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.style.overflowY = "auto";
      } else {
        el.style.height = `${targetH}px`;
        el.style.overflowY = "hidden";
      }
    }, [autoResize]);

    useIsomorphicLayoutEffect(() => {
      resize();
    }, [props.value, props.defaultValue, resize]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        resize();
      }
      onInput?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        resize();
      }
      onChange?.(e);
    };

    return (
      <textarea
        ref={setRefs}
        onInput={handleInput}
        onChange={handleChange}
        rows={rows || 1}
        style={style}
        className={cn(
          "flex min-h-[38px] w-full rounded-[4px] border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#0E0F12] p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0167D6] disabled:cursor-not-allowed disabled:opacity-50 transition-colors leading-relaxed",
          autoResize && "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
