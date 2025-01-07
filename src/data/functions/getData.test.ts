import type { Mock } from "vitest";
import { getData } from "./getData";

import { client } from "@/queries/client";
import { queryHome } from "@/queries/home";
import { mockHome } from "@/data/mock/home";

import { TData } from "../types/data";

vi.mock("@/queries/client", () => ({
  client: vi.fn(),
}));

const mockData: TData = {
  data: {
    homes: [mockHome],
  },
};

const mockFallbackData = {
  key: "value",
};

const setup = async (mockedResolvedValue: TData | {} = mockData) => {
  (client as Mock).mockResolvedValue(mockedResolvedValue);

  return await getData(queryHome, "homes", mockFallbackData);
};

describe("getData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the first item of data if it exists", async () => {
    const result = await setup();

    expect(result).toBe(mockHome);
  });

  it("returns fallback if data doesn't exist", async () => {
    const result = await setup({});

    expect(result).toBe(mockFallbackData);
  });
});
