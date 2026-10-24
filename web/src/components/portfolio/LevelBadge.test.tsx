import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LevelBadge from "@/components/portfolio/LevelBadge";

describe("LevelBadge", () => {
    it("shows the level label for a rated skill", () => {
        render(<LevelBadge level={3} />);

        expect(screen.getByText("L3")).toBeInTheDocument();
    });

    it("shows Not assessed in text instead of a level when there is no level", () => {
        render(<LevelBadge level={null} />);

        expect(screen.getByText("Not assessed")).toBeInTheDocument();
        expect(screen.queryByText(/^L[1-5]$/)).not.toBeInTheDocument();
    });
});
