"use client";

import { motion, type Target } from "framer-motion";
import dayjs from "dayjs";

type Props = {
  showRights?: boolean;
};

const growFromRight: Target = { width: 0, opacity: 0 };
const today = dayjs().year();

const Copyright = ({ showRights = true }: Props) => (
  <p className="copy" suppressHydrationWarning>
    &copy; {today}
    <motion.span
      key="rights"
      initial={growFromRight}
      animate={showRights ? { width: "auto", opacity: 1 } : {}}
      className="rights"
    >
      . All rights reserved
    </motion.span>
  </p>
);

export { Copyright };
export type { Props as CopyrightProps };
