import manifest from "@/app/manifest";

const { mockTitle, mockDescription } = vi.hoisted(() => ({
  mockTitle: "Engaging Engineering",
  mockDescription: "Engineering with {{experience}} years' experience",
}));

const mockToday = new Date("2025-01-08");

vi.mock("@/data/cache/home", () => ({
  cacheHome: {
    meta: {
      title: mockTitle,
      description: mockDescription,
    },
  },
}));

describe("manifest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a manifest", () => {
    const result = manifest();

    expect(result).toEqual(
      expect.objectContaining({ start_url: "/", display: "standalone" })
    );
  });

  it("uses the cached title", () => {
    const result = manifest();

    expect(result).toEqual(
      expect.objectContaining({ name: mockTitle, short_name: mockTitle })
    );
  });

  it("replaces the experience placeholder in the description", () => {
    const result = manifest();

    expect(result).toEqual(
      expect.objectContaining({
        description: "Engineering with 12 years' experience",
      })
    );
  });
});
