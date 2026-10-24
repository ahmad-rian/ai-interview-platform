import { CircleHelp } from "lucide-react";
import { LEVEL_LABELS, LEVEL_BADGE_CLASSES, LEVEL_DESCRIPTIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number | null;
  size?: "sm" | "md";
  className?: string;
}

export default function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  if (level === null) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded border border-dashed border-neutral-400 text-neutral-700",
          size === "md" ? "px-3 py-2 min-w-14 text-sm" : "px-2 py-1 text-xs",
          className
        )}
      >
        <CircleHelp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Not assessed</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center rounded font-semibold",
        size === "md" ? "px-3 py-2 min-w-14 text-base" : "px-2 py-1 min-w-10 text-sm",
        LEVEL_BADGE_CLASSES[level],
        className
      )}
    >
      <span>{LEVEL_LABELS[level]}</span>
      {size === "md" && (
        <span className="text-[10px] font-normal opacity-70">{LEVEL_DESCRIPTIONS[level]}</span>
      )}
    </div>
  );
}
