import { NextPage } from "next";

const Home: NextPage = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Engaging Engineering</h1>
    </main>
  );
};

export const revalidate = 3600 * 24;

export default Home;
