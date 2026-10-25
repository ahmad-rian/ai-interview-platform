import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

// Nothing to show yet, with the next step to take.
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <section className={cn("flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center", className)}>
      {Icon && <Icon aria-hidden="true" className="h-8 w-8 text-muted-foreground" />}
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </section>
  );
}
