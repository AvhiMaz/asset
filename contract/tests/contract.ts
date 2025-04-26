import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Contract } from "../target/types/contract";
import { expect } from "chai";
import {
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createMint,
  getAssociatedTokenAddress,
  mintTo,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";

describe("contract", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Contract as Program<Contract>;
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  const payer = wallet.payer;

  let vaultPda: PublicKey;
  let vaultBump: number;
  let vaultUsdcAccount: PublicKey;
  let payerTokenAccount: PublicKey;
  let recipientTokenAccount: PublicKey;
  let recipient: anchor.web3.Keypair;
  let unlockTime: anchor.BN;
  let assetType: any;
  let assetReference: string;
  let tokenMint: PublicKey;

  before(async () => {
    recipient = anchor.web3.Keypair.generate();
    unlockTime = new anchor.BN(Math.floor(Date.now() / 1000) - 60);
    assetType = { usdc: {} };
    assetReference = "some_asset_reference";

    tokenMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      6
    );

    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        payer.publicKey.toBuffer(),
        unlockTime.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    vaultUsdcAccount = await getAssociatedTokenAddress(tokenMint, vaultPda, true);
    payerTokenAccount = await getAssociatedTokenAddress(tokenMint, payer.publicKey, false);
    recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipient.publicKey,
    );

    const payerAccountInfo = await provider.connection.getAccountInfo(payerTokenAccount);
    if (!payerAccountInfo) {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        payer.publicKey,
        payerTokenAccount,
        payer.publicKey,
        tokenMint
      );
      const tx = new Transaction().add(createAtaIx);
      await provider.sendAndConfirm(tx);
    }
    
    const accountInfo = await provider.connection.getAccountInfo(recipientTokenAccount);
    if (!accountInfo) {
      await createAssociatedTokenAccount(
        provider.connection,
        payer,
        tokenMint,
        recipient.publicKey
      );
    }
    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      payerTokenAccount,
      payer,
      1_000_000_000 
    );
  });

  it("initializes vault", async () => {
    console.log("Initializing vault...");
    
    const tx = await program.methods
      .initVault(
        unlockTime,
        vaultBump,
        assetType,
        assetReference,
        recipient.publicKey
      )
      .accounts({
        creator: payer.publicKey,
        usdcMint: tokenMint,
      })
      .signers([])
      .rpc();

    console.log("Signature:", tx);
    
    const vaultData = await program.account.vault.fetch(vaultPda);

    expect(vaultData.creator.toBase58()).to.equal(payer.publicKey.toBase58());
    expect(vaultData.recipient.toBase58()).to.equal(recipient.publicKey.toBase58());
    expect(vaultData.unlockTime.toNumber()).to.equal(unlockTime.toNumber());
    expect(vaultData.assetReference).to.equal(assetReference);
    expect(vaultData.isClaimed).to.be.false;
  });

  it("Transfers USDC into vault", async () => {
    console.log("Transfering USDC from creator to vault...");
        
    const tx = await program.methods
      .transfer(new anchor.BN(1_000_000_000))
      .accounts({
        vault: vaultPda,
        creatorTokenAccount: payerTokenAccount,
        vaultTokenAccount: vaultUsdcAccount,
      })
      .signers([payer])
      .rpc();

    console.log("Signature:", tx);
    const afterBalance = await provider.connection.getTokenAccountBalance(vaultUsdcAccount);
    expect(Number(afterBalance.value.amount)).to.equal(1_000_000_000);
  });

  it("Claim", async () => {
    console.log("Claim the asset...");
     
    const tx = await program.methods
      .claim()
      .accounts({
        recipient: recipient.publicKey,
        vault: vaultPda,
        recipientTokenAccount: recipientTokenAccount,
        vaultTokenAccount: vaultUsdcAccount,
      })
      .signers([recipient])
      .rpc();

    console.log("Signature:", tx);
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultUsdcAccount);
    const recipientBalance = await provider.connection.getTokenAccountBalance(recipientTokenAccount);

    expect(Number(vaultBalance.value.amount)).to.equal(0);
    expect(Number(recipientBalance.value.amount)).to.equal(1_000_000_000);
  });
});

