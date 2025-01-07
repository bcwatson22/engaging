import type { Mock } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import {
  Particles as TSParticles,
  initParticlesEngine,
} from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import { Particles } from "./Particles";

vi.mock("@tsparticles/react", () => ({
  Particles: vi.fn(),
  initParticlesEngine: vi.fn(),
}));

vi.mock("@tsparticles/slim", () => ({
  loadSlim: vi.fn(),
}));

(TSParticles as Mock).mockImplementation(() => <div>Test particles</div>);
(initParticlesEngine as Mock).mockResolvedValue(true);
(loadSlim as Mock).mockResolvedValue(true);

const setup = () => render(<Particles />);

describe("Particles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("initialises and renders Particles", async () => {
    setup();

    expect(initParticlesEngine).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByText("Test particles")).toBeInTheDocument()
    );
  });
});
