import { DetailsSkeleton } from "@/components/molecules/Details/Details";
import { HeaderSkeleton } from "@/components/molecules/Header/Header";
import { GigSkeleton } from "@/components/organisms/Gig/Gig";
import { Section } from "@/components/organisms/Section/Section";

const Loading = () => (
  <main className="cv main">
    <div className="wrapper">
      <div className="inner">
        <HeaderSkeleton />
        <div className="sections mt-[130px] lg:mt-[116px]">
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

export { Loading };
