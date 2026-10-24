import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LevelRadio from "@/components/assessment/LevelRadio";
import LevelBadge from "./LevelBadge";
import { portfoliosApi } from "@/services/portfolios";
import { Loader2, Pencil } from "lucide-react";
import { parseLevel } from "@/utils/constants";
import type { PortfolioSkill, AssessorOverride } from "@/types";

interface OverridePanelProps {
  skill: PortfolioSkill;
  existingOverride?: AssessorOverride;
  onSaved: (override: AssessorOverride) => void;
}

export default function OverridePanel({ skill, existingOverride, onSaved }: OverridePanelProps) {
  const [open, setOpen] = useState(false);
  // 0 = nothing selected yet (a not-assessed skill has no AI level to start from).
  const [overrideLevel, setOverrideLevel] = useState(existingOverride?.override_level ?? parseLevel(skill.ai_level) ?? 0);
  const [notes, setNotes] = useState(existingOverride?.assessor_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasOverride = !!existingOverride;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await portfoliosApi.getOverride(skill.id, {
        override_level: overrideLevel,
        assessor_notes: notes.trim(),
        lock_version: existingOverride?.lock_version,
      });
      onSaved(res.data.override);
      setOpen(false);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { errors?: { message?: string }[] } } })
        ?.response?.data?.errors?.[0]?.message;
      setSaveError(message ?? "Failed to save override. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {hasOverride ? (
          <>
            <div className="flex items-center gap-1.5 text-sm">
              <LevelBadge level={parseLevel(skill.ai_level)} size="sm" />
              <span className="text-muted-foreground text-xs">AI</span>
              <span className="text-muted-foreground">→</span>
              <LevelBadge level={existingOverride!.override_level} size="sm" />
              <span className="text-xs text-green-600 font-medium">You Overridden ✓</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <Pencil className="h-3 w-3 mr-1" /> Edit override
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Override rating ▼
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Override
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Your rating:</Label>
        <LevelRadio value={overrideLevel} onChange={setOverrideLevel} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`notes-${skill.id}`} className="text-sm">Reason for the change (required):</Label>
        <Textarea
          id={`notes-${skill.id}`}
          required
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What evidence supports this rating?"
        />
      </div>

      {saveError && (
        <p className="text-xs text-destructive" role="alert">{saveError}</p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={saving || overrideLevel < 1 || notes.trim() === ""}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Save override
        </Button>
      </div>
    </div>
  );
}
