"use client";

import { useState } from "react";
import { motion, type Target } from "framer-motion";

import { Copyright } from "@/components/atoms/Copyright/Copyright";
import { Icon } from "@/components/atoms/Icon/Icon";

import { cookieName } from "@/constants/common";

type Props = {
  message: string;
  hasCopyright?: boolean;
  className?: string;
};

const slideDown: Target = { y: 50, opacity: 0 };

const Cookie = ({ message, hasCopyright = false, className }: Props) => {
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
      initial={{ opacity: 0 }}
      animate={!hasCopyright && !showBanner ? slideDown : { opacity: 1 }}
      className={`footer${className ? " " + className : ""}`}
    >
      <motion.aside
        key="aside"
        initial={{ opacity: 0 }}
        animate={
          showBanner ? { opacity: 1 } : { ...slideDown, position: "absolute" }
        }
        className="cookie"
      >
        <Icon icon="Cookie" />
        <p>{message}</p>
        <button className="dismiss" onClick={handleDismiss}>
          <Icon icon="Cross" isHidden={false} />
        </button>
      </motion.aside>
      {hasCopyright && <Copyright showRights={!showBanner} />}
    </motion.footer>
  );
};

export { Cookie };
export type { Props as CookieProps };
