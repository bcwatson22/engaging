import { cleanup, render } from "@testing-library/react";

import ErrorPage, { type ErrorPageProps } from "@/app/error";

import { Error } from "@/components/pages/Error/Error";

vi.mock(import("@/components/pages/Error/Error"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Error: vi.fn(),
  };
});

const mockError: Error = {
  name: "mockName",
  message: "mockMessage",
  cause: "mockCause",
};
const mockReset = vi.fn();

const defaultProps: ErrorPageProps = {
  error: mockError,
  reset: mockReset,
};

const setup = (props?: Partial<ErrorPageProps>) =>
  render(<ErrorPage {...defaultProps} {...props} />);

describe("Error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("logs the error", () => {
    const consoleErrorSpy = vi.spyOn(console, "error");

    setup();

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, mockError);
  });

  it("renders an Error component", () => {
    setup();

    expect(Error).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ reset: mockReset }),
      {}
    );
  });
});
