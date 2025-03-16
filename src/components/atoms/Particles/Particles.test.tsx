import type { Mock } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { Particles as TSParticles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import { Particles } from "./Particles";

vi.mock(import("@tsparticles/react"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Particles: vi.fn(),
  };
});

vi.mock("@tsparticles/slim", () => ({
  loadSlim: vi.fn(),
}));

(TSParticles as Mock).mockImplementation(() => <div>Test particles</div>);

const setup = () => render(<Particles />);

describe("Particles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("initialises and renders Particles", async () => {
    setup();

    expect(loadSlim).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByText("Test particles")).toBeInTheDocument()
    );
  });
});
