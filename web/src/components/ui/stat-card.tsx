import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconVariants = cva("h-4 w-4 shrink-0", {
  variants: {
    tone: {
      neutral: "text-foreground",
      positive: "text-green-700",
      warning: "text-amber-700",
      muted: "text-slate-600",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface StatCardProps extends VariantProps<typeof iconVariants> {
  label: string;
  value: number;
  icon: LucideIcon;
  className?: string;
}

// One summary number. The label and value are read together ("Match: 3").
export function StatCard({ label, value, icon: Icon, tone, className }: StatCardProps) {
  return (
    <div
      role="group"
      aria-label={`${label}: ${value}`}
      className={cn("flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-3", className)}
    >
      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className={iconVariants({ tone })} />
        <span className="min-w-0 break-words">{label}</span>
      </span>
      <span className="text-2xl font-semibold tabular-nums leading-none">{value}</span>
    </div>
  );
}
