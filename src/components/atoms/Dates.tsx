import dayjs from "dayjs";

type Props = {
  dates: string[];
  className?: string;
};

const dateFormat = "MMMM YYYY";

export const Dates = ({ dates, className }: Props) => {
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
