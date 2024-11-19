"use client";

import { MugshotSkeleton } from "@/components/organisms/Mugshot";
import { NextPage } from "next";

const Loading: NextPage = () => (
  <main className="main">
    <div className="inner"></div>
    <h1 className="sr-only">Billy Watson</h1>
    <MugshotSkeleton />
  </main>
);

export default Loading;
