import { cleanup, render } from "@testing-library/react";

import LoadingPage from "@/app/cv/loading";

import { Loading } from "@/components/pages/Loading/Loading";

vi.mock("@/components/pages/Loading/Loading", () => ({
  Loading: vi.fn(),
}));

const setup = () => render(<LoadingPage />);

describe("Loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a Loading component", () => {
    setup();

    expect(Loading).toHaveBeenCalledTimes(1);
  });
});
