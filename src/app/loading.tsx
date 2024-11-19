"use client";

import { MugshotSkeleton } from "@/components/organisms/Mugshot";
import { NextPage } from "next";

const Loading: NextPage = () => (
  <main className="main">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotSkeleton />
  </main>
);

export default Loading;
