"use client";

import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { Loading } from "@/components/pages/Loading/Loading";

const DownloadPage: NextPage = () => {
  /* oxlint-disable-next-line typescript/unbound-method -- destructuring the
     router is Next's documented API; its methods are already bound. */
  const { push } = useRouter();

  const downloadFile = useCallback(() => {
    try {
      const link = document.createElement("a");
      link.setAttribute("href", "/billy-watson-cv.pdf");
      link.setAttribute("download", "");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      push("/cv");
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }, [push]);

  useEffect(() => {
    downloadFile();
  }, [downloadFile]);

  return <Loading />;
};

export default DownloadPage;
