import type { Mock } from "vitest";

import manifest from "@/app/manifest";
import { getData } from "@/data/functions/getData";

const mockTitle = "Engaging Engineering";
const mockToday = new Date("2025-01-08");

vi.mock("@/data/functions/getData", () => ({
  getData: vi.fn<typeof import("@/data/functions/getData").getData>(),
}));

const setup = async () => {
  (getData as Mock).mockResolvedValue({
    meta: {
      title: mockTitle,
      description: "Engineering with {{experience}} years' experience",
    },
  });

  return await manifest();
};

describe("manifest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a manifest", async () => {
    const result = await setup();

    expect(result).toEqual(
      expect.objectContaining({ start_url: "/", display: "standalone" }),
    );
  });

  it("uses the title from the CMS", async () => {
    const result = await setup();

    expect(result).toEqual(
      expect.objectContaining({ name: mockTitle, short_name: mockTitle }),
    );
  });

  it("replaces the experience placeholder in the description", async () => {
    const result = await setup();

    expect(result).toEqual(
      expect.objectContaining({
        description: "Engineering with 12 years' experience",
      }),
    );
  });
});
