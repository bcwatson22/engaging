import type { Metadata } from "next";
import { NextPage } from "next";
import { OperationResult } from "@urql/core";

import { home } from "@/queries/home";
import { client } from "@/queries/client";

import { Particles } from "@/components/atoms/Particles";
import { Mugshot } from "@/components/organisms/Mugshot";

import { mockHome } from "@/mocks/home";

type Result = { homes: Home[] };

const getData = async (): Promise<Home> => {
  const { data }: OperationResult<Result> = await client().query(home, {});

  return data ? data.homes[0] : mockHome;
};

const generateMetadata = async (): Promise<Metadata> => {
  const { title, description } = await getData();

  return {
    title,
    description,
  };
};

const Home: NextPage = async () => {
  const { title, mugshot, technologies } = await getData();

  return (
    <main className="home main">
      <h1 className="sr-only">{title}</h1>
      <Mugshot mugshot={mugshot} technologies={technologies} />
      <Particles />
    </main>
  );
};

const revalidate = 3600 * 24;

export default Home;
export { generateMetadata, revalidate };
