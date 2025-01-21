import type { Mock } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ReactMarkdown from "react-markdown";

import CVPage, { generateMetadata, generateViewport } from "@/app/cv/page";
import type { TCV } from "@/data/types/cv";
import { mockCV } from "@/data/mock/cv";

import { queryCV } from "@/queries/cv";

import { getData } from "@/data/functions/getData";
import { saveData } from "@/data/functions/saveData";

import { Header } from "@/components/molecules/Header/Header";
import { Details } from "@/components/molecules/Details/Details";
import { Qualification } from "@/components/molecules/Qualification/Qualification";
import { Reference } from "@/components/molecules/Reference/Reference";
import { Gig } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

import { themeColor } from "@/constants/metadata";

vi.mock("react-markdown", () => ({
  default: vi.fn().mockImplementation(({ children }) => <>{children}</>),
}));

vi.mock("@/data/functions/getData", () => ({
  getData: vi.fn(),
}));

vi.mock("@/data/functions/saveData", () => ({
  saveData: vi.fn(),
}));

vi.mock(
  import("@/components/molecules/Header/Header"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Header: vi.fn(),
    };
  }
);

vi.mock(
  import("@/components/molecules/Details/Details"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Details: vi.fn(),
    };
  }
);

vi.mock("@/components/molecules/Qualification/Qualification", () => ({
  Qualification: vi.fn(),
}));

vi.mock("@/components/molecules/Reference/Reference", () => ({
  Reference: vi.fn(),
}));

vi.mock(
  import("@/components/organisms/Gig/Gig"),
  async (importOriginal: Function) => {
    const actual = await importOriginal();
    return {
      ...actual,
      Gig: vi.fn(),
    };
  }
);

vi.mock("@/components/organisms/Section/Section", () => ({
  Section: vi.fn().mockImplementation(({ children }) => <>{children}</>),
}));

const {
  title,
  description,
  logoDarkBackground,
  logoLightBackground,
  intro,
  address,
  contactLinks,
  gigs,
  skills,
  qualifications,
  onlineLinks,
  references,
} = mockCV;

const setup = async (mockedResolvedValue: TCV | {} = mockCV) => {
  (getData as Mock).mockResolvedValue(mockedResolvedValue);

  return render(await (async () => await CVPage())());
};

describe("CVPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("calls getData", async () => {
    await setup();

    expect(getData).toHaveBeenNthCalledWith(
      1,
      queryCV,
      "cvs",
      expect.objectContaining({
        logoLightBackground: expect.objectContaining({
          url: expect.any(String),
        }),
      })
    );
  });

  it("calls saveData", async () => {
    await setup();

    expect(saveData).toHaveBeenNthCalledWith(1, mockCV, "CV");
  });

  it("renders a main", async () => {
    await setup();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a Header component", async () => {
    await setup();

    expect(Header).toHaveBeenNthCalledWith(
      1,
      { title, logoDarkBackground, logoLightBackground, intro },
      {}
    );
  });

  it("renders Section components", async () => {
    await setup();

    const sections = [
      "Digits",
      "Experience",
      "Skills",
      "Qualifications",
      "Profile",
      "References",
    ];

    for (const [index, value] of sections.entries())
      expect(Section).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({ heading: value }),
        {}
      );
  });

  it("renders a Details component for contact details", async () => {
    await setup();

    expect(Details).toHaveBeenNthCalledWith(
      1,
      { address, links: contactLinks },
      {}
    );
  });

  it("renders Gig components", async () => {
    await setup();

    for (const [index, value] of gigs.entries())
      expect(Gig).toHaveBeenNthCalledWith(
        index + 1,
        { ...value, delay: index === 0 ? 0.2 : 0 },
        {}
      );
  });

  it("marks up and renders skills", async () => {
    await setup();

    expect(ReactMarkdown).toHaveBeenNthCalledWith(1, { children: skills }, {});
  });

  it("renders Qualification components", async () => {
    await setup();

    for (const [index, value] of qualifications.entries())
      expect(Qualification).toHaveBeenNthCalledWith(index + 1, value, {});
  });

  it("renders a Details component for online links", async () => {
    await setup();

    expect(Details).toHaveBeenNthCalledWith(2, { links: onlineLinks }, {});
  });

  it("renders Reference components", async () => {
    await setup();

    for (const [index, value] of references.entries())
      expect(Reference).toHaveBeenNthCalledWith(index + 1, value, {});
  });

  it("generates metadata", async () => {
    const result = await generateMetadata();

    expect(result).toEqual(expect.objectContaining({ title, description }));
  });

  it("generates viewport", async () => {
    const result = await generateViewport();

    expect(result).toEqual(
      expect.objectContaining({
        themeColor: expect.arrayContaining([
          {
            media: "(prefers-color-scheme: dark)",
            color: themeColor,
          },
        ]),
      })
    );
  });
});
