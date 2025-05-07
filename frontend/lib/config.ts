"server only"

import { PinataSDK } from "pinata"
import { Idl, Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import idl from "@/idl/contract.json";

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
})

export const programId = new PublicKey(idl.address);

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(idl as Idl, {
  connection,
});

export const PROGRAM_ID = new PublicKey("J1Zk92BRXxaAv3obJkEVSx2qjpHRVM2cziTG1e1zDfzY")
