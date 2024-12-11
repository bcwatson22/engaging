"use client";

import { type NextPage } from "next";

import { MugshotSkeleton } from "@/components/organisms/Mugshot/Mugshot";

const LoadingPage: NextPage = () => (
  <main className="home main">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotSkeleton />
  </main>
);

export default LoadingPage;
