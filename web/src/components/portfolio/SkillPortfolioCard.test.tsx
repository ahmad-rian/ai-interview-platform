import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SkillPortfolioCard from "@/components/portfolio/SkillPortfolioCard";
import type { PortfolioSkill } from "@/types";

const notAssessed: PortfolioSkill = {
    id: 1,
    skill_label: "Contoh System Design",
    is_discovered: false,
    rating_status: "not_assessed",
    not_assessed_reason: "not_covered",
    ai_level: null,
    ai_confidence: null,
    evidence: [],
    competency_summary: "",
};

describe("SkillPortfolioCard", () => {
    it("renders a not-assessed skill without a level or a confidence", () => {
        render(<SkillPortfolioCard skill={notAssessed} onOverrideSaved={vi.fn()} />);

        expect(screen.getByText("Contoh System Design")).toBeInTheDocument();
        expect(screen.getByText("Not assessed")).toBeInTheDocument();
        expect(screen.getByText(/not covered in the interview/i)).toBeInTheDocument();
        expect(screen.queryByText(/^L[1-5]$/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Confidence:/)).not.toBeInTheDocument();
    });
});
