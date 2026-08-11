import dayjs from "dayjs";

const today = dayjs().year();

const Copyright = () => (
  <p className="copy" suppressHydrationWarning>
    &copy; {today}. All rights reserved
  </p>
);

export { Copyright };
