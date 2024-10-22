import Image from "next/image";
import dayjs from "dayjs";

const dateFormat = "MMMM YYYY";

export const Gig = ({
  id,
  role,
  company,
  logo,
  city,
  capacity,
  dates,
  bullets,
}: Gig) => {
  const startDate = dates[0];
  const dateFrom = dayjs(startDate).format(dateFormat);
  const endDate = dates[1];
  const hasEndDate = !!endDate;
  const dateTo = hasEndDate ? dayjs(endDate).format(dateFormat) : "present";

  return (
    <section key={id}>
      <h3 className="mb-2 leading-8 text-theme-2-b">{role}</h3>
      <p>
        {company}, {city}; {capacity}
      </p>
      <p className="mb-2">
        <time dateTime={startDate}>{dateFrom}</time>
        {startDate !== endDate && (
          <>
            {" - "}
            {hasEndDate ? <time dateTime={endDate}>{dateTo}</time> : dateTo}
          </>
        )}
      </p>
      {logo?.url && (
        <Image
          src={logo.url}
          alt={`${company} logo`}
          width={100}
          height={100}
          priority
        />
      )}
      <ul>
        {bullets.map((bullet) => (
          <li key={`${bullet.at(0)}-${bullet.at(1)}`}>{bullet}</li>
        ))}
      </ul>
    </section>
  );
};
