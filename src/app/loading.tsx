"use client";

import { NextPage } from "next";

import { MugshotSkeleton } from "@/components/organisms/Mugshot/Mugshot";

const Loading: NextPage = () => (
  <main className="home main">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotSkeleton />
  </main>
);

export default Loading;
