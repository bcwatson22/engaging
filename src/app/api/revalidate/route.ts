import { revalidatePath, revalidateTag } from "next/cache";

import { cmsTag } from "@/data/functions/getData";

/* Header rather than a query param, so the secret never lands in an access
   log. revalidatePath alongside the tag is belt-and-braces: two lines to
   remove any doubt about prerendered segments being refreshed. */
const secretHeader = "x-revalidate-secret";
const paths = ["/", "/cv"];

/* Next 16 requires a cacheLife profile here. updateTag would expire the entry
   immediately but throws outside a Server Action, so "max" is the form Next's
   own deprecation notice points route handlers at. */
const cacheProfile = "max";

const POST = async (request: Request): Promise<Response> => {
  if (request.headers.get(secretHeader) !== process.env.REVALIDATE_SECRET)
    return new Response(null, { status: 401 });

  revalidateTag(cmsTag, cacheProfile);
  for (const path of paths) revalidatePath(path);

  return Response.json({ revalidated: true });
};

export { POST, secretHeader, paths, cacheProfile };
