"use client";

import { NextPage } from "next";

import { Particles } from "@/components/atoms/Particles";
import { MugshotError } from "@/components/organisms/Mugshot";

const Error: NextPage = () => (
  <main className="home main">
    <h1 className="sr-only">Engaging Engineering</h1>
    <MugshotError />
    <Particles />
  </main>
);

export default Error;
