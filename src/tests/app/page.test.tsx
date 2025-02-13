import type { Mock } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import HomePage, { generateMetadata } from "@/app/page";
import type { THome } from "@/data/types/home";
import { mockHome } from "@/data/mock/home";

import { queryHome } from "@/queries/home";

import { getData } from "@/data/functions/getData";
import { saveData } from "@/data/functions/saveData";

import { Particles } from "@/components/atoms/Particles/Particles";
import { Cookie } from "@/components/molecules/Cookie/Cookie";
import { Mugshot } from "@/components/organisms/Mugshot/Mugshot";

vi.mock("@/data/functions/getData", () => ({
  getData: vi.fn(),
}));

vi.mock("@/data/functions/saveData", () => ({
  saveData: vi.fn(),
}));

vi.mock(
  import("@/components/organisms/Mugshot/Mugshot"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Mugshot: vi.fn(),
    };
  }
);

vi.mock("@/components/atoms/Particles/Particles", () => ({
  Particles: vi.fn(),
}));

vi.mock("@/components/molecules/Cookie/Cookie", () => ({
  Cookie: vi.fn(),
}));

const {
  meta: { title, description, cookie },
  mugshot,
  technologies,
} = mockHome;

const setup = async (mockedResolvedValue: THome | {} = mockHome) => {
  (getData as Mock).mockResolvedValue(mockedResolvedValue);

  return render(await (async () => await HomePage())());
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("calls getData", async () => {
    await setup();

    expect(getData).toHaveBeenNthCalledWith(
      1,
      queryHome,
      "homes",
      expect.objectContaining({
        technologies: expect.any(Array),
      })
    );
  });

  it("calls saveData", async () => {
    await setup();

    expect(saveData).toHaveBeenNthCalledWith(1, mockHome, "Home", 3);
  });

  it("renders a main", async () => {
    await setup();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a heading", async () => {
    await setup();

    expect(
      screen.getByRole("heading", { name: "Engaging Engineering" })
    ).toBeInTheDocument();
  });

  it("renders a Mugshot component", async () => {
    await setup();

    expect(Mugshot).toHaveBeenNthCalledWith(1, { mugshot, technologies }, {});
  });

  it("renders a Particles component", async () => {
    await setup();

    expect(Particles).toHaveBeenCalledTimes(1);
  });

  it("renders a Cookie component", async () => {
    await setup();

    expect(Cookie).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: cookie }),
      {}
    );
  });

  it("generates metadata", async () => {
    const result = await generateMetadata();

    expect(result).toEqual(expect.objectContaining({ title, description }));
  });
});
