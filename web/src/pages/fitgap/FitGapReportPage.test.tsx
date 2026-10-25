import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FitGapReportPage from "@/pages/fitgap/FitGapReportPage";
import { portfoliosApi } from "@/services/portfolios";
import { sessionsApi } from "@/services/sessions";

vi.mock("@/services/portfolios", () => ({
    portfoliosApi: { getFitGap: vi.fn(), triggerFitGap: vi.fn(), regenerateFitGap: vi.fn(), exportPortfolio: vi.fn() },
}));
vi.mock("@/services/sessions", () => ({ sessionsApi: { getPortfolio: vi.fn(), get: vi.fn() } }));

function report(status: string) {
    return {
        data: {
            report: {
                portfolio_id: 5,
                vacancy_id: 9,
                summary: { total: 1, evidenced: 1, match: 1, exceed: 0, gap: 0, not_assessed: 0, low_confidence: 0, overridden: 0, confirmed: 0 },
                comparisons: [
                    { skill_label: "Contoh Rails", expected_level: 3, candidate_level: 3, ai_level: 3, level_source: "ai",
                      is_override: false, confidence: "high", result: "match", delta: 0, counts_toward_fit: true },
                ],
                follow_up: [],
                narrative: { status, source: status === "complete" ? "ai" : null,
                             label: "AI generated, not a hiring decision",
                             culture: null, overall: status === "complete" ? "Contoh narasi." : null },
            },
        },
    };
}

function renderPage() {
    render(
        <MemoryRouter initialEntries={["/assessments/1/sessions/2/fitgap/9"]}>
            <Routes>
                <Route path="/assessments/:id/sessions/:sessionId/fitgap/:vacancyId" element={<FitGapReportPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

const sessionResponse = { data: { session: { id: 2, candidate_name: "Kandidat Contoh A" }, assessment: { id: 1, name: "Contoh" } } };

// AC-95 / D1: polling only reads; it never enqueues a job, and stops on a final state.
describe("FitGapReportPage", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(sessionsApi.getPortfolio).mockResolvedValue({ data: { portfolio: { id: 5, skills: [] } } } as never);
        vi.mocked(sessionsApi.get).mockResolvedValue(sessionResponse as never);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("polls with GET only while the narrative is generating and stops when it completes", async () => {
        vi.mocked(portfoliosApi.getFitGap)
            .mockResolvedValueOnce(report("generating") as never)
            .mockResolvedValue(report("complete") as never);

        renderPage();
        await act(async () => { await vi.advanceTimersByTimeAsync(0); });
        expect(screen.getByText("Contoh Rails")).toBeInTheDocument();
        // Required and Candidate columns both show L3 (the Required column used to be empty).
        expect(screen.getAllByText("L3")).toHaveLength(2);

        await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
        expect(screen.getByText("Contoh narasi.")).toBeInTheDocument();
        expect(screen.getByText(/AI generated, not a hiring decision/)).toBeInTheDocument();

        const callsAtCompletion = vi.mocked(portfoliosApi.getFitGap).mock.calls.length;
        await act(async () => { await vi.advanceTimersByTimeAsync(20000); });

        expect(vi.mocked(portfoliosApi.getFitGap).mock.calls.length).toBe(callsAtCompletion);
        expect(portfoliosApi.triggerFitGap).not.toHaveBeenCalled();
    });
});
