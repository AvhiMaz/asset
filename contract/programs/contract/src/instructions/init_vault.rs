use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::Token};

use crate::states::{vault::AssetType, Vault};

#[derive(Accounts)]
#[instruction(unlock_time: i64, bump:u8, asset_type: AssetType, asset_reference: String)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", creator.key().as_ref(), unlock_time.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: Only used if `asset_type == Usdc`
    #[account(mut)]
    pub vault_usdc_account: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> InitVault<'info> {
    pub fn init(
        &mut self,
        unlock_time: i64,
        bump: u8,
        asset_type: AssetType,
        asset_reference: String,
    ) -> Result<()> {
        let vault = &mut self.vault;

        vault.creator = self.creator.key();
        vault.unlock_time = unlock_time;
        vault.asset_type = asset_type.clone();
        vault.asset_amount = 0;
        vault.asset_reference = asset_reference;
        vault.is_claimed = false;
        vault.bump = bump;

        if let AssetType::Usdc = asset_type {
            vault.vault_usdc_account = self.vault_usdc_account.key();
        } else {
            vault.vault_usdc_account = Pubkey::default();
        }

        msg!("Vault initialized successfully.");

        Ok(())
    }
}
