"use client";

import Navbar from "@/components/nav";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time";
import { Input } from "@/components/ui/input";
import { pinata } from "@/lib/config";
// import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
// import { useAnchorWallet } from "@solana/wallet-adapter-react";
// import { useProgram } from "@/lib/solana/hooks/use-program";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateVault() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  console.log("url", url)
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [recipient, setRecipient] = useState("");
  console.log("recipient", recipient)
  const [solAmount, setSolAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  console.log("usdcAmount", usdcAmount)
  console.log("solAmount", solAmount)
  const [unlockTimestamp, setUnlockTimestamp] = useState<number>(Date.now());
  console.log("unlockTimestamp", unlockTimestamp)
  const [selectedAsset, setSelectedAsset] = useState("");

  // const wallet = useAnchorWallet();
  // const { program, provider } = useProgram();
  //
  const uploadFile = async () => {
    if (!file) {
      toast("No file selected", {
        description: "Please select a file",
        style: { fontWeight: "500px" }
      });
      return;
    }

    try {
      setUploading(true);
      const urlRequest = await fetch("/api/url");
      const urlResponse = await urlRequest.json();
      const upload = await pinata.upload.public.file(file).url(urlResponse.url);
      const fileUrl = await pinata.gateways.public.convert(upload.cid);
      setUrl(fileUrl);
      setUploading(false);
      setIsUploaded(true);
    } catch (e) {
      console.error(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  // const createVault = async () => {
  //
  //   if (!program || !provider) {
  //     toast.error("Please connect your wallet");
  //     return;
  //   }
  //   if (!wallet) {
  //     toast.error("Please connect your wallet");
  //     return;
  //   }
  //
  //   try {
  //
  //     const unlockTime = new anchor.BN(Math.floor(Date.now() / 1000) - 60);
  //
  //     const vaultKeypair = anchor.web3.Keypair.generate();
  //     const [vaultBump] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("vault"),
  //         wallet.publicKey.toBuffer(),
  //         unlockTime.toArrayLike(Buffer, "le", 8),
  //       ],
  //       program.programId
  //     );
  //
  //     const assetType = { sol: {} };
  //     const tx = await program.methods.initVault(
  //       new anchor.BN(unlockTime),
  //       vaultBump,
  //       assetType,
  //       url,
  //       recipient,
  //     )
  //       .accounts({
  //         user: wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([])
  //       .rpc();
  //
  //     toast.success("Vault created successfully!");
  //     console.log("Transaction signature:", tx);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Transaction failed");
  //   }
  // };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-white to-[#a7c7f8] flex flex-col items-center justify-center">
      <Navbar />
      <h1 className="text-4xl font-extrabold mt-14">create vault</h1>
      <main className="p-6 mt-4 rounded-2xl shadow-2xl w-[90%] max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">recipient wallet address*</label>
          <Input required type="text" placeholder="recipient wallet address" onChange={(e) => setRecipient(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">select what you want to lock for future*</label>

          <Select onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="select an asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sol">sol</SelectItem>
              <SelectItem value="usdc">usdc</SelectItem>
              <SelectItem value="file">file</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Unlock Time</label>
          <DateTimePicker onChange={(timestamp) => setUnlockTimestamp(timestamp)} />
        </div>



        {selectedAsset === "sol" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Amount of SOL</label>
            <Input type="number" placeholder="SOL" onChange={(e) => setSolAmount(e.target.value)} />
          </div>
        )}

        {selectedAsset === "usdc" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Amount of USDC</label>
            <Input type="number" placeholder="USDC" onChange={(e) => setUsdcAmount(e.target.value)} />
          </div>
        )}

        {selectedAsset === "file" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Select File (image, voice, text)</label>
            <div className="flex gap-2 items-center">
              <Input type="file" onChange={(e) => setFile(e.target?.files?.[0])} />
              <Button variant="outline" disabled={uploading} onClick={uploadFile}>
                {uploading ? <Loader2 className="animate-spin" /> : isUploaded ? <CheckCircle className="text-green-500" /> : "Upload"}
              </Button>
            </div>
          </div>
        )}

        <Button className="mt-4 w-full">create</Button>
      </main>
    </div>
  );
}

