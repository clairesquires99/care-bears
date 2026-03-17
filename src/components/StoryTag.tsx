import { ButtonHTMLAttributes, forwardRef } from "react";

interface StoryTagProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const StoryTag = forwardRef<HTMLButtonElement, StoryTagProps>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-full border border-zinc-300 bg-zinc-100 px-6 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-200 disabled:opacity-50 ${className}`}
      {...props}
    />
  ),
);

StoryTag.displayName = "StoryTag";
