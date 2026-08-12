import { revalidatePath, revalidateTag } from "next/cache";

import { cmsTag } from "@/data/functions/getData";

/* Header rather than a query param, so the secret never lands in an access
   log. revalidatePath alongside the tag is belt-and-braces: two lines to
   remove any doubt about prerendered segments being refreshed. */
const secretHeader = "x-revalidate-secret";
const paths = ["/", "/cv"];

/* Next 16 requires a cacheLife profile here, and it must be `{ expire: 0 }`.
   Next only performs a hard invalidation when the profile's expire is 0 —
   anything else, including the "max" its deprecation notice suggests, is
   treated as a stale-while-revalidate update that keeps serving the old value.
   ("max" is a one-year expire.) updateTag would expire immediately but throws
   outside a Server Action, so this is the form route handlers need. */
const cacheProfile = { expire: 0 };

const POST = async (request: Request): Promise<Response> => {
  if (request.headers.get(secretHeader) !== process.env.REVALIDATE_SECRET)
    return new Response(null, { status: 401 });

  revalidateTag(cmsTag, cacheProfile);
  for (const path of paths) revalidatePath(path);

  return Response.json({ revalidated: true });
};

export { POST, secretHeader, paths, cacheProfile };
