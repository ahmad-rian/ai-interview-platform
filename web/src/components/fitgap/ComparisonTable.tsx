import { AlertTriangle, ArrowUp, Check, CheckCheck, CircleHelp, Pencil, ShieldAlert } from "lucide-react";
import { LEVEL_LABELS, FIT_GAP_RESULT_LABELS, FIT_GAP_RESULT_CLASSES } from "@/utils/constants";
import { cn } from "@/lib/utils";
import type { SkillComparison } from "@/types";

interface ComparisonTableProps {
  comparisons: SkillComparison[];
}

const RESULT_ICONS = {
  match: Check,
  exceed: ArrowUp,
  gap: AlertTriangle,
  not_assessed: CircleHelp,
  low_confidence: ShieldAlert,
} as const;

const TENTATIVE_TEXT = { below: "tentatively below", equal: "tentatively matches", above: "tentatively above" };

function ResultBadge({ comparison }: { comparison: SkillComparison }) {
  const Icon = RESULT_ICONS[comparison.result];
  let suffix = "";
  if (comparison.result === "exceed" && comparison.delta) suffix = ` +${comparison.delta}`;
  if (comparison.result === "gap" && comparison.delta) suffix = ` -${Math.abs(comparison.delta)}`;

  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded", FIT_GAP_RESULT_CLASSES[comparison.result])}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {FIT_GAP_RESULT_LABELS[comparison.result]}
        {suffix}
      </span>
      {comparison.result === "low_confidence" && comparison.tentative_direction && (
        <span className="text-[11px] text-muted-foreground">
          {TENTATIVE_TEXT[comparison.tentative_direction]}, not counted
        </span>
      )}
      {comparison.result === "not_assessed" && <span className="text-[11px] text-muted-foreground">not counted</span>}
    </span>
  );
}

function CandidateLevel({ comparison }: { comparison: SkillComparison }) {
  if (comparison.candidate_level == null) return <span className="text-muted-foreground">Not assessed</span>;

  return (
    <span className="inline-flex items-center gap-1">
      {LEVEL_LABELS[comparison.candidate_level]}
      {comparison.level_source === "assessor_override" && (
        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground" title={comparison.override_notes ?? undefined}>
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Assessor (AI {comparison.ai_level ? LEVEL_LABELS[comparison.ai_level] : "not assessed"})
        </span>
      )}
      {comparison.level_source === "assessor_confirmed" && (
        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
          <CheckCheck className="h-3 w-3" aria-hidden="true" />
          Confirmed
        </span>
      )}
    </span>
  );
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  const count = (result: SkillComparison["result"]) => comparisons.filter((c) => c.result === result).length;
  const summary = [
    { result: "match", label: "Match" },
    { result: "gap", label: "Gap" },
    { result: "exceed", label: "Exceeds" },
    { result: "not_assessed", label: "Not assessed" },
    { result: "low_confidence", label: "Low confidence" },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium">Skill</th>
              <th className="text-center px-4 py-2.5 font-medium">Required</th>
              <th className="text-center px-4 py-2.5 font-medium">Candidate</th>
              <th className="text-center px-4 py-2.5 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.skill_label} className="border-b last:border-0">
                <td className="px-4 py-2.5 break-words">{c.skill_label}</td>
                <td className="px-4 py-2.5 text-center text-muted-foreground">{LEVEL_LABELS[c.expected_level]}</td>
                <td className="px-4 py-2.5 text-center">
                  <CandidateLevel comparison={c} />
                </td>
                <td className="px-4 py-2.5 text-center">
                  <ResultBadge comparison={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {summary.map(({ result, label }) => {
          const n = count(result);
          return n > 0 ? <span key={result}>{label}: {n} skill{n !== 1 ? "s" : ""}</span> : null;
        })}
      </div>
    </div>
  );
}
