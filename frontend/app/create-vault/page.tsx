"use client";

import { useState } from "react";
import { pinata } from "../../lib/config";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import Navbar from "@/components/nav";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    try {
      setUploading(true);
      const urlRequest = await fetch("/api/url");
      const urlResponse = await urlRequest.json();
      const upload = await pinata.upload.public
        .file(file)
        .url(urlResponse.url);
      const fileUrl = await pinata.gateways.public.convert(upload.cid)
      setUrl(fileUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  return (

    <AuroraBackground>
      <Navbar />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative min-h-screen w-full flex flex-col gap-4 items-center justify-center lowercase"
      >
        <input type="file" onChange={handleChange} />
        <button type="button" disabled={uploading} onClick={uploadFile}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {url && <img src={url} alt="Image from Pinata" />}
      </motion.div>
    </AuroraBackground>

  );
}
