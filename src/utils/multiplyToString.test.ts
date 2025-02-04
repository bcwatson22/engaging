import { multiplyToString } from "./multiplyToString";

describe("multiplyToString", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a string", () => {
    expect(multiplyToString(5)).toBeTypeOf("string");
  });

  it("returns a multiplication of value by factor", () => {
    const value = 3;
    const factor = 7;

    expect(multiplyToString(value, factor)).toBe(`${value * factor}`);
  });
});
