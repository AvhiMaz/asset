"use client";

import { useState } from "react";
import { pinata } from "../../lib/config";
import { AuroraBackground } from "@/components/ui/aurora-background";
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
      <input type="file" onChange={handleChange} />
      <button type="button" disabled={uploading} onClick={uploadFile}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {url && <img src={url} alt="Image from Pinata" />}
    </AuroraBackground>

  );
}
