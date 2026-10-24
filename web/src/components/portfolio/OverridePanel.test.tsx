import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OverridePanel from "@/components/portfolio/OverridePanel";
import type { PortfolioSkill } from "@/types";

const skill: PortfolioSkill = {
    id: 1,
    skill_label: "Contoh SQL",
    is_discovered: false,
    rating_status: "assessed",
    ai_level: 2,
    ai_confidence: "medium",
    evidence: ["Kandidat Contoh: kutipan."],
    competency_summary: "Contoh.",
};

// AC-20 on the web side: an override is human-review evidence, so the note is required.
describe("OverridePanel", () => {
    it("asks for a required note and only enables saving once a note is written", () => {
        render(<OverridePanel skill={skill} onSaved={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: /override rating/i }));
        fireEvent.click(screen.getByLabelText(/L3/));

        const save = screen.getByRole("button", { name: /save override/i });
        expect(screen.getByLabelText(/reason for the change/i)).toBeRequired();
        expect(save).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/reason for the change/i), { target: { value: "   " } });
        expect(save).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/reason for the change/i), { target: { value: "Contoh alasan." } });
        expect(save).toBeEnabled();
    });
});
