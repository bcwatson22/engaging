import { revalidatePath, revalidateTag } from "next/cache";

import { POST, secretHeader, paths } from "@/app/api/revalidate/route";
import { cmsTag } from "@/data/functions/getData";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn<typeof import("next/cache").revalidateTag>(),
  revalidatePath: vi.fn<typeof import("next/cache").revalidatePath>(),
  unstable_cache: vi.fn<typeof import("next/cache").unstable_cache>(
    (callback) => callback,
  ),
}));

const secret = "mock-secret";

type Options = {
  header?: string | null;
};

const setup = async ({ header = secret }: Options = {}) => {
  process.env.REVALIDATE_SECRET = secret;

  const request = new Request("https://example.com/api/revalidate", {
    method: "POST",
    headers: header === null ? {} : { [secretHeader]: header },
  });

  return await POST(request);
};

describe("revalidate", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("when the secret matches", () => {
    it("invalidates the CMS tag and both prerendered paths", async () => {
      await setup();

      /* expire must be 0: Next only hard-invalidates on a zero expire, and
         treats any other profile as stale-while-revalidate that keeps serving
         the old value. */
      expect(revalidateTag).toHaveBeenNthCalledWith(1, cmsTag, { expire: 0 });
      expect(revalidatePath).toHaveBeenNthCalledWith(1, paths[0]);
      expect(revalidatePath).toHaveBeenNthCalledWith(2, paths[1]);
    });

    it("confirms the revalidation", async () => {
      const response = await setup();

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ revalidated: true });
    });
  });

  describe("when the secret does not match", () => {
    it("rejects a wrong secret without revalidating", async () => {
      const response = await setup({ header: "wrong" });

      expect(response.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("rejects a missing header without revalidating", async () => {
      const response = await setup({ header: null });

      expect(response.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
