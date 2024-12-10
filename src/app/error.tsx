"use client";

import { type NextPage } from "next";

import { Particles } from "@/components/atoms/Particles/Particles";
import { MugshotError } from "@/components/organisms/Mugshot/Mugshot";

const Error: NextPage = () => (
  <main className="home main">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotError />
    <Particles />
  </main>
);

export default Error;
