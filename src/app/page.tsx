import { type NextPage, type Metadata } from "next";

import { queryHome } from "@/queries/home";

import { type THome } from "@/data/types/home";
import { getData } from "@/data/functions/getData";
import { saveData } from "@/data/functions/saveData";
import { cacheHome } from "@/data/cache/home";

import { Particles } from "@/components/atoms/Particles/Particles";
import { Mugshot } from "@/components/organisms/Mugshot/Mugshot";

const generateMetadata = async (): Promise<Metadata> => {
  const { title, description } = await getData<THome>(
    queryHome,
    "homes",
    cacheHome
  );

  return {
    title,
    description,
  };
};

const Home: NextPage = async () => {
  const data = await getData<THome>(queryHome, "homes", cacheHome);

  saveData(data, "Home", 3);

  const { title, mugshot, technologies } = data;

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
