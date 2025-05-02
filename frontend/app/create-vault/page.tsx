"use client";

import Navbar from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pinata } from "@/lib/config";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatVault() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isUploaded, setIsUploaded] = useState(false);

  console.log(url);

  const uploadFile = async () => {
    if (!file) {
      toast("No file selected", {
        description: "Please select a file",
        style: {
          fontWeight: "500px"
        }
      })
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
      setIsUploaded(true);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-white to-[#a7c7f8] flex flex-col items-center justify-center">
      <Navbar />
      <h1 className="text-4xl md:text-5xl lg:text-5xl tracking-tighter font-extrabold mt-14 md:mt-10 lg:mt-10">create vault</h1>
      <main className="p-6 md:p-10 lg:p-14 mt-4 md:mt-6 lg:mt-6 rounded-2xl shadow-2xl w-[90%] max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Recipient Address*</label>
          <Input required type="text" placeholder="CFMyDXxFozMqDnpgefi9iuKkzxydRWbWumiDxSFwwUxz" />
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
            <Input className="text-gray-700" type="file" onChange={handleChange} />
            <Button variant="outline" type="button" disabled={uploading} onClick={uploadFile}>
              {uploading ? <Loader2 className="animate-spin" /> : isUploaded ? <CheckCircle className="text-green-500" /> : "Upload"}
            </Button>
          </div>
        </div>
        <Button type="submit" className="mt-4 w-full">create</Button>
      </main>
    </div>
  );
}
