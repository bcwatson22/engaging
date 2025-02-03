"use client";

import dynamic from "next/dynamic";

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  {
    ssr: false,
  }
);

const Tracking = () => <Analytics />;

export { Tracking };
