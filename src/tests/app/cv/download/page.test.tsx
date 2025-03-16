import type { Mock } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { useRouter } from "next/navigation";

import DownloadPage from "@/app/cv/download/page";

import { Loading } from "@/components/pages/Loading/Loading";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/components/pages/Loading/Loading", () => ({
  Loading: vi.fn(),
}));

type UseRouter = Partial<ReturnType<typeof useRouter>>;

type SetupOptions = {
  useRouter: UseRouter;
};

const mockPush = vi.fn();
const defaultRouter: UseRouter = { push: mockPush };

const setup = (options?: Partial<SetupOptions>) => {
  const setupOptions: SetupOptions = {
    useRouter: defaultRouter,
    ...options,
  };

  (useRouter as Mock).mockReturnValue(setupOptions.useRouter);

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
    const spyCreateElement = vi.spyOn(document, "createElement");

    setup();

    expect(spyCreateElement).toHaveBeenNthCalledWith(1, "div");
  });

  it("appends the anchor to the body", () => {
    const spyAppendChild = vi.spyOn(document.body, "appendChild");

    setup();

    expect(spyAppendChild).toHaveBeenNthCalledWith(1, expect.any(Element));
  });

  it("clicks the anchor", () => {
    setup();

    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
  });

  it("removes the anchor from the body", () => {
    const spyRemoveChild = vi.spyOn(document.body, "removeChild");

    setup();

    expect(spyRemoveChild).toHaveBeenCalledTimes(1);
  });

  it("takes the user back to the cv page", () => {
    setup();

    expect(mockPush).toHaveBeenNthCalledWith(1, "/cv");
  });

  it("logs an error message if something went wrong", async () => {
    const spyConsoleError = vi.spyOn(console, "error");

    setup({
      useRouter: {
        push: vi.fn().mockImplementation(() => {
          throw new Error("Something went wrong");
        }),
      },
    });

    expect(spyConsoleError).toHaveBeenNthCalledWith(
      1,
      "Error downloading file:",
      expect.any(Error)
    );
  });
});
