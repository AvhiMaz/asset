"use client";

import Navbar from "@/components/nav";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time";
import { Input } from "@/components/ui/input";
import { pinata } from "@/lib/config";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";

// const PROGRAM_ID = new PublicKey("J1Zk92BRXxaAv3obJkEVSx2qjpHRVM2cziTG1e1zDfzY");

export default function CreateVault() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [recipient, setRecipient] = useState("");
  console.log("recipient", recipient)
  const [solAmount, setSolAmount] = useState("");
  console.log("solAmount", solAmount)
  const [unlockTimestamp, setUnlockTimestamp] = useState<number>(Date.now());

  const { connection } = useConnection();
  const wallet = useAnchorWallet();


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

  const createVault = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {

      const idlRes = await fetch("/idl/contract.json");
      const idl = await idlRes.json();
      console.log("idl", idl)

      const provider = new anchor.AnchorProvider(connection, wallet, {});
      console.log("provider", provider)
      console.log("working");
      const program = new anchor.Program(idl as anchor.Idl, {
        connection,
      });

      const unlockTime = new anchor.BN(Math.floor(Date.now() / 1000) - 60);

      const vaultKeypair = anchor.web3.Keypair.generate();
      const [vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vault"),
          wallet.publicKey.toBuffer(),
          unlockTime.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const assetType = { sol: {} };
      const tx = await program.methods.initVault(
        new anchor.BN(unlockTime),
        vaultBump,
        assetType,
        recipient,
        url
      )
        .accounts({
          vault: vaultKeypair.publicKey,
          user: wallet,
          systemProgram: SystemProgram.programId,
        })
        .signers([])
        .rpc();

      toast.success("Vault created successfully!");
      console.log("Transaction signature:", tx);
    } catch (err) {
      console.error(err);
      toast.error("Transaction failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-white to-[#a7c7f8] flex flex-col items-center justify-center">
      <Navbar />
      <h1 className="text-4xl font-extrabold mt-14">create vault</h1>
      <main className="p-6 mt-4 rounded-2xl shadow-2xl w-[90%] max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Recipient Address*</label>
          <Input required type="text" placeholder="Recipient" onChange={(e) => setRecipient(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Amount of SOL</label>
          <Input type="number" placeholder="SOL" onChange={(e) => setSolAmount(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Unlock Time (timestamp)</label>
          <Input type="number" value={unlockTimestamp} onChange={(e) => setUnlockTimestamp(Number(e.target.value))} />
          <DateTimePicker />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Select File (image, voice, text)</label>
          <div className="flex gap-2 items-center">
            <Input type="file" onChange={(e) => setFile(e.target?.files?.[0])} />
            <Button variant="outline" disabled={uploading} onClick={uploadFile}>
              {uploading ? <Loader2 className="animate-spin" /> : isUploaded ? <CheckCircle className="text-green-500" /> : "Upload"}
            </Button>
          </div>
        </div>

        <Button className="mt-4 w-full" onClick={createVault}>create</Button>
      </main>
    </div>
  );
}

