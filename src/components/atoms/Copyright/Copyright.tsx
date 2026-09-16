import dayjs from 'dayjs';

const today = dayjs().year();

const Copyright = () => (
  <p
    className="text-center text-sm text-balance print:hidden"
    suppressHydrationWarning
  >
    &copy; {today} Engage+Engineer Ltd (Company No. 14773945). All rights
    reserved.
  </p>
);

export { Copyright };
