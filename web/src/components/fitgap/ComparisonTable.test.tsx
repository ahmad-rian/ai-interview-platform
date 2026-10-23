import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ComparisonTable from "@/components/fitgap/ComparisonTable";
import type { SkillComparison } from "@/types";

// Characterization test: proves the harness renders a real component.
// Behaviour that is known to be broken (Required column, override marker,
// summary counts) is intentionally not asserted here.
const comparisons: SkillComparison[] = [
    { skill_label: "Contoh Ruby on Rails", required_level: 3, candidate_level: 3, result: "match", delta: 0 },
    { skill_label: "Contoh System Design", required_level: 4, result: "not_assessed" },
];

describe("ComparisonTable", () => {
    it("renders a row for every skill comparison", () => {
        render(<ComparisonTable comparisons={comparisons} />);

        expect(screen.getByText("Contoh Ruby on Rails")).toBeInTheDocument();
        expect(screen.getByText("Contoh System Design")).toBeInTheDocument();
    });
});
