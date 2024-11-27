import type { Metadata } from "next";
import { NextPage } from "next";

import { home } from "@/queries/home";

import { Particles } from "@/components/atoms/Particles";
import { Mugshot } from "@/components/organisms/Mugshot";

// import { mockHome } from "@/data/home";
import { getData } from "@/data/getData";
import { saveData } from "@/data/saveData";
import { mockHome } from "@/data/testerson-home";

const generateMetadata = async (): Promise<Metadata> => {
  const { title, description } = await getData<Home>(home, "homes", mockHome);

  return {
    title,
    description,
  };
};

const Home: NextPage = async () => {
  const data = await getData<Home>(home, "homes", mockHome);

  const { title, mugshot, technologies } = data;

  saveData(data, "Home");

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
