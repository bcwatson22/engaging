"use client";

import { useState } from "react";
import { motion, type Target } from "framer-motion";

import { Icon } from "@/components/atoms/Icon/Icon";

import { cookieName } from "@/constants/common";

const slideDown: Target = { y: 50, opacity: 0 };

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
    <motion.aside
      key="banner"
      initial={slideDown}
      animate={!showBanner ? slideDown : { y: 0, opacity: 1 }}
      className="cookie"
    >
      <Icon icon="Cookie" />
      <p>This site uses cookies for a sweet user experience.</p>
      <button className="dismiss" onClick={handleDismiss}>
        <Icon icon="Cross" isHidden={false} />
      </button>
    </motion.aside>
  );
};

export { Cookie };
