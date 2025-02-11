"use client";

import { useState } from "react";
import { motion, type Target } from "framer-motion";
import dayjs from "dayjs";

import { Icon } from "@/components/atoms/Icon/Icon";

import { cookieName } from "@/constants/common";

const slideUp: Target = { y: 0, opacity: 1 };
const slideDown: Target = { y: 50, opacity: 0 };

const today = dayjs().year();

const Cookie = () => {
  const hasWindow = typeof window !== "undefined";
  const [showBanner, setShowBanner] = useState<boolean>(
    hasWindow && !localStorage.getItem(cookieName)
  );

  const handleDismiss = () => {
    setShowBanner(false);

    if (hasWindow) localStorage.setItem(cookieName, "dismissed");
  };

  return (
    <motion.footer
      key="footer"
      initial={slideDown}
      animate={slideUp}
      className="footer"
    >
      <motion.p
        key="copy"
        initial={showBanner ? { left: 0, translateX: 0 } : {}}
        animate={
          !showBanner
            ? { position: "absolute", left: "50%", translateX: "-50%" }
            : {}
        }
        transition={{ delay: 0.3 }}
        suppressHydrationWarning
      >
        &copy; {today}
      </motion.p>
      <motion.aside
        key="aside"
        animate={showBanner ? {} : { ...slideDown, position: "absolute" }}
        className="cookie"
      >
        <Icon icon="Cookie" />
        <p>We use cookies for a sweet user experience.</p>
        <button className="dismiss" onClick={handleDismiss}>
          <Icon icon="Cross" isHidden={false} />
        </button>
      </motion.aside>
    </motion.footer>
  );
};

export { Cookie };
