import { ButtonHTMLAttributes, forwardRef } from "react";

interface StoryTagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "grey" | "orange";
}

const colorClasses = {
  grey: "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-200",
  orange: "border-orange-300 bg-orange-100 text-orange-700 hover:border-orange-400 hover:bg-orange-200",
};

export const StoryTag = forwardRef<HTMLButtonElement, StoryTagProps>(
  ({ className = "", color = "grey", ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-full border px-6 py-2 text-sm transition-colors disabled:opacity-50 ${colorClasses[color]} ${className}`}
      {...props}
    />
  ),
);

StoryTag.displayName = "StoryTag";
