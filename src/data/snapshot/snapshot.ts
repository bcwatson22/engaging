import type { TCV } from "@/data/types/cv";
import type { THome } from "@/data/types/home";

import cv from "./cv.json";
import home from "./home.json";

/* The double assertion is the point, not a wart: it is the single seam
   between generated JSON and the type graph, so a schema change can no
   longer break `tsc` until megabytes of data are hand-edited. It is also
   unavoidable — TLink.icon is a string-literal union, which raw JSON can
   only ever infer as `string`. */

const snapshotCV = cv as unknown as TCV;
const snapshotHome = home as unknown as THome;

export { snapshotCV, snapshotHome };
