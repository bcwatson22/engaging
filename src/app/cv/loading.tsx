"use client";

import { DetailsSkeleton } from "@/components/molecules/Details";
import { HeaderSkeleton } from "@/components/molecules/Header";
import { GigSkeleton } from "@/components/organisms/Gig";
import { Section } from "@/components/organisms/Section";
import { NextPage } from "next";

const Loading: NextPage = () => (
  <main className="cv main">
    <div className="wrapper">
      <div className="inner">
        <HeaderSkeleton />
        <div className="sections">
          <Section heading="Digits" margin="0px">
            <DetailsSkeleton hasParagraph={true} />
          </Section>
          <Section heading="Experience" margin="0px">
            {[...Array(3).keys()].map((key) => (
              <GigSkeleton key={key} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  </main>
);

export default Loading;
