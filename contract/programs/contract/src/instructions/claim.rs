use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use crate::{errors::VaultError, states::{vault::AssetType, Vault}};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub creator: Signer<'info>, // also the recipient

    #[account(
        mut, 
        has_one = creator, 
        constraint = !vault.is_claimed @ VaultError::AlreadyClaimed,
        constraint = vault.unlock_time <= Clock::get()?.unix_timestamp @ VaultError::VaultLocked
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> Claim<'info> {
    pub fn claim(&mut self) -> Result<()> {
        let vault = &mut self.vault;

        let binding = vault.unlock_time.to_le_bytes();
        let vault_signer_seeds = &[b"vault", vault.creator.as_ref(), binding.as_ref(), &[vault.bump]];
        let signer_seeds = &[&vault_signer_seeds[..]];

        match vault.asset_type {
            AssetType::Sol => {
                let vault_account_info = vault.to_account_info();
                let vault_lamports = **vault_account_info.try_borrow_lamports()?;
                require!(vault_lamports >= vault.asset_amount, VaultError::InsufficientFunds);

                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &vault.to_account_info().key(),
                    &self.creator.to_account_info().key(),
                    vault.asset_amount,
                );
                anchor_lang::solana_program::program::invoke_signed(
                    &ix,
                    &[
                        vault.to_account_info(),
                        self.creator.to_account_info(),
                        self.system_program.to_account_info(),
                    ],
                    signer_seeds,
                )?;

                **vault_account_info.try_borrow_mut_lamports()? -= vault.asset_amount;
            }

            AssetType::Usdc => {
                let cpi_accounts = Transfer {
                    from: self.vault_token_account.to_account_info(),
                    to: self.creator_token_account.to_account_info(),
                    authority: vault.to_account_info(),
                };
                let cpi_ctx =
                    CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer_seeds);
                anchor_spl::token::transfer(cpi_ctx, vault.asset_amount)?;
            }

            _ => return Err(VaultError::InvalidAssetType.into()),
        }

        vault.is_claimed = true;
        msg!("Vault claimed successfully.");
        msg!("Vault amount: {}", vault.asset_amount);

        Ok(())
    }
}
