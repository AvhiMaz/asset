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
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

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
  let recipient: anchor.web3.Keypair;
  let unlockTime: anchor.BN;
  let assetType: any;
  let assetReference: string;

  let tokenMint: PublicKey;

before(async () => {
  recipient = anchor.web3.Keypair.generate();
  unlockTime = new anchor.BN(Math.floor(Date.now() / 1000) - 60);
  assetType = { usdc: {} };
  assetReference = "kuchbhidesaktahainig";

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

  vaultUsdcAccount = await getAssociatedTokenAddress(
    tokenMint,
    vaultPda,
    true
  );

  payerTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    payer.publicKey,
    false
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
});
  it("initializes vault!", async () => {
    console.log("Initializing Vault...");

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

    console.log("Vault Initialized Tx:", tx);

    const vaultData = await program.account.vault.fetch(vaultPda);

    expect(vaultData.creator.toBase58()).to.equal(payer.publicKey.toBase58());
    expect(vaultData.recipient.toBase58()).to.equal(recipient.publicKey.toBase58());
    expect(vaultData.unlockTime.toNumber()).to.equal(unlockTime.toNumber());
    expect(vaultData.assetReference).to.equal(assetReference);
    expect(vaultData.isClaimed).to.be.false;

    console.log("Vault Initialized");
  });
  it("transfers USDC into vault!", async () => {
    console.log("Transferring USDC to vault...");

    const beforeBalance = await provider.connection.getTokenAccountBalance(vaultUsdcAccount);
    console.log("Before Transfer Vault USDC Balance:", beforeBalance.value.amount);

    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      payerTokenAccount,
      payer,
      1_000_000_000 
    );
    console.log("Minted 1000 USDC to payer.");

    const payerBalanceAfterMint = await provider.connection.getTokenAccountBalance(payerTokenAccount);
    console.log("After Mint Payer USDC Balance:", payerBalanceAfterMint.value.amount);

    const tx = await program.methods
      .transfer(new anchor.BN(1_000_000_000)) 
      .accounts({
        vault: vaultPda,
        creatorTokenAccount: payerTokenAccount,
        vaultTokenAccount: vaultUsdcAccount,
      })
      .signers([payer])
      .rpc();

    console.log("USDC Transferred Tx:", tx);

    const afterBalance = await provider.connection.getTokenAccountBalance(vaultUsdcAccount);
    console.log("After Transfer Vault USDC Balance:", afterBalance.value.amount);

    expect(Number(afterBalance.value.amount)).to.equal(1_000_000_000);
    console.log("USDC Transfer Successful");    
  });

  it("Claim - Vault to Recipient", async () => {
    let recipientTokenAccount: PublicKey;

    recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipient.publicKey,
    );

    try {
      const accountInfo = await provider.connection.getAccountInfo(recipientTokenAccount);
      if (!accountInfo) {
        await createAssociatedTokenAccount(
          provider.connection,
          payer,
          tokenMint,
          recipient.publicKey
        );
        console.log("Recipient Token Account Created:", recipientTokenAccount.toBase58());
      }
    } catch (err) {
      console.log("Recipient Token Account Already Exists:", recipientTokenAccount.toBase58());
    }

    const tx = await program.methods.claim()
      .accounts({
        recipient: recipient.publicKey,
        vault: vaultPda,
        recipientTokenAccount: recipientTokenAccount,
        vaultTokenAccount: vaultUsdcAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([recipient])
      .rpc();
    
      console.log("Claim Tx:", tx);
      const afterBalance = await provider.connection.getTokenAccountBalance(vaultUsdcAccount);
      const afterBalanceRecipent = await provider.connection.getTokenAccountBalance(recipientTokenAccount);

      console.log("After Transfer Vault USDC Balance:", afterBalance.value.amount);
      console.log("After Transfer Recipient USDC Balance:", afterBalanceRecipent.value.amount);

      expect(Number(afterBalance.value.amount)).to.equal(0);
      expect(Number(afterBalanceRecipent.value.amount)).to.equal(1_000_000_000);

  });
});

