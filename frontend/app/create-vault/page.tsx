"use client";

import Navbar from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pinata } from "@/lib/config";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  console.log(url);

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
    <div className="w-full min-h-screen bg-[#dee9fb] flex flex-col items-center justify-center">
      <Navbar />
      <h1 className="text-2xl lg:text-5xl tracking-tighter font-extrabold mt-10 ">create vault</h1>
      <main className="p-6 md:p-10 lg:p-14 mt-6 rounded-2xl shadow-2xl w-[90%] max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Recipient Address</label>
          <Input type="text" placeholder="CFMyDXxFozMqDnpgefi9iuKkzxydRWbWumiDxSFwwUxz" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Amount of SOL</label>
          <Input type="text" placeholder="SOL" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Amount of USDC</label>
          <Input type="text" placeholder="USDC" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Select File (image, voice, text)</label>
          <div className="flex gap-2 items-center">
            <Input className="text-center" type="file" onChange={handleChange} />
            <Button variant="outline" type="button" disabled={uploading} onClick={uploadFile}>
              {uploading ? <Loader2 className="animate-spin" /> : "Upload"}
            </Button>
          </div>
        </div>
        <Button className="mt-4 w-full">Create</Button>
      </main>
    </div>
  );
}
