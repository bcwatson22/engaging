import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";

import { useInView } from "framer-motion";

import { useScrollTrigger, type Params } from "./useScrollTrigger";

vi.mock("framer-motion", () => ({
  useInView: vi.fn(),
}));

type UseInView = Partial<ReturnType<typeof useInView>>;

type SetupOptions = {
  useInView: UseInView;
};

const mockRef = "mockRef";

const defaultParams: Params = {
  ref: {
    current: mockRef as unknown as HTMLDivElement,
  },
  delay: 2,
  margin: "-40px",
};

const setup = (options?: Partial<SetupOptions>, params?: Partial<Params>) => {
  const setupOptions: SetupOptions = {
    useInView: true,
    ...options,
  };

  (useInView as Mock).mockReturnValue(setupOptions.useInView);

  return renderHook<ReturnType<typeof useScrollTrigger>, Params>(
    (args) => useScrollTrigger(args),
    {
      initialProps: {
        ...defaultParams,
        ...params,
      },
    }
  );
};

describe("useScrollTrigger", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns animation props", () => {
    const {
      result: { current },
    } = setup();

    expect(current).toEqual({
      animate: {
        opacity: 1,
        y: 0,
      },
      initial: {
        opacity: 0,
        y: "10px",
      },
      transition: {
        delay: defaultParams.delay,
      },
    });
  });

  it("returns an empty animate object if useInView returns false", () => {
    const {
      result: {
        current: { animate },
      },
    } = setup({ useInView: false });

    expect(animate).toEqual({});
  });

  describe("ref // margin", () => {
    it("is passed to useInView call", () => {
      setup();

      expect(useInView).toHaveBeenNthCalledWith(
        1,
        { current: mockRef },
        expect.objectContaining({ margin: defaultParams.margin })
      );
    });
  });

  describe("delay", () => {
    it("is returned in transition object", () => {
      const mockDelay = 22;

      const {
        result: {
          current: { transition },
        },
      } = setup({}, { delay: mockDelay });

      expect(transition?.delay).toBe(mockDelay);
    });
  });
});
