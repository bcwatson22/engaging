"use client";

import { useCallback, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/pages/Loading/Loading";

const DownloadPage: NextPage = () => {
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
