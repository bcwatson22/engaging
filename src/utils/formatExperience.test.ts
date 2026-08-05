import { formatExperience, getYearsOfExperience } from "./formatExperience";

const mockToday = new Date("2025-01-08");

describe("formatExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a string", () => {
    expect(formatExperience("No placeholder here")).toBeTypeOf("string");
  });

  it("replaces the placeholder with the year value", () => {
    expect(formatExperience("with {{experience}} years")).toBe(
      "with 12 years"
    );
  });

  it("replaces every occurrence of the placeholder", () => {
    expect(
      formatExperience("{{experience}} years, yes {{experience}} years")
    ).toBe("12 years, yes 12 years");
  });

  it("returns the value unchanged when there is no placeholder", () => {
    const value = "Front End Engineer";

    expect(formatExperience(value)).toBe(value);
  });

  it("returns an empty string unchanged", () => {
    expect(formatExperience("")).toBe("");
  });
});

describe("getYearsOfExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the completed years since the career start date", () => {
    vi.setSystemTime(new Date("2025-05-31"));

    expect(getYearsOfExperience()).toBe("12");
  });

  it("increments on the anniversary of the career start date", () => {
    vi.setSystemTime(new Date("2025-06-01"));

    expect(getYearsOfExperience()).toBe("13");
  });
});
