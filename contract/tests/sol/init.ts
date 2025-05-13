import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { Contract } from "../../target/types/contract";

describe("sol", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Contract as Program<Contract>;
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  const creator = wallet.payer;

  let vaultPda: PublicKey;
  let vaultBump: number;
  let recipient: anchor.web3.Keypair;
  let unlockTime: anchor.BN;
  let memo = "can_be_anything";
  let amount = new anchor.BN(10000);

  before(async () => {
    recipient = anchor.web3.Keypair.generate();
    unlockTime = new anchor.BN(Math.floor(Date.now() / 1000) - 60);

    function bnToBigEndianBuffer(
      bn: anchor.BN,
      byteLength: number = 8
    ): Buffer {
      const hex = bn
        .toTwos(byteLength * 8)
        .toString(16)
        .padStart(byteLength * 2, "0");
      return Buffer.from(hex, "hex");
    }

    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("solvault"),
        creator.publicKey.toBuffer(),
        bnToBigEndianBuffer(unlockTime), // <-- now matches Rust
      ],
      program.programId
    );
  });
  it("initializing sol vault", async () => {
    console.log("Initializing vault...");

    const tx = await program.methods
      .initSolVault(recipient.publicKey, unlockTime, memo, amount)
      .accounts({
        creator: creator.publicKey,
      })
      .signers([])
      .rpc();

    console.log("Signature:", tx);

    const vaultData = await program.account.vault.fetch(vaultPda);

    expect(vaultData.creator.toBase58()).to.equal(creator.publicKey.toBase58());
    expect(vaultData.recipient.toBase58()).to.equal(
      recipient.publicKey.toBase58()
    );
    expect(vaultData.unlockTime.toNumber()).to.equal(unlockTime.toNumber());
    expect(vaultData.isClaimed).to.be.false;
  });
});
