use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::{
    errors::VaultError,
    states::{vault::AssetType, Vault},
};

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut, has_one = creator)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

impl<'info> Transfer<'info> {
    pub fn transfer_to_vault(&mut self, amount: u64) -> Result<()> {
        let vault = &mut self.vault;

        require!(!vault.is_claimed, VaultError::AlreadyClaimed);

        require!(
            matches!(vault.asset_type, AssetType::Sol | AssetType::Usdc),
            VaultError::InvalidAssetType
        );

        match vault.asset_type {
            AssetType::Sol => {
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &self.creator.key(),
                    &vault.to_account_info().key(),
                    amount,
                );
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        self.creator.to_account_info(),
                        vault.to_account_info(),
                        self.system_program.to_account_info(),
                    ],
                )?;
            }

            AssetType::Usdc => {
                let cpi_accounts = anchor_spl::token::Transfer {
                    from: self.user_token_account.to_account_info(),
                    to: self.vault_token_account.to_account_info(),
                    authority: self.creator.to_account_info(),
                };
                let cpi_program = self.token_program.to_account_info();
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                anchor_spl::token::transfer(cpi_ctx, amount)?;
            }
            _ => {
                return Err(VaultError::InvalidAssetType.into());
            }
        }

        vault.asset_amount += amount;
        msg!("Successfully ransferred {} to vault", amount);

        Ok(())
    }
}
