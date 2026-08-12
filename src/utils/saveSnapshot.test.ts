import { writeFile } from "fs/promises";
import path from "path";

import { queryCV } from "../queries/cv.js";
import { queryHome } from "../queries/home.js";
import { saveSnapshot, errorMessage, snapshotDir } from "./saveSnapshot.js";

/* Mocked at the module boundary rather than spied on: this is the structural
   guarantee that a test run can never write over the real snapshot, which is
   exactly how the old saveData kept clobbering its own fixtures.

   `default` has to be overridden alongside the named export — fs/promises is
   a builtin, so a named import can resolve through the default interop object
   and pick up the real writeFile, which silently defeats the mock. */
vi.mock(import("fs/promises"), async (importOriginal: Function) => {
  const actual = await importOriginal();
  const writeFile = vi.fn<typeof import("fs/promises").writeFile>();

  return { ...actual, default: { ...actual.default, writeFile }, writeFile };
});

const mockHome = { id: "home-id" };
const mockCV = { id: "cv-id" };

const endpoint = "https://example.com/graphql";
const token = "mock-token";

type Options = {
  ok?: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
};

const okBody = {
  data: { homes: [mockHome], cvs: [mockCV] },
};

const setup = ({
  ok = true,
  status = 200,
  statusText = "OK",
  body = okBody,
}: Options = {}) => {
  process.env.HYGRAPH_ENDPOINT = endpoint;
  process.env.HYGRAPH_TOKEN = token;

  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
    ok,
    status,
    statusText,
    json: vi.fn<Response["json"]>().mockResolvedValue(body),
  } as unknown as Response);

  global.fetch = fetchMock;

  return { fetchMock };
};

const pathFor = (name: string) =>
  path.join(process.cwd(), `${snapshotDir}/${name}.json`);

describe("saveSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("when both queries succeed", () => {
    it("posts each query to the CMS with the auth header", async () => {
      const { fetchMock } = setup();

      await saveSnapshot();

      expect(fetchMock).toHaveBeenNthCalledWith(1, endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: queryHome }),
        cache: "no-store",
      });
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        endpoint,
        expect.objectContaining({
          body: JSON.stringify({ query: queryCV }),
        }),
      );
    });

    it("writes both snapshots pretty-printed and newline-terminated", async () => {
      setup();

      await saveSnapshot();

      expect(writeFile).toHaveBeenNthCalledWith(
        1,
        pathFor("home"),
        `${JSON.stringify(mockHome, null, 2)}\n`,
      );
      expect(writeFile).toHaveBeenNthCalledWith(
        2,
        pathFor("cv"),
        `${JSON.stringify(mockCV, null, 2)}\n`,
      );
    });
  });

  describe("when the request fails", () => {
    /* Fail-soft is the contract: a stale snapshot still builds a working
       site, so nothing here may throw or leave a partial file behind. */
    it("logs and leaves the snapshot untouched on a non-ok response", async () => {
      setup({ ok: false, status: 500, statusText: "Server Error" });

      await saveSnapshot();

      expect(writeFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        errorMessage,
        new Error("500 Server Error"),
      );
    });

    it("logs GraphQL errors", async () => {
      setup({
        body: { errors: [{ message: "first" }, { message: "second" }] },
      });

      await saveSnapshot();

      expect(writeFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        errorMessage,
        new Error("first, second"),
      );
    });

    it("logs when the response holds no data", async () => {
      setup({ body: {} });

      await saveSnapshot();

      expect(writeFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        errorMessage,
        new Error("No homes returned"),
      );
    });

    it("logs when the requested collection is empty", async () => {
      setup({ body: { data: { homes: [] } } });

      await saveSnapshot();

      expect(writeFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        errorMessage,
        new Error("No homes returned"),
      );
    });
  });
});
