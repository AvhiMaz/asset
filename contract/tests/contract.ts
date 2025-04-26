import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Contract } from "../target/types/contract";
import { expect } from "chai";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  mintTo,
} from "@solana/spl-token";

describe("contract", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Contract as Program<Contract>;
  const provider = anchor.AnchorProvider.env();
  // const payer = provider.wallet as anchor.Wallet;
  const wallet = provider.wallet as anchor.Wallet; // Cast to access 'payer'
  const payer = wallet.payer;

  let recipient: anchor.web3.Keypair;
  let unlock_time: anchor.BN;
  let asset_type: any;
  let asset_reference: string;
  let vaultPDA: PublicKey;
  let vaultBump: number;
  let vaultUsdcAccount: PublicKey;
  let payerTokenAccount: PublicKey;

  const TOKEN_MINT = new PublicKey(
    "2G4GVdgYnY2QUJx15EGvY12k3iCWUTwB3DwLnuqMRrzP"
  );

  before(async () => {
    recipient = anchor.web3.Keypair.generate();
    unlock_time = new anchor.BN(Math.floor(Date.now() / 1000) + 60);
    asset_type = { sol: {} };
    asset_reference = "kuchbhidesaktahainig";

    [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        payer.publicKey.toBuffer(),
        unlock_time.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    vaultUsdcAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      vaultPDA,
      true
    );

    payerTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      payer.publicKey,
      false
    );

    // Ensure vault token account exists
    const accountInfo = await provider.connection.getAccountInfo(
      vaultUsdcAccount
    );
    if (!accountInfo) {
      console.log("Creating Vault USDC Account...");
      const createAtaIx = createAssociatedTokenAccountInstruction(
        payer.publicKey, // Payer
        vaultUsdcAccount, // Vault's USDC token account
        vaultPDA, // Vault PDA as owner
        TOKEN_MINT // USDC mint
      );

      const tx = new Transaction().add(createAtaIx);
      await provider.sendAndConfirm(tx);
      console.log("Vault USDC Account Created:", vaultUsdcAccount.toBase58());
    }
  });

  it("initialized!", async () => {
    console.log("Initializing the vault.......");

    const tx = await program.methods
      .initVault(
        unlock_time,
        vaultBump,
        asset_type,
        asset_reference,
        recipient.publicKey
      )
      .accounts({
        usdcMint: TOKEN_MINT,
        creator: payer.publicKey,
      })
      .rpc();

    console.log("Transaction Signature:", tx);

    const vaultData = await program.account.vault.fetch(vaultPDA);

    expect(vaultData.creator.toBase58()).to.equal(payer.publicKey.toBase58());
    expect(vaultData.recipient.toBase58()).to.equal(
      recipient.publicKey.toBase58()
    );
    expect(vaultData.unlockTime.toNumber()).to.equal(unlock_time.toNumber());
    expect(vaultData.isClaimed).to.be.false;
    expect(vaultData.assetType).to.deep.equal(asset_type);
    expect(vaultData.assetReference).to.equal(asset_reference);

    console.log("Vault Initialized Successfully!");
  });

  it("initialize vault token account", async () => {
    console.log("Checking Vault Token Account...");

    const tx = new Transaction();
    const vaultTokenInfo = await provider.connection.getAccountInfo(
      vaultUsdcAccount
    );

    if (!vaultTokenInfo) {
      console.log("Vault token account not found. Creating...");

      tx.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          vaultUsdcAccount,
          vaultPDA,
          TOKEN_MINT
        )
      );

      await provider.sendAndConfirm(tx);
      console.log("Vault token account created:", vaultUsdcAccount.toBase58());
    } else {
      console.log("Vault token account already exists.");
    }
  });

  it("transfer", async () => {
    console.log("Transferring USDC.......");

    // Get initial user balance
    const userTokenAccountInfo =
      await provider.connection.getTokenAccountBalance(payerTokenAccount);
    console.log("Payer USDC Balance:", userTokenAccountInfo.value.amount);

    // Mint USDC to payer's token account
    await mintTo(
      provider.connection,
      payer,
      TOKEN_MINT,
      payerTokenAccount,
      payer,
      1_000_000_000
    );

    console.log("Airdropped 1000 USDC");

    const tx = await program.methods
      .transfer(new anchor.BN(10_000_000))
      .accounts({
        vault: vaultPDA,
        creatorTokenAccount: payerTokenAccount,
        vaultTokenAccount: vaultUsdcAccount,
      })
      .signers([payer])
      .rpc();

    console.log("Transaction Signature:", tx);

    const vaultData = await program.account.vault.fetch(vaultPDA);
    expect(vaultData.creator.toBase58()).to.equal(payer.publicKey.toBase58());
    expect(vaultData.recipient.toBase58()).to.equal(
      recipient.publicKey.toBase58()
    );
    expect(vaultData.unlockTime.toNumber()).to.equal(unlock_time.toNumber());
    expect(vaultData.isClaimed).to.be.false;
    expect(vaultData.assetType).to.deep.equal(asset_type);
    expect(vaultData.assetReference).to.equal(asset_reference);

    console.log("Vault Data after transfer:", vaultData);
    console.log("Transfer Successful!");

    console.log("Vault PDA:", vaultPDA.toBase58());
    console.log("Vault Token Account:", vaultUsdcAccount.toBase58());
    console.log("Vault Creator:", payer.publicKey.toBase58());
    console.log("Recipient:", recipient.publicKey.toBase58());
    console.log("Payer Token Account:", payerTokenAccount.toBase58());
  });
});
