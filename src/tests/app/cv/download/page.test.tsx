import { Mock } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { useRouter } from "next/navigation";

import DownloadPage from "@/app/cv/download/page";

import { Loading } from "@/components/pages/Loading/Loading";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// vi.mock(import("next/navigation"), async (importOriginal: Function) => {
//   const actual = await importOriginal();
//   return {
//     ...actual,
//     useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
//   };
// });

vi.mock("@/components/pages/Loading/Loading", () => ({
  Loading: vi.fn(),
}));

const mockPush = vi.fn();

const setup = () => {
  (useRouter as Mock).mockReturnValue({ push: mockPush });

  render(<DownloadPage />);
};

describe("Loading", () => {
  beforeEach(() => {
    HTMLAnchorElement.prototype.click = vi.fn();
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a Loading component", () => {
    setup();

    expect(Loading).toHaveBeenCalledTimes(1);
  });

  it("creates an anchor", () => {
    const createElementSpy = vi.spyOn(document, "createElement");

    setup();

    expect(createElementSpy).toHaveBeenNthCalledWith(1, "div");
  });

  it("appends the anchor to the body", () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    setup();

    expect(appendChildSpy).toHaveBeenNthCalledWith(1, expect.any(Element));
  });

  it("clicks the anchor", () => {
    setup();

    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it("removes the anchor from the body", () => {
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    setup();

    expect(removeChildSpy).toHaveBeenCalledTimes(1);
  });

  it("takes the user back to the cv page", () => {
    setup();

    expect(mockPush).toHaveBeenNthCalledWith(1, "/cv");
  });

  // it("logs an error message if something went wrong", async () => {
  //   // vi.spyOn(document, "createElement").mockRejectedValue(
  //   //   new Error("Async error")
  //   // );

  //   const consoleErrorSpy = vi.spyOn(console, "error");
  //   const mockErrorMessage = "Something went wrong";

  //   setup();

  //   // (useRouter as Mock).mockReturnValue({
  //   //   push: vi.fn().mockResolvedValue(new Error("Async error")),
  //   // });

  //   expect(consoleErrorSpy).toHaveBeenNthCalledWith(
  //     1,
  //     "Error trying to fetch page data:",
  //     mockErrorMessage
  //   );
  // });
});
