"use-client";

import dayjs from "dayjs";

type TProps = {
  dates: string[];
  className?: string;
};

const dateFormat = "MMMM YYYY";

const Dates = ({ dates, className }: TProps) => {
  const startDate = dates[0];
  const dateFrom = dayjs(startDate).format(dateFormat);
  const endDate = dates[1];
  const hasEndDate = !!endDate;
  const dateTo = hasEndDate ? dayjs(endDate).format(dateFormat) : "present";

  return (
    <p className={`italic mt-0${className ? " " + className : ""}`}>
      <time dateTime={startDate}>{dateFrom}</time>
      {startDate !== endDate && (
        <>
          {" - "}
          {hasEndDate ? <time dateTime={endDate}>{dateTo}</time> : dateTo}
        </>
      )}
    </p>
  );
};

export { Dates };
export type { TProps as DatesProps };
