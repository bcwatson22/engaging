import type { Mock } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { Cookie } from "./Cookie";
import userEvent from "@testing-library/user-event";
import { cookieName } from "@/constants/common";

const setup = () => render(<Cookie />);

describe("Cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders an aside", () => {
    setup();

    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("renders text", () => {
    setup();

    expect(
      screen.getByText("This site uses cookies for a sweet user experience.")
    ).toBeInTheDocument();
  });

  it("renders a button", () => {
    setup();

    expect(screen.getByRole("button", { name: "Cross" })).toBeInTheDocument();
  });

  it("sets storage when the button is clicked", async () => {
    Storage.prototype.setItem = vi.fn();

    setup();

    await userEvent.click(screen.getByRole("button", { name: "Cross" }));

    expect(localStorage.setItem).toHaveBeenNthCalledWith(
      1,
      cookieName,
      "dismissed"
    );
  });
});
